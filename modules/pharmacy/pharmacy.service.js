import bcrypt from "bcrypt";
import { db } from "../../config/database.js";


// ------------------------------- Add Medicine to Pharmacy ------------------ --------------
export const addMedicineToPharmacy = (req, res) => {
  const { pharmacyId, medicineId, price, quantity, expiryDate } = req.body;

  if (!pharmacyId || !medicineId || !price || !quantity || !expiryDate) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const pharmacyQuery = "SELECT * FROM pharmacy WHERE Id = ?";
  db.execute(pharmacyQuery, [pharmacyId], (err, pharmacyResult) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error1" });
    }

    if (pharmacyResult.length === 0) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    const medicineQuery = "SELECT * FROM medicine WHERE Id = ?";
    db.execute(medicineQuery, [medicineId], (err, medicineResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error2" });
      }

      if (medicineResult.length === 0) {
        return res.status(404).json({ message: "Medicine not found" });
      }

      // التحقق إذا الدواء موجود بالفعل في مخزون الصيدلية
      const checkQuery = `
        SELECT * FROM pharmacymedicine
        WHERE PharmacyId = ? AND MedicineId = ?
      `;
      db.execute(checkQuery, [pharmacyId, medicineId], (err, checkResult) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Server error3" });
        }

        if (checkResult.length > 0) {
          // تحديث الكمية والسعر والتاريخ
          const updateQuery = `
            UPDATE pharmacymedicine
            SET Quantity = Quantity + ?, Price = ?, ExpiryDate = ?
            WHERE PharmacyId = ? AND MedicineId = ?
          `;
          db.execute(
            updateQuery,
            [quantity, price, expiryDate, pharmacyId, medicineId],
            (err) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ message: "Server error4" });
              }

              return res.json({ message: "Medicine quantity updated" });
            }
          );
        } else {
          // إضافة الدواء للمخزون
          const insertQuery = `
            INSERT INTO pharmacymedicine
            (PharmacyId, MedicineId, Price, Quantity, ExpiryDate)
            VALUES (?, ?, ?, ?, ?)
          `;
          db.execute(
            insertQuery,
            [pharmacyId, medicineId, price, quantity, expiryDate],
            (err) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ message: "Server error5" });
              }

              return res.status(201).json({ message: "Medicine added to pharmacy" });
            }
          );
        }
      });
    });
  });
};

export const addNewMedicine = (req, res) => {
  let {
    pharmacyId,
    name,
    manufacturer,
    category,
    description,
    price,
    quantity,
    expiryDate
  } = req.body;

  // validation
  if (!pharmacyId || !name || !price || !quantity || !expiryDate) {
    return res.status(400).json({ message: "Missing data" });
  }

  // 🔥 تنظيف الاسم
  name = name.trim().toLowerCase();

  // 1️⃣ check لو موجود أصلاً
  const checkQuery = `
    SELECT Id FROM medicine 
    WHERE LOWER(Name) = LOWER(?)
  `;

  db.execute(checkQuery, [name], (err, result) => {
    if (err) return res.status(500).json({ msg: err.message });

    if (result.length > 0) {
      return res.status(400).json({
        message: "Medicine already exists, use addMedicine endpoint"
      });
    }

    // 2️⃣ add to medicine table
    const insertMedicine = `
      INSERT INTO medicine (Name, Manufacturer, Category, Description)
      VALUES (?, ?, ?, ?)
    `;

    db.execute(
      insertMedicine,
      [name, manufacturer || null, category || null, description || null],
      (err, medResult) => {
        if (err) return res.status(500).json({ msg: err.message });

        const medicineId = medResult.insertId;

        // 3️⃣ add to stock
        const insertStock = `
          INSERT INTO pharmacymedicine
          (PharmacyId, MedicineId, Price, Quantity, ExpiryDate)
          VALUES (?, ?, ?, ?, ?)
        `;

        db.execute(
          insertStock,
          [pharmacyId, medicineId, price, quantity, expiryDate],
          (err) => {
            if (err) return res.status(500).json({ msg: err.message });

            res.status(201).json({
              message: "New medicine added successfully",
              medicineId
            });
          }
        );
      }
    );
  });
};
// ----------------------------------update pharmacy info----------------------------------

