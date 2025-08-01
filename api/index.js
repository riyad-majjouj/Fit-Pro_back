const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

// --- التحديثات هنا ---
const connectDB = require('../config/db');
const stripeRoutes = require('../routes/stripeRoutes');
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const planRoutes = require('../routes/planRoutes');
const swapRoutes = require('../routes/swapRoutes');
const translateRoutes = require('../routes/translateRoutes');
const subscriptionRoutes = require('../routes/subscriptionRoutes');
const coachRoutes = require('../routes/coachRoutes'); // إذا كنت قد أنشأته
const uploadRoutes = require('../routes/uploadRoutes');
// --------------------

connectDB();
const app = express();

// تطبيق CORS أولاً
app.use(cors());

// مسار Webhook الخاص
// ملاحظة: بما أننا في مجلد api، المسار الفعلي سيكون /api/stripe/webhook
// لذا يجب أن يبقى كما هو
const stripeController = require('../controllers/stripeController');
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

// تحليل JSON لبقية المسارات
app.use(express.json());

// استخدام بقية المسارات
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/coach', coachRoutes); // إذا كنت قد أنشأته
app.use('/api/upload', uploadRoutes);

// مسار Stripe الآخر
const { createCheckoutSession } = require('../controllers/stripeController');
const { protect } = require('../middleware/authMiddleware');
app.post('/api/stripe/create-checkout-session', protect, createCheckoutSession);

// نقطة وصول أساسية للاختبار
app.get('/api', (req, res) => {
  res.send('Fitness Planner API is running...');
});

// Vercel يتولى تشغيل الخادم، لذا لا نحتاج إلى app.listen
// ولكن من الجيد إبقاؤه لبيئة التطوير المحلية
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// --- الأهم لـ Vercel ---
// قم بتصدير تطبيق Express ليتمكن Vercel من استخدامه كدالة سيرفرلس
module.exports = app;