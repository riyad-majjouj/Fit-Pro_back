const User = require('../models/User');
const Food = require('../models/Food');
const Exercise = require('../models/Exercise');
const { generateDietPlan, generateWorkoutPlan , translateDietPlan, translateWorkoutPlan } = require('../services/geminiService');
/**
 * @desc    إنشاء خطة غذائية ورياضية جديدة
 * @route   POST /api/plans/generate
 * @access  Private
 */
const generatePlan = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }

        const { age, weight, goal } = user.userData;
        if (!age || !weight || !goal) {
            return res.status(400).json({ message: "الرجاء إكمال بيانات ملفك الشخصي أولاً (العمر, الوزن, الهدف)." });
        }

        const { language } = req.body;
        if (!language || !['ar', 'en'].includes(language)) {
            return res.status(400).json({ message: "اللغة مطلوبة ويجب أن تكون 'ar' أو 'en'." });
        }

        const availableFoods = await Food.find({});
        const availableExercises = await Exercise.find({});

        const [dietPlanFromAI, workoutPlanResponse] = await Promise.all([
            generateDietPlan(user.userData, language, availableFoods),
            generateWorkoutPlan(user.userData, language, availableExercises)
        ]);

        // --- الجزء الجديد: حساب الإجماليات بدقة ---
        const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        dietPlanFromAI.meals.forEach(meal => {
            meal.items.forEach(item => {
                totals.calories += item.calories || 0;
                totals.protein += item.protein || 0;
                totals.carbs += item.carbs || 0;
                totals.fat += item.fat || 0;
            });
        });

        // --- بناء كائن الخطة الغذائية الكاملة ---
        const finalDietPlan = {
            totals: totals,
            meals: dietPlanFromAI.meals
        };
        
        console.log("--- DATA TO BE SAVED ---");
        console.log("Diet Plan:", JSON.stringify(finalDietPlan, null, 2));
        console.log("Workout Plan:", JSON.stringify(workoutPlanResponse, null, 2));
        console.log("------------------------");
        
        // حفظ الخطط النهائية في قاعدة البيانات
        user.dietPlan[language] = finalDietPlan;
        user.workoutPlan[language] = workoutPlanResponse;

        await user.save();

        res.status(201).json({
            message: "تم إنشاء خطتك بنجاح!",
            dietPlan: user.dietPlan[language],
            workoutPlan: user.workoutPlan[language]
        });

    } catch (error) {
        console.error("Error in generatePlan controller:", error);
        res.status(500).json({ message: "حدث خطأ أثناء إنشاء الخطة.", error: error.message });
    }
};
const getPlan = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const targetLang = req.query.lang;
        if (!['ar', 'en'].includes(targetLang)) {
            return res.status(400).json({ message: "Valid language ('ar' or 'en') is required" });
        }

        // --- الإصلاح الرئيسي هنا: التحقق من وجود الكائن بدلاً من .length ---
        const dietPlanExists = user.dietPlan && user.dietPlan[targetLang] && user.dietPlan[targetLang].meals?.length > 0;
        const workoutPlanExists = user.workoutPlan && user.workoutPlan[targetLang] && user.workoutPlan[targetLang].days?.length > 0;

        if (dietPlanExists && workoutPlanExists) {
            console.log(`Plan found for language: ${targetLang}. Sending existing plan.`);
            return res.status(200).json({
                dietPlan: user.dietPlan[targetLang],
                workoutPlan: user.workoutPlan[targetLang]
            });
        }

        // إذا كانت الخطة غير موجودة باللغة المطلوبة، لا نترجم هنا.
        // سنترك هذه المهمة للفرونت اند ليقرر ما إذا كان يريد الترجمة أو الإنشاء.
        
        console.log(`No plan found for language: ${targetLang}.`);
        // نرسل 404 مع بيانات إضافية للفرونت اند
        const sourceLang = targetLang === 'ar' ? 'en' : 'ar';
        const sourcePlanExists = user.dietPlan && user.dietPlan[sourceLang] && user.dietPlan[sourceLang].meals?.length > 0;

        return res.status(404).json({ 
            message: `Plan for ${targetLang} not found.`,
            sourcePlanAvailable: sourcePlanExists, // نرسل معلومة للفرونت اند
            sourceLang: sourceLang
        });

    } catch (error) {
        console.error("Error in getPlan:", error);
        res.status(500).json({ message: "Server error while getting plan." });
    }
};

// تحديث الـ exports
module.exports = { generatePlan, getPlan  };