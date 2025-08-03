const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const connectDB = require('../config/db');
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const planRoutes = require('../routes/planRoutes');
const swapRoutes = require('../routes/swapRoutes');
const translateRoutes = require('../routes/translateRoutes');
const subscriptionRoutes = require('../routes/subscriptionRoutes');
const coachRoutes = require('../routes/coachRoutes');
const uploadRoutes = require('../routes/uploadRoutes');

// --- الإصلاح الرئيسي هنا: استيراد stripeController بالكامل ---
const stripeController = require('../controllers/stripeController');
// --------------------------------------------------------

const { protect } = require('../middleware/authMiddleware');

connectDB();
const app = express();
app.use(cors());

// مسار Webhook يستخدم الدالة مباشرة من الكائن المستورد
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

app.use(express.json());

// استخدام المسارات مع البادئة /api
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/upload', uploadRoutes);

// مسار Stripe الآخر يستخدم الدالة مباشرة من الكائن المستورد
app.post('/api/stripe/create-checkout-session', protect, stripeController.createCheckoutSession);


// نقطة وصول أساسية للاختبار
app.get('/api', (req, res) => {
  res.send('Fitness Planner API is running successfully!');
});

// Vercel يتولى تشغيل الخادم
if (process.env.NODE_ENV === 'development') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// تصدير التطبيق لـ Vercel
module.exports = app;