const express = require('express');
const router = express.Router();
const { swapDietItem } = require('../controllers/swapController');
const { protect } = require('../middleware/authMiddleware');

router.post('/diet-item', protect, swapDietItem);

module.exports = router;