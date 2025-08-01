const express = require('express');
const router = express.Router();
const { getMyClients } = require('../controllers/coachController');
const { protect } = require('../middleware/authMiddleware');

// هذا المسار محمي ويتطلب تسجيل الدخول
router.get('/clients', protect, getMyClients);

module.exports = router;