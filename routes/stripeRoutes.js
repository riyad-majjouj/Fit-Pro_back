const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../controllers/stripeController');
const { protect } = require('../middleware/authMiddleware');

// الآن هذا الملف يحتوي فقط على المسار المحمي
router.post('/create-checkout-session', protect, createCheckoutSession);

// لم نعد بحاجة لمسار الـ webhook هنا

module.exports = router;