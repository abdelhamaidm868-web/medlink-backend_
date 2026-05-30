// createOrder 
import { db } from "../../../config/database.js";
/////////////////////////////////////////////////////////////////////////////////////////
// ---------------------create order-------------------------------------------------------
export const createOrder = async (req, res) => {
  
  try {
    const {user_data} = req 
    const { pharmacy_id, items, phone, address } = req.body;
    if (!pharmacy_id || !items || items.length === 0 || !phone || !address) {
      return res.status(400).json({ message: "Missing data" });
    }

    let totalPrice = 0;
    let itemsData = [];

    // 1️⃣ check stock + حساب السعر
    for (const item of items) {
      const [rows] = await db.promise().query(
        "SELECT Price, Quantity FROM pharmacymedicine WHERE PharmacyId = ? AND MedicineId = ?",
        [pharmacy_id, item.medicine_id]
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
      VALUES (?, ?, ?, 'Pending', ?, ?)`,
      [user_data.id, pharmacy_id, totalPrice, phone, address]
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
    // for (const item of itemsData) {
    //   await db.promise().query(
    //     "UPDATE pharmacymedicine SET Quantity = Quantity - ? WHERE PharmacyId = ? AND MedicineId = ?",
    //     [item.quantity, pharmacy_id, item.medicine_id]
    //   );
    // }

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
        items: orderDetails, 
        user_data : user_data
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message , stack:error.stack });
  }
};


//////////////////////////////////////////////////////////////////////////////////////////////
// ---------------------get order by id-------------------------------------------------------

export const getOrderById = async (req, res) => {
  
  try {
    const { user_data } = req;

    const [rows] = await db.promise().query(`
      SELECT 
        o.Id AS order_id,
        o.UserId,
        o.PharmacyId,
        o.OrderStatus,
        o.OrderDate,

        od.MedicineId,
        od.Quantity,
        od.Price,

        m.Name AS medicine_name,

        SUM(od.Quantity * od.Price) OVER (PARTITION BY o.Id) AS total_price

      FROM orders o
      JOIN orderdetails od ON o.Id = od.OrderId
      JOIN medicine m ON od.MedicineId = m.Id
      WHERE o.UserId = ?;
    `, [user_data.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    const ordersMap = {};

    for (const row of rows) {
      const quantity = Number(row.Quantity);
      const price = Number(row.Price);

      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          order_id: row.order_id,
          user_id: row.UserId,
          pharmacy_id: row.PharmacyId,
          total_price: Number(row.total_price), // ✅ FIX هنا
          status: row.OrderStatus,
          order_date: row.OrderDate,
          items: []
        };
      }

      ordersMap[row.order_id].items.push({
        medicine_id: row.MedicineId,
        name: row.medicine_name,
        quantity,
        price,
        item_total: quantity * price
      });
    }

    res.json(Object.values(ordersMap));

  } catch (error) {
       return res.status(500).json({ message: error.message , stack:error.stack });

  }
};

////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////
// ---------------------cancel order -------------------------------------------------------
export const cancelOrder = async (req, res) => {
  
  try { 
    const {orderId} = req.body;
  const {user_data} = req 


  // 1️⃣ هات order details
    const [details] = await db.promise().query(
      "SELECT Id , PharmacyId , OrderStatus FROM orders WHERE Id  = ? and UserId = ?",
      [orderId , user_data.id]
    );

    if (details.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // // 2️⃣ رجّع stock
    // for (const item of details) {
    //   await db.promise().query(
    //     "UPDATE pharmacymedicine SET Quantity = Quantity + ? WHERE MedicineId = ?",
    //     [item.Quantity, item.MedicineId]
    //   );
    // }


    if (details.OrderStatus=="Completed"){
      return res.status(400).json({msg:"the order go to pharmacy and completed"})
    }


    await db.promise().query(
      "UPDATE orders SET OrderStatus = 'Cancelled' WHERE Id = ?",
      [orderId]
    );

    res.json({
      message: "Order cancelled successfully"
    });

  } catch (error) {
    return res.status(500).json({ message: error.message , stack:error.stack });

  }
};




/////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------update order-----------------------------------------------------
export const editOrder = async (req, res) => {
  
  const connection = db.promise();
  
  try {

    const { items ,orderId } = req.body;
    const {user_data} = req 
  


    await connection.query("START TRANSACTION");

    // 1️⃣ هات بيانات الأوردر
    const [orderRows] = await connection.query(
      "SELECT PharmacyId, OrderStatus FROM orders WHERE Id = ? and UserId = ?",
      [orderId , user_data.id]
    );

    if (orderRows.length === 0) {
      throw new Error("Order not found");
    }

    const pharmacy_id = orderRows[0].PharmacyId;
    const status = orderRows[0].OrderStatus;

    if (status !== "Pending") {
      throw new Error("Cannot edit this order the permission End");
    }

    // // 2️⃣ رجّع stock القديم
    // const [oldItems] = await connection.query(
    //   "SELECT MedicineId, Quantity FROM orderdetails WHERE OrderId = ?",
    //   [orderId]
    // );

    // for (const item of oldItems) {
    //   await connection.query(
    //     `UPDATE pharmacymedicine 
    //      SET Quantity = Quantity + ? 
    //      WHERE PharmacyId = ? AND MedicineId = ?`,
    //     [item.Quantity, pharmacy_id, item.MedicineId]
    //   );
    // }

    await connection.query(
      "DELETE FROM orderdetails WHERE OrderId = ?",
      [orderId]
    );

    // 4️⃣ احسب الجديد + check stock
    let totalPrice = 0;
    let itemsData = [];

    for (const item of items) {
      const [rows] = await connection.query(
        `SELECT Price, Quantity 
         FROM pharmacymedicine 
         WHERE PharmacyId = ? AND MedicineId = ?`,
        [pharmacy_id, item.medicine_id]
      );

      if (rows.length === 0) {
        throw new Error(`Medicine ${item.medicine_id} not found`);
      }

      const price = Number(rows[0].Price);
      const stock = Number(rows[0].Quantity);
      const quantity = Number(item.quantity);

      if (stock < quantity) {
        throw new Error(`Not enough stock for medicine ${item.medicine_id}`);
      }

      totalPrice += price * quantity;

      itemsData.push({
        medicine_id: item.medicine_id,
        quantity,
        price
      });
    }

    // 5️⃣ insert الجديد + خصم stock
    for (const item of itemsData) {
      await connection.query(
        `INSERT INTO orderdetails (OrderId, MedicineId, Quantity, Price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.medicine_id, item.quantity, item.price]
      );
    }

    // for (const item of itemsData) {

    //   await connection.query(
    //     `UPDATE pharmacymedicine 
    //      SET Quantity = Quantity - ? 
    //      WHERE PharmacyId = ? AND MedicineId = ?`,
    //     [item.quantity, pharmacy_id, item.medicine_id]
    //   );
    // }

    // 6️⃣ update total price
    await connection.query(
      "UPDATE orders SET TotalPrice = ? WHERE Id = ?",
      [totalPrice, orderId]
    );

    await connection.query("COMMIT");

    res.json({
      message: "Order updated successfully",
      new_order : itemsData ,
      totalPrice 
    });

  } catch (error) {

    await connection.query("ROLLBACK");
    console.error(error);

    res.status(500).json({
      message: error.message , 
      stack :error.stack
    });
  }
}; 

  