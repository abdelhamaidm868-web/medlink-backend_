import jwt from "jsonwebtoken";
import { db } from "../config/database.js";

const auth_middleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({
        msg: "No token you must login fisrt"
      });
    }

    // استخراج التوكن
    const token = authorization.startsWith("Bearer ")
      ? authorization.split(" ")[1]
      : authorization;

    // التحقق من التوكن
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const query = `
      SELECT id, Name, Email, Phone, Location, ProfileImagePath , Role
      FROM users
      WHERE id = ?
    `;

    // 💡 التعديل هنا: تغليف الاستعلام بـ Promise لانتظار النتيجة
    const result = await new Promise((resolve, reject) => {
      db.execute(query, [payload.id], (error, results) => {
        if (error) {
          return reject(error); // في حالة وجود خطأ، نرفض الـ Promise
        }
        resolve(results); // في حالة النجاح، نرجع النتيجة
      });
    });


    let user = null;

    // بما أننا استخدمنا Promise محلي، result ستكون هي البيانات الفعلية مباشرة
    if (Array.isArray(result) && result.length > 0) {
      user = result[0];
    } else if (!Array.isArray(result) && result) {
      user = result; // في حال كانت المكتبة ترجع كائن مباشرة
    }



    if (!user) {
      return res.status(404).json({
        msg: "User not found"
      });
    }

    // حفظ البيانات في الطلب
    req.user_data = user;

    next();

  } catch (error) {
 

    return res.status(500).json({
      msg: error.message,
      stack: error.stack
    });
  }
};

export default auth_middleware;