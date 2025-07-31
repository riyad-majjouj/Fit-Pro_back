const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
dotenv.config();
const { initSocket } = require('./socket'); 
const connectDB = require('./config/db');
const stripeRoutes = require('./routes/stripeRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const planRoutes = require('./routes/planRoutes');
const swapRoutes = require('./routes/swapRoutes');
const translateRoutes = require('./routes/translateRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
connectDB();

const app = express();
const server = http.createServer(app); // --- إنشاء خادم HTTP من Express ---

// --- تهيئة وتشغيل Socket.IO ---
const io = initSocket(server);
app.set('socketio', io);
// --- الخطوة 1: تطبيق CORS أولاً وقبل كل شيء ---
// الآن كل طلب قادم سيحصل على تصريح CORS
app.use(cors());


// --- الخطوة 2: التعامل مع مسار الـ Webhook بشكل خاص ---
// هذا المسار يجب أن يأتي قبل express.json() لأنه يحتاج للجسم الخام
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
    // استدعاء وحدة التحكم يدويًا أو وضع المنطق هنا
    // للتبسيط، سنستدعي الدالة من stripeRoutes.
    // هذا يتطلب تعديل طفيف في stripeRoutes
    const stripeController = require('./controllers/stripeController');
    stripeController.handleWebhook(req, res);
});


// --- الخطوة 3: تطبيق express.json() لبقية المسارات ---
// هذا سيقوم بتحليل الجسم بصيغة JSON لكل المسارات الأخرى
app.use(express.json());


// --- الخطوة 4: استخدام بقية المسارات الآن ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
// --- تعديل طفيف على مسار stripe: الآن هو لبقية المسارات فقط ---
const { createCheckoutSession } = require('./controllers/stripeController');
const { protect } = require('./middleware/authMiddleware');
app.post('/api/stripe/create-checkout-session', protect, createCheckoutSession);


// نقطة وصول أساسية للاختبار
app.get('/', (req, res) => {
  res.send('Fitness Planner API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`));