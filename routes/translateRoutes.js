const express = require('express');
const router = express.Router();
const { translateExistingPlan } = require('../controllers/translateController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, translateExistingPlan);

module.exports = router;