import { db } from "../../../config/database.js";

// --------------------------------pharmacy orders----------------------------------

export const getPharmacyOrders = (req, res) => {
  const { pharmacyId } = req.params;

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


// ---------------------get all order------------------------------------------------------- 



export const getOrders = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        o.Id AS order_id,
        o.UserId,
        o.PharmacyId,
        o.TotalPrice,
        o.OrderStatus,
        o.OrderDate,

        od.MedicineId,
        od.Quantity,
        od.Price,

        m.Name AS medicine_name

      FROM orders o
      JOIN orderdetails od ON o.Id = od.OrderId
      JOIN medicine m ON od.MedicineId = m.Id
      ORDER BY o.Id DESC
    `);

    const ordersMap = {};

    for (const row of rows) {

      // لو order مش موجود في الماب
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          order_id: row.order_id,
          user_id: row.UserId,
          pharmacy_id: row.PharmacyId,
          total_price: row.TotalPrice,
          status: row.OrderStatus,
          order_date: row.OrderDate,
          items: []
        };
      }

      // نضيف item
      ordersMap[row.order_id].items.push({
        medicine_id: row.MedicineId,
        name: row.medicine_name,
        quantity: row.Quantity,
        price: row.Price
      });
    }

    // نحولها array
    const result = Object.values(ordersMap);

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


//////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
// // -----------------------update order statues-----------------------------------------------
export const updateOrderStatus = async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  try {
    // 1️⃣ هات الحالة الحالية
    const [rows] = await db.promise().query(
      "SELECT OrderStatus FROM orders WHERE Id = ?",
      [orderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentStatus = rows[0].OrderStatus;

    // 2️⃣ rules
    const validTransitions = {
      Pending: ["Approved", "Rejected", "Cancelled"],
      Approved: ["Completed", "Cancelled"],
      Completed: [],
      Rejected: [],
      Cancelled: []
    };

    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${currentStatus} to ${status}`
      });
    }

    await db.promise().query(
      "UPDATE orders SET OrderStatus = ? WHERE Id = ?",
      [status, orderId]
    );

    res.json({
      message: `Order status updated to ${status}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};  