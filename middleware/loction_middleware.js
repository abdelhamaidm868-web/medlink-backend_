// locationMiddleware.js
 const extractUserLocation = (req, res, next) => {
  // استقبال الإحداثيات سواء مبعوثة في الـ query (GET) أو الـ body (POST)
  const lat = parseFloat(req.query.lat || req.body.lat);
  const lng = parseFloat(req.query.lng || req.body.lng);

  // التحقق من وجودها وأنها أرقام صحيحة
  if (!lat || isNaN(lat) || !lng || isNaN(lng)) {
    return res.status(400).json({
      success: false,
      msg: "please allow to determine yur location "
    });
  }

  // إضافة الإحداثيات للـ request object عشان الـ controller يقدر يقرأها
  req.userLocation = { lat, lng };
  
  // الانتقال للـ middleware أو الـ controller التالي
  next();
};

export default extractUserLocation ;