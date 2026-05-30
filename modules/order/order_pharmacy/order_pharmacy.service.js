import { db } from "../../../config/database.js";

// // --------------------------------pharmacy orders----------------------------------

// export const getPharmacyOrders = (req, res) => {
//   const { pharmacyId } = req.params;

//   if (!pharmacyId) {
//     return res.status(400).json({ message: "Pharmacy ID is required" });
//   }

//   const checkPharmacy = "SELECT * FROM pharmacy WHERE Id = ?";
//   db.execute(checkPharmacy, [pharmacyId], (err, pharmacyResult) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).json({ message: "Server error" });
//     }

//     if (pharmacyResult.length === 0) {
//       return res.status(404).json({ message: "Pharmacy not found" });
//     }

//     // جلب الطلبات مع تفاصيل المستخدم والأدوية
//     const ordersQuery = `
//       SELECT o.Id as orderId, o.OrderDate, o.OrderStatus, o.TotalPrice,
//              u.Id as userId, u.Name as userName, u.Email as userEmail,
//              m.Id as medicineId, m.Name as medicineName, od.Quantity, od.Price
//       FROM orders o
//       JOIN users u ON o.UserId = u.Id
//       JOIN orderdetails od ON od.OrderId = o.Id
//       JOIN medicine m ON od.MedicineId = m.Id
//       WHERE o.PharmacyId = ?
//       ORDER BY o.OrderDate DESC
//     `;

//     db.execute(ordersQuery, [pharmacyId], (err, orders) => {
//       if (err) {
//         console.log(err);
//         return res.status(500).json({ message: "Server error" });
//       }

//       const result = {};
//       orders.forEach(row => {
//         if (!result[row.orderId]) {
//           result[row.orderId] = {
//             orderId: row.orderId,
//             orderDate: row.OrderDate,
//             orderStatus: row.OrderStatus,
//             totalPrice: row.TotalPrice,
//             user: {
//               id: row.userId,
//               name: row.userName,
//               email: row.userEmail
//             },
//             medicines: []
//           };
//         }

//         result[row.orderId].medicines.push({
//           id: row.medicineId,
//           name: row.medicineName,
//           quantity: row.Quantity,
//           price: row.Price
//         });
//       });

//       res.json(Object.values(result));
//     });
//   });
// };


// export const getOrders = async (req, res) => {
//   try {
//     const [rows] = await db.promise().query(`
//       SELECT 
//         o.Id AS order_id,
//         o.UserId,
//         o.PharmacyId,
//         o.TotalPrice,
//         o.OrderStatus,
//         o.OrderDate,

//         od.MedicineId,
//         od.Quantity,
//         od.Price,

//         m.Name AS medicine_name

//       FROM orders o
//       JOIN orderdetails od ON o.Id = od.OrderId
//       JOIN medicine m ON od.MedicineId = m.Id
//       ORDER BY o.Id DESC
//     `);

//     const ordersMap = {};

//     for (const row of rows) {

//       // لو order مش موجود في الماب
//       if (!ordersMap[row.order_id]) {
//         ordersMap[row.order_id] = {
//           order_id: row.order_id,
//           user_id: row.UserId,
//           pharmacy_id: row.PharmacyId,
//           total_price: row.TotalPrice,
//           status: row.OrderStatus,
//           order_date: row.OrderDate,
//           items: []
//         };
//       }

//       // نضيف item
//       ordersMap[row.order_id].items.push({
//         medicine_id: row.MedicineId,
//         name: row.medicine_name,
//         quantity: row.Quantity,
//         price: row.Price
//       });
//     }

//     // نحولها array
//     const result = Object.values(ordersMap);

//     res.json(result);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // // -----------------------update order statues-----------------------------------------------
// export const updateOrderStatus = async (req, res) => {
//   const orderId = req.params.id;
//   const { status } = req.body;

//   try {
//     // 1️⃣ هات الحالة الحالية
//     const [rows] = await db.promise().query(
//       "SELECT OrderStatus FROM orders WHERE Id = ?",
//       [orderId]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const currentStatus = rows[0].OrderStatus;

