const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
console.log("Stage 1: Basic modules loaded.");

// --- تحميل متغيرات البيئة أولاً ---
dotenv.config();
console.log("Stage 2: Environment variables configured.");

// --- استيراد الوحدات الأخرى ---
const connectDB = require('../config/db');
const authRoutes = require('../routes/authRoutes');
// ... (أضف بقية استيرادات المسارات هنا)
console.log("Stage 3: All routes and DB config imported.");


const app = express();
app.use(cors());
console.log("Stage 4: Express app created and CORS enabled.");

// --- الاتصال بقاعدة البيانات ---
// سنضع هذا داخل دالة async للتعامل مع الأخطاء بشكل أفضل
const startServer = async () => {
    try {
        await connectDB();
        console.log("Stage 5: MongoDB connected successfully.");
    } catch (error) {
        console.error("CRITICAL: Failed to connect to MongoDB.", error);
        // في بيئة السيرفرلس، قد لا نوقف العملية، لكننا سنسجل الخطأ
    }
    
    // --- Middlewares أخرى ---
    app.use(express.json()); // تحليل JSON
    console.log("Stage 6: JSON middleware enabled.");
    
    // --- تعريف المسارات ---
    app.use('/auth', authRoutes);
    // ... (أضف بقية app.use للمسارات هنا)
    console.log("Stage 7: All routes have been defined.");

    // نقطة وصول أساسية للاختبار
    app.get('/', (req, res) => {
        console.log("Root API endpoint [/] was hit!");
        res.send('Fitness Planner API is running...');
    });

    // Vercel لا يستخدم هذا، ولكننا نتركه
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`(This log is for local development only) Server running on port ${PORT}`);
    });
};

// بدء تشغيل الخادم
startServer();

// تصدير التطبيق لـ Vercel
module.exports = app;