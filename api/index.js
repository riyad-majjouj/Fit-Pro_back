const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const connectDB = require('../config/db');
const stripeRoutes = require('../routes/stripeRoutes');
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const planRoutes = require('../routes/planRoutes');
const swapRoutes = require('../routes/swapRoutes');
const translateRoutes = require('../routes/translateRoutes');
const subscriptionRoutes = require('../routes/subscriptionRoutes');
const coachRoutes = require('../routes/coachRoutes');
const uploadRoutes = require('../routes/uploadRoutes');

connectDB();
const app = express();

app.use(cors());

// --- الإصلاح الرئيسي هنا: إزالة /api من المسارات ---

// مسار Webhook الخاص
const stripeController = require('../controllers/stripeController');
// المسار الكامل سيكون /api/stripe/webhook
app.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

app.use(express.json());

// استخدام بقية المسارات بدون /api
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/plans', planRoutes);
app.use('/swap', swapRoutes);
app.use('/translate', translateRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/coach', coachRoutes);
app.use('/upload', uploadRoutes);

// مسار Stripe الآخر
const { createCheckoutSession } = require('../controllers/stripeController');
const { protect } = require('../middleware/authMiddleware');
// المسار الكامل سيكون /api/stripe/create-checkout-session
app.post('/stripe/create-checkout-session', protect, createCheckoutSession);

// نقطة وصول أساسية للاختبار
// المسار الكامل سيكون /api/
app.get('/', (req, res) => {
  res.send('Fitness Planner API is running...');
});

// Vercel يتولى تشغيل الخادم
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// تصدير تطبيق Express
module.exports = app;