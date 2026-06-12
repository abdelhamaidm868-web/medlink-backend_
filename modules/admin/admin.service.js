import { db } from "../../config/database.js";


 export const home_getall_medicine = (req, res) => {
  try {


    const query = `
    SELECT 
    pharmacy.Name AS pharmacy_name,
    pharmacy.id AS pharmacy_id,
    pharmacy.Phone AS pharmacy_phone,
    pharmacy.Rate AS pharmacy_rate,
    IsActive ,
    pharmacy.Location
FROM pharmacy
LEFT JOIN comment
    ON comment.pharmacy_id = pharmacy.id
GROUP BY pharmacy.id
ORDER BY pharmacy.Rate DESC;
    `;

   
    db.execute(query, (error, result) => {
      if (error) return res.status(500).json({ msg: error.message });

      res.status(200).json({ data: result });
    });

  } catch (error) {
    res.status(500).json({ success: false, msg: error.message, stack: error.stack });
  }
};

////////////////////////////////////////////////////////////////////////////////////

export const addNewMedicine = (req, res) => {
  try {
    let { name, manufacturer, category, description } = req.body;

    // validation
    if (!name) {
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
          message: "Medicine already exists, use addMedicine endpoint",
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

          // // 3️⃣ add to stock
          // const insertStock = `
          //   INSERT INTO pharmacymedicine
          //   (PharmacyId, MedicineId, Price, Quantity, ExpiryDate)
          //   VALUES (?, ?, ?, ?, ?)
          // `;

          // db.execute(
          //   insertStock,
          //   [pharmacyId, medicineId, price, quantity, expiryDate],
          //   (err) => {
          //     if (err) return res.status(500).json({ msg: err.message });

          //     res.status(201).json({
          //       message: "New medicine added successfully",
          //       medicineId
          //     });
          //   }
          // );

          res.status(200).json({ msg: "the Medicine add to System success" });
        },
      );
    });
  } catch (error) {
    res.status(500).json({ msg: error.message, stack: error.stack });
  }
};

////////////////////////////////////////////////////////////////////



export const delete_pharmacy = (req, res) => {
  try {
      
  const pharmacy_id = req.params.id;

  const query = `
    DELETE FROM pharmacy
    WHERE Id = ? 
  `;

  db.execute(query, [pharmacy_id], (error, result) => {
    if (error) {
      return res.status(500).json({
        msg: error.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        msg: "pharmacy is not found in system",
      });
    }

    res.status(200).json({
      msg: "Pharmacy deleted successfully",
    });
  });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, stack: error.stack });
  }
};


/////////////////////////////////////////////////////////////////////////////



export const update_acctive_pharmacy = (req, res) => {
  try {
    const  pharmacy_id  = req.params.id;
  

  const query = `
    UPDATE pharmacy
    SET IsActive = CASE 
      WHEN IsActive = 1 THEN 0
      ELSE 1
    END
    WHERE Id = ? 
  `;

  db.execute(query, [pharmacy_id], (error, result) => {
    if (error) return res.status(500).json({ msg: error.message });

    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        msg: "Pharmacy not found ",
      });
    }

    return res.status(200).json({
      msg: "Pharmacy Acctive change successfully",
    });
  });
  } catch (error) {
          res.status(500).json({sucess:false , msg :error.message , stack : error.stack})

  }
};