export const updatePharmacy = async (req, res) => {
  const { Name, Email, pharmacyId, phone, location, password } = req.body;

  if (!pharmacyId) {
    return res.status(400).json({ message: "Pharmacy ID is required" });
  }

  // ✅ التحقق من وجود الصيدلية
  const checkQuery = "SELECT * FROM pharmacy WHERE Id = ?";
  db.execute(checkQuery, [pharmacyId], async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    let fields = [];
    let values = [];

    // ✅ Name
    if (Name) {
      fields.push("Name = ?");
      values.push(Name);
    }

    // ✅ Email + uniqueness check
    if (Email) {
      const emailCheck = "SELECT Id FROM pharmacy WHERE Email = ? AND Id != ?";

      db.execute(emailCheck, [Email, pharmacyId], async (err, emailResult) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Server error" });
        }

        if (emailResult.length > 0) {
          return res.status(400).json({ message: "Email already exists" });
        }

        // 👇 نكمل باقي التحديث جوه هنا عشان الإيميل يعدي الأول

        fields.push("Email = ?");
        values.push(Email);

        if (phone) {
          fields.push("Phone = ?");
          values.push(phone);
        }

        if (location) {
          fields.push("Location = ?");
          values.push(location);
        }

        if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          fields.push("Password = ?");
          values.push(hashedPassword);
        }

        if (fields.length === 0) {
          return res.status(400).json({ message: "No fields to update" });
        }

        values.push(pharmacyId);

        const updateQuery = `
          UPDATE pharmacy
          SET ${fields.join(", ")}
          WHERE Id = ?
        `;

        db.execute(updateQuery, values, (err) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ message: "Server error" });
          }

          return res.json({ message: "Pharmacy updated successfully" });
        });
      });

    } else {
      // ✅ لو مفيش Email → كمل عادي

      if (phone) {
        fields.push("Phone = ?");
        values.push(phone);
      }

      if (location) {
        fields.push("Location = ?");
        values.push(location);
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        fields.push("Password = ?");
        values.push(hashedPassword);
      }

      if (fields.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      values.push(pharmacyId);

      const updateQuery = `
        UPDATE pharmacy
        SET ${fields.join(", ")}
        WHERE Id = ?
      `;

      db.execute(updateQuery, values, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Server error" });
        }

        return res.json({ message: "Pharmacy updated successfully" });
      });
    }
  });
};
// --------------------------------pharmacy orders----------------------------------

export const getPharmacyOrders = (req, res) => {
  const { pharmacyId } = req.body;

  if (!pharmacyId) {
    return res.status(400).json({ message: "Pharmacy ID is required" });
  }

  const checkPharmacy = "SELECT * FROM pharmacy WHERE Id = ?";
  db.execute(checkPharmacy, [pharmacyId], (err, pharmacyResult) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (pharmacyResult.length === 0) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    // جلب الطلبات مع تفاصيل المستخدم والأدوية
    const ordersQuery = `
      SELECT o.Id as orderId, o.OrderDate, o.OrderStatus, o.TotalPrice,
             u.Id as userId, u.Name as userName, u.Email as userEmail,
             m.Id as medicineId, m.Name as medicineName, od.Quantity, od.Price
      FROM orders o
      JOIN users u ON o.UserId = u.Id
      JOIN orderdetails od ON od.OrderId = o.Id
      JOIN medicine m ON od.MedicineId = m.Id
      WHERE o.PharmacyId = ?
      ORDER BY o.OrderDate DESC
    `;

    db.execute(ordersQuery, [pharmacyId], (err, orders) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
      }

      // ترتيب النتائج لتجميع الأدوية لكل طلب
      const result = {};
      orders.forEach(row => {
        if (!result[row.orderId]) {
          result[row.orderId] = {
            orderId: row.orderId,
            orderDate: row.OrderDate,
            orderStatus: row.OrderStatus,
            totalPrice: row.TotalPrice,
            user: {
              id: row.userId,
              name: row.userName,
              email: row.userEmail
            },
            medicines: []
          };
        }

        result[row.orderId].medicines.push({
          id: row.medicineId,
          name: row.medicineName,
          quantity: row.Quantity,
          price: row.Price
        });
      });

      res.json(Object.values(result));
    });
  });
};

// -------------------------------------------------------------------------------------


