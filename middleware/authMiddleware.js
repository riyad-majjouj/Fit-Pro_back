const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // احصل على التوكن من الهيدر (Bearer token)
      token = req.headers.authorization.split(' ')[1];

      // تحقق من التوكن
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // احصل على بيانات المستخدم من التوكن وأرفقها بالطلب
      // استثناء كلمة المرور من البيانات المرفقة
      req.user = await User.findById(decoded.id).select('-password');

      next(); // انتقل إلى الخطوة التالية (وحدة التحكم)
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'غير مصرح لك، التوكن فشل' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'غير مصرح لك، لا يوجد توكن' });
  }
};

module.exports = { protect };