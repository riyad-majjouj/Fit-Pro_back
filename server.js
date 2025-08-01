const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const connectDB = require('./config/db');

// استيراد وحدات التحكم والمسارات
const stripeController = require('./controllers/stripeController');
const { protect } = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const planRoutes = require('./routes/planRoutes');
const swapRoutes = require('./routes/swapRoutes');
const translateRoutes = require('./routes/translateRoutes');
const coachRoutes = require('./routes/coachRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

connectDB();

const app = express();

// --- الخطوة 1: تطبيق CORS أولاً وقبل كل شيء ---
// هذا يضمن أن كل الردود ستحتوي على الهيدرات الصحيحة للسماح بالوصول
app.use(cors());

// --- الخطوة 2: التعامل مع مسار الـ Webhook بشكل خاص ومنفصل ---
// هذا المسار يجب أن يأتي قبل express.json() لأنه يحتاج للجسم الخام (raw body)
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

// --- الخطوة 3: تطبيق express.json() لتحليل الجسم بصيغة JSON لبقية المسارات ---
app.use(express.json());

// --- الخطوة 4: استخدام بقية المسارات الآن بعد أن تم إعداد body parsers ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/upload', uploadRoutes);

// --- مسار إنشاء جلسة الدفع الآن يتم تعريفه هنا بشكل مباشر ---
app.post('/api/stripe/create-checkout-session', protect, stripeController.createCheckoutSession);

// نقطة وصول أساسية للاختبار
app.get('/', (req, res) => {
  res.send('Fitness Planner API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`));//