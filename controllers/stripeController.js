const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * @desc    إنشاء جلسة دفع Stripe
 * @route   POST /api/stripe/create-checkout-session
 * @access  Private
 */
const createCheckoutSession = async (req, res) => {
    try {
        const { formData } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // إنشاء جلسة الدفع
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: user.email,
            line_items: [
                {
                    // هام: استبدل هذا بـ Price ID الحقيقي من لوحة تحكم Stripe
                    price: 'price_1RqakaAz1Q7Wbrbc6UF2naAd', 
                    quantity: 1,
                },
            ],
            // الأهم: إرفاق كل البيانات التي سنحتاجها بعد الدفع الناجح
            metadata: {
                userId: user._id.toString(),
                age: formData.age,
                weight: formData.weight,
                height: formData.height,
                gender: formData.gender,
                goal: formData.goal,
                activityLevel: formData.activityLevel,
                phoneNumber: formData.phoneNumber,
            },
            success_url: `${process.env.CLIENT_URL}/payment-success`,
            cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
        });

        res.json({ url: session.url }); // إرسال رابط الدفع إلى الفرونت اند

    } catch (error) {
        console.error("Stripe session creation error:", error);
        res.status(500).json({ message: "Failed to create Stripe session" });
    }
};

/**
 * @desc    استقبال Webhook من Stripe وتأكيد الاشتراك وتعيين المدرب
 * @route   POST /api/stripe/webhook
 * @access  Public (يستقبله Stripe مباشرة)
 */
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // التعامل فقط مع الحدث الذي يهمنا: إتمام جلسة الدفع
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        console.log('✅ Payment successful for session:', session.id);
        
        // استعادة كل البيانات التي أرفقناها في metadata
        const { userId, age, weight, height, gender, goal, activityLevel, phoneNumber } = session.metadata;

        try {
            // --- المنطق الجديد لتعيين المدرب الشاغر ---

            // 1. ابحث عن كل المدربين الذين لم يصلوا إلى الحد الأقصى من العملاء
            const availableCoaches = await User.find({ 
                role: 'coach',
                $expr: { $lt: [ { $size: "$clients" }, "$maxClients" ] } 
            });

            if (availableCoaches.length === 0) {
                console.error(`CRITICAL: No available coaches for new user ${userId}. All coaches might be at full capacity.`);
                // هنا يجب إرسال تنبيه للمشرف (عبر إيميل أو خدمة أخرى)
                // سنقوم بترقية المستخدم بدون مدرب حاليًا، ويمكن للمشرف تعيينه يدويًا لاحقًا
                await User.findByIdAndUpdate(userId, { /* ... تحديث بيانات المستخدم بدون مدرب ... */ });
                return res.status(200).json({ received: true, warning: "User upgraded but no coach assigned." });
            }

            // 2. اختر مدربًا بشكل عشوائي من قائمة المدربين المتاحين
            const randomCoach = availableCoaches[Math.floor(Math.random() * availableCoaches.length)];
            console.log(`Assigning user ${userId} to coach ${randomCoach.email}`);

            // 3. قم بتحديث بيانات المستخدم وتعيين المدرب له
            const updatedUser = await User.findByIdAndUpdate(userId, {
                $set: {
                    subscriptionStatus: 'premium',
                    coach: randomCoach._id, // <-- تعيين المدرب
                    phoneNumber: phoneNumber,
                    'userData.age': age,
                    'userData.weight': weight,
                    'userData.height': height,
                    'userData.gender': gender,
                    'userData.goal': goal,
                    'userData.activityLevel': activityLevel,
                }
            }, { new: true });

            // 4. أضف هذا المستخدم إلى قائمة عملاء المدرب
            await User.findByIdAndUpdate(randomCoach._id, {
                $push: { clients: updatedUser._id }
            });
            
            console.log(`User ${userId} successfully upgraded and assigned to coach ${randomCoach._id}.`);

        } catch (dbError) {
            console.error(`DATABASE ERROR after payment for user ${userId}:`, dbError);
            // يجب إرسال تنبيه للمشرف فورًا لأن الدفع تم لكن الترقية فشلت
        }
    }

    // أرسل ردًا ناجحًا إلى Stripe لتأكيد استلام الحدث
    res.json({ received: true });
};

module.exports = { createCheckoutSession, handleWebhook };

