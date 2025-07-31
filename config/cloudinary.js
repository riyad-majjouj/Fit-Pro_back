const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// إعداد Cloudinary باستخدام المتغيرات من .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// إعداد مساحة التخزين
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'fitpro_chat_images', // اسم المجلد الذي سيتم حفظ الصور فيه
        allowed_formats: ['jpeg', 'png', 'jpg', 'gif']
    }
});

module.exports = {
    cloudinary,
    storage
};