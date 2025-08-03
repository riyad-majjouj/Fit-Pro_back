const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const connectDB = require('../config/db');
const allRoutes = require('../routes/index'); // <-- استيراد المجمع
const stripeController = require('../controllers/stripeController');

connectDB();
const app = express();
app.use(cors());

// مسار Webhook يبقى منفصلاً لأنه يحتاج لمعالجة خاصة
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

app.use(express.json());

// --- استخدام مجمع المسارات ---
// كل المسارات (auth, users, plans, etc.) معرفة الآن تحت /api
app.use('/api', allRoutes);

// نقطة وصول أساسية للاختبار
app.get('/api', (req, res) => {
    res.send('Fitness Planner API root is running!');
});

// Vercel يتولى تشغيل الخادم
if (process.env.NODE_ENV === 'development') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// تصدير التطبيق لـ Vercel
module.exports = app;