const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../controllers/stripeController');
const { protect } = require('../middleware/authMiddleware');

// لم نعد بحاجة لـ /api أو /stripe هنا، لأنها معرفة في المجمع
router.post('/create-checkout-session', protect, createCheckoutSession);

// لا يوجد مسار webhook هنا بعد الآن

module.exports = router;