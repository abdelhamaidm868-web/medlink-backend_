// locationMiddleware.js

export const extractUserLocation = (req, res, next) => {
  // استقبال الإحداثيات سواء مبعوثة في الـ query (GET) أو الـ body (POST)
  const lat = parseFloat(req.query.lat || req.body.lat);
  const lng = parseFloat(req.query.lng || req.body.lng);

  // التحقق من وجودها وأنها أرقام صحيحة
  if (!lat || isNaN(lat) || !lng || isNaN(lng)) {
    return res.status(400).json({
      success: false,
      msg: "يرجى توفير إحداثيات الموقع (lat, lng) بشكل صحيح للسماح بعرض النتائج الأقرب لك."
    });
  }

  // إضافة الإحداثيات للـ request object عشان الـ controller يقدر يقرأها
  req.userLocation = { lat, lng };
  
  // الانتقال للـ middleware أو الـ controller التالي
  next();
};











///////////////////////////////////////////////////////////////////////////////////////
// controllers/medicineController.js

export const home_getall_medicine = (req, res) => {
  try {
    // 1. استخراج الإحداثيات الجاهزة من الـ Middleware
    const { lat, lng } = req.userLocation;
    const radius = parseFloat(req.query.radius) || 10; // النطاق الافتراضي 10 كيلو

    // 2. استعلام الـ SQL
    const query = `
      SELECT 
        medicine.Name,
        medicine.Id as medicine_id,
        medicine.Manufacturer,
        medicine.Category,
        medicine.Description,
        pharmacymedicine.Price,
        pharmacymedicine.Quantity,
        pharmacy.Name as pharmacy_name,
        pharmacy.Location,
        ( 6371 * acos( cos( radians(?) ) 
          * cos( radians( pharmacy.latitude ) ) 
          * cos( radians( pharmacy.longitude ) - radians(?) ) 
          + sin( radians(?) ) 
          * sin( radians( pharmacy.latitude ) ) ) 
        ) AS distance
      FROM medicine
      JOIN pharmacymedicine 
        ON pharmacymedicine.MedicineId = medicine.Id
      JOIN pharmacy 
        ON pharmacy.Id = pharmacymedicine.PharmacyId
      HAVING distance < ?
      ORDER BY distance ASC;
    `;

    // 3. تمرير الإحداثيات للاستعلام
    db.execute(query, [lat, lng, lat, radius], (error, result) => {
      if (error) return res.status(500).json({ msg: error.message });

      res.status(200).json({ data: result });
    });

  } catch (error) {
    res.status(500).json({ success: false, msg: error.message, stack: error.stack });
  }
};

////////////////////////////////////////////////////////////////////////////////////////////






// routes/medicineRoutes.js
import express from 'express';
import { home_getall_medicine } from '../controllers/medicineController.js';
import { extractUserLocation } from '../middleware/locationMiddleware.js';

const router = express.Router();

// يتم تنفيذ Middleware الموقع أولاً، ثم الـ Controller
router.get('/medicines/nearby', extractUserLocation, home_getall_medicine);

export default router;