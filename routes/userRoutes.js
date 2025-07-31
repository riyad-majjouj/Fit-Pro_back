const express = require('express');
const router = express.Router();
const { updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// استخدمنا protect middleware هنا لضمان أن المستخدم مسجل دخوله
router.route('/profile').put(protect, updateUserProfile);

module.exports = router;