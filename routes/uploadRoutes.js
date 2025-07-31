const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');
const { uploadImage } = require('../controllers/uploadController');

const upload = multer({ storage });

// المسار سيستقبل ملفًا واحدًا اسمه "image"
router.post('/image', protect, upload.single('image'), uploadImage);

module.exports = router;