const express = require('express');
const router = express.Router();
// استيراد getPlan أيضاً
const { generatePlan, getPlan } = require('../controllers/planController');
const { protect } = require('../middleware/authMiddleware');

// المسار الحالي لإنشاء خطة
router.post('/generate', protect, generatePlan);

// المسار الجديد لجلب الخطة (مع الترجمة التلقائية)
router.get('/my-plan', protect, getPlan);

module.exports = router;