export const deletemedicine = (req, res) => {
  const { pharmacy_id, medicine_id, Quantity } = req.body;

  const query = `
    SELECT pharmacymedicine.Quantity 
    FROM pharmacymedicine 
    WHERE PharmacyId = ? AND MedicineId = ?
  `;

  db.execute(query, [pharmacy_id, medicine_id], (error, result) => {
    if (error) return res.json({ msg: error.message });

    if (result.length == 0) {
      return res.status(404).json({ msg: "Medicine not found" });
    }

    const currentQuantity = result[0].Quantity;

    // ❌ لو عايز يحذف أكتر من الموجود
    if (Quantity > currentQuantity) {
      return res.status(400).json({
        msg: "you not have this Quantity of Medicine",
      });
    }

    // ✅ حذف كله
    if (Quantity == currentQuantity) {
      const deleteQuery = `
        DELETE FROM pharmacymedicine 
        WHERE PharmacyId = ? AND MedicineId = ?
      `;

      return db.execute(deleteQuery, [pharmacy_id, medicine_id], (err) => {
        if (err) return res.json({ msg: err.message });

        return res.status(200).json({
          msg: "Delete all medicine Done",
        });
      });
    }

    // ✅ حذف جزء
    const newQuantity = currentQuantity - Quantity;

    const updateQuery = `
      UPDATE pharmacymedicine 
      SET Quantity = ? 
      WHERE PharmacyId = ? AND MedicineId = ?
    `;

    db.execute(updateQuery, [newQuantity, pharmacy_id, medicine_id], (err) => {
      if (err) return res.json({ msg: err.message });

      res.status(200).json({
        msg: "Delete part of medicine Done",
        remaining: newQuantity,
      });
    });
  })}

  ////////////////////////////////////////////////////////////////////////////

  export const getall_medicine = (req, res) => {
  const { pharmacy_id } = req.params;

  const query = `
    SELECT 
      medicine.Name,
      medicine.Category,
      medicine.Description,
      pharmacymedicine.Price,
      pharmacymedicine.Quantity,
      pharmacymedicine.ExpiryDate
    FROM medicine 
    JOIN pharmacymedicine
      ON medicine.Id = pharmacymedicine.MedicineId
    WHERE pharmacymedicine.PharmacyId = ? ;
  `;

  const values = [pharmacy_id];

  db.execute(query, values, (error, result) => {
    if (error) return res.json({ msg: error.message });

    if (result.length != 0) {
      const lowStock = result.filter((med) => med.Quantity < 4);

      let warning = null;

      if (lowStock.length > 0) {
        const names = lowStock.map((med) => med.Name);
        warning = `Low stock for: ${names.join(", ")} is less than 4 `;
      }

      res.status(200).json({
        msg: result,
        warning: warning, 
      });
    } else {
      res.status(404).json({ msg: "No medicines found" });
    }
  });
}

/////////////////////////////////////////////////////////////////

export const search_medicine =(req, res) => {
  const { pharmacy_id  } = req.body;
  const {input} = req.query

 const query = `
SELECT 
  medicine.Name,
  medicine.Id as medicine_id,
  medicine.Category,
  medicine.Description,
  pharmacymedicine.Price,
  pharmacymedicine.Quantity,
  pharmacymedicine.ExpiryDate,

  COUNT(comment.Id) AS comments_count

FROM medicine 

JOIN pharmacymedicine 
  ON medicine.Id = pharmacymedicine.MedicineId

LEFT JOIN comment 
  ON pharmacymedicine.PharmacyId = comment.Pharmacy_id

WHERE pharmacymedicine.PharmacyId = ? 
  AND medicine.Name LIKE ?

GROUP BY medicine.Id;
`;

  const values = [pharmacy_id , `%${input}%`];

  db.execute(query, values, (error, result) => {
    if (error) return res.json({ msg: error.message });

    if (result.length != 0) {
      const lowStock = result.filter((med) => med.Quantity < 4);

      let warning = null;

      if (lowStock.length > 0) {
        const names = lowStock.map((med) => med.Name);
        warning = `⚠️ Low stock for: ${names.join(", ")} is less than 4 `;
      }

      res.status(200).json({
        msg: result,
        warning: warning, // 👈 الرسالة التحذيرية
      });
    } else {
      res.status(404).json({ msg: "No medicines found" });
    }
  });
}


/////////////////////////////////////////////////////////////////////

export const profile_pharmcy = (req, res) => {
  const { pharmacy_id } = req.body;

  if (!pharmacy_id) {
    return res.status(400).json({ message: "Pharmacy ID is required" });
  }

  // 1️⃣ نجيب بيانات الصيدلية
  const pharmacyQuery = `
    SELECT Id, Name, Email, Phone, Location
    FROM pharmacy
    WHERE Id = ?
  `;

  db.execute(pharmacyQuery, [pharmacy_id], (error, pharmacyResult) => {
    if (error) return res.status(500).json({ msg: error.message });

    if (pharmacyResult.length === 0) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    const commentsQuery = `
      SELECT 
        c.Id,
        c.Comm,
        c.User_id,
        u.Name AS user_name
      FROM comment c
      JOIN users u ON c.User_id = u.Id
      WHERE c.Pharmacy_id = ?
      ORDER BY c.Id DESC
    `; 

    db.execute(commentsQuery, [pharmacy_id], (error, commentsResult) => {
      if (error) return res.status(500).json({ msg: error.message });

      // 3️⃣ نرجّع الاتنين مع بعض
      res.json({
        pharmacy: pharmacyResult[0],
        comments: commentsResult
      });
    });
  });
};        