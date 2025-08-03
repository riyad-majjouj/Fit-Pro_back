const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const connectDB = require('../config/db');
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
// ... (بقية استيرادات المسارات)
const stripeController = require('../controllers/stripeController');
const { protect } = require('../middleware/authMiddleware');

connectDB();
const app = express();
app.use(cors());

// --- مسار Webhook (يبقى كما هو مع /api لأنه مسار خاص) ---
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

app.use(express.json());

// --- استخدام المسارات بدون بادئة /api ---
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/plans', planRoutes);
// ... (بقية المسارات بدون /api)
app.post('/stripe/create-checkout-session', protect, stripeController.createCheckoutSession);

// --- نقطة الاختبار الآن في الجذر ---
app.get('/', (req, res) => {
  res.send('Fitness Planner API root is running!');
});

module.exports = app;