//     // 2️⃣ rules
//     const validTransitions = {
//       Pending: ["Approved", "Rejected", "Cancelled"],
//       Approved: ["Completed", "Cancelled"],
//       Completed: [],
//       Rejected: [],
//       Cancelled: []
//     };

//     if (!validTransitions[currentStatus].includes(status)) {
//       return res.status(400).json({
//         message: `Cannot change status from ${currentStatus} to ${status}`
//       });
//     }

//     await db.promise().query(
//       "UPDATE orders SET OrderStatus = ? WHERE Id = ?",
//       [status, orderId]
//     );

//     res.json({
//       message: `Order status updated to ${status}`
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };  

//////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////

export const do_order_offline = async (req, res) => {
  
  try {
    const {pharmacy_data} = req
    const { items, phone } = req.body;
    if (!items || items.length === 0 || !phone ) {
      return res.status(400).json({ message: "Missing data" });
    }

    let totalPrice = 0;
    let itemsData = [];

    // 1️⃣ check stock + حساب السعر
    for (const item of items) {
      const [rows] = await db.promise().query(
        "SELECT Price, Quantity FROM pharmacymedicine WHERE PharmacyId = ? AND MedicineId = ?",
        [pharmacy_data.id, item.medicine_id]
      );

      console.log(rows);
      
      if (rows.length === 0) {
        return res.status(400).json({
          message: `Medicine ${item.medicine_id} not found`
        });
      }

      const price = Number(rows[0].Price);
      const stock = Number(rows[0].Quantity);
      const quantity = Number(item.quantity);

      if (isNaN(price) || isNaN(quantity)) {
        return res.status(400).json({ message: "Invalid data" });
      }

      if (stock < quantity) {
        return res.status(400).json({
          message: `Not enough stock for medicine ${item.medicine_id}`
        });
      }

      totalPrice += price * quantity;

      itemsData.push({
        medicine_id: item.medicine_id,
        quantity,
        price
      });
    }

    // 2️⃣ إنشاء order + إضافة phone & address
    const [orderResult] = await db.promise().query(
      `INSERT INTO orders 
      (UserId, PharmacyId, TotalPrice, OrderStatus, UserPhone, UserAddress) 
      VALUES (?, ?, ?, 'Completed', ?, "offline")`,
      [1, pharmacy_data.id, totalPrice, phone]
    );

    const orderId = orderResult.insertId;

    // 3️⃣ حفظ التفاصيل + تحديث المخزون
    for (const item of itemsData) {
      await db.promise().query(
        "INSERT INTO orderdetails (OrderId, MedicineId, Quantity, Price) VALUES (?, ?, ?, ?)",
        [orderId, item.medicine_id, item.quantity, item.price]
      );
    }
    
    // حتة الخصم من المخزن 
    for (const item of itemsData) {
      await db.promise().query(
        "UPDATE pharmacymedicine SET Quantity = Quantity - ? WHERE PharmacyId = ? AND MedicineId = ?",
        [item.quantity, pharmacy_data.id, item.medicine_id]
      );
    }

    // 4️⃣ رجّع تفاصيل الأوردر
    const [orderDetails] = await db.promise().query(
      `
      SELECT 
        m.Name AS medicine_name,
        od.Quantity,
        od.Price,
        (od.Quantity * od.Price) AS total_item_price
      FROM orders o
      JOIN orderdetails od ON o.Id = od.OrderId
      JOIN medicine m ON m.Id = od.MedicineId
      WHERE o.Id = ?
      `,
      [orderId]
    );

    return res.status(201).json({
      message: "Order created successfully",
      order: {
        orderId,
        totalPrice,
        phone,
        address,
        items: orderDetails
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message , stack:error.stack });
  }
};



export const reaset_order_offline = async (req, res) => {
  const connection = db.promise();
  const {pharmacy_data} = req 
  try {
    const { items, orderId } = req.body;
    // items المفروض يكون شكلها: [{ medicine_id: 1, quantity: 2 }, ...]

    await connection.query("START TRANSACTION");

    // 1️⃣ هات بيانات الأوردر
    const [orderRows] = await connection.query(
      "SELECT PharmacyId, TotalPrice FROM orders WHERE Id = ?",
      [orderId]
    );

    if (orderRows.length === 0) {
      throw new Error("Order not found");
    }

    const pharmacy_id = pharmacy_data.id;
    
    if(orderRows[0].PharmacyId != pharmacy_id){
return res.status(400).json({msg:"this order not in this pharmacy"})
    }
    
    let currentTotalPrice = Number(orderRows[0].TotalPrice); // السعر الإجمالي الحالي للأوردر

    let totalReturnedPrice = 0; // إجمالي سعر الأدوية اللي هترجع
    let returnedItemsData = [];

    // 2️⃣ معالجة الأصناف اللي هترجع
    for (const item of items) {
      const medId = item.medicine_id;
      const returnQty = Number(item.quantity);

      // التأكد إن الدوا ده موجود فعلاً في الأوردر
      const [orderItemRows] = await connection.query(
        "SELECT Quantity, Price FROM orderdetails WHERE OrderId = ? AND MedicineId = ?",
        [orderId, medId]
      );

      if (orderItemRows.length === 0) {
        throw new Error(`Medicine ${medId} is not in this order`);
      }

      const orderItemQty = Number(orderItemRows[0].Quantity);
      const orderItemPrice = Number(orderItemRows[0].Price);

      // التأكد إن الكمية اللي عايز يرجعها مش أكبر من اللي اشتراها
      if (returnQty > orderItemQty) {
        throw new Error(`Cannot return ${returnQty} of medicine ${medId}. Only ${orderItemQty} available in order.`);
      }

      // حساب قيمة الدوا المسترجع
      const returnedValue = returnQty * orderItemPrice;
      totalReturnedPrice += returnedValue;

      // 3️⃣ تحديث تفاصيل الأوردر
      if (returnQty === orderItemQty) {
        // لو رجّع الكمية كلها، احذف الصنف من الأوردر
        await connection.query(
          "DELETE FROM orderdetails WHERE OrderId = ? AND MedicineId = ?",
          [orderId, medId]
        );
      } else {
        // لو رجّع جزء بس، قلل الكمية في الأوردر
        await connection.query(
          "UPDATE orderdetails SET Quantity = Quantity - ? WHERE OrderId = ? AND MedicineId = ?",
          [returnQty, orderId, medId]
        );
      }

      // 4️⃣ رجّع الكمية لمخزن الصيدلية
      await connection.query(
        `UPDATE pharmacymedicine 
         SET Quantity = Quantity + ? 
         WHERE PharmacyId = ? AND MedicineId = ?`,
        [returnQty, pharmacy_id, medId]
      );

      // حفظ بيانات الصنف اللي رجع عشان نرد بيها في الـ Response
      returnedItemsData.push({
        medicine_id: medId,
        returned_quantity: returnQty,
        returned_value: returnedValue // سعر الكمية المسترجعة من الصنف ده
      });
    }

    // 5️⃣ تحديث السعر الإجمالي للأوردر (خصم قيمة المرتجعات)
    const newOrderTotal = currentTotalPrice - totalReturnedPrice;
    
    await connection.query(
      "UPDATE orders SET TotalPrice = ? WHERE Id = ?",
      [newOrderTotal, orderId]
    );

    await connection.query("COMMIT");

    // 6️⃣ إرجاع النتيجة
    res.json({
      message: "Items returned successfully",
      returned_items: returnedItemsData, // الأصناف اللي رجعت بسعرها
      total_returned_value: totalReturnedPrice, // إجمالي الفلوس اللي المفروض ترجع للعميل
      new_order_total: newOrderTotal // سعر الأوردر الجديد بعد الخصم
    });

  } catch (error) {
    await connection.query("ROLLBACK");
    console.error(error);

    res.status(500).json({
      message: error.message, 
      stack: error.stack
    });
  }
};