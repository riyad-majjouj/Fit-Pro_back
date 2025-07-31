const express = require('express');
const router = express.Router();
const { upgradeToPremium } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

// هذا المسار محمي ولا يمكن الوصول إليه إلا من قبل مستخدم مسجل
router.post('/upgrade', protect, upgradeToPremium);

module.exports = router;