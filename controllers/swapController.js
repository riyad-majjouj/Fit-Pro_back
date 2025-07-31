const User = require('../models/User');
const Food = require('../models/Food');
const { getEquivalentItem } = require('../services/geminiService');

const swapDietItem = async (req, res) => {
    const { mealId, itemToSwap } = req.body; // mealId هو اسم الوجبة، itemToSwap هو العنصر الكامل
    const lang = req.query.lang;

    if (!mealId || !itemToSwap || !lang) {
        return res.status(400).json({ message: "Meal ID, item to swap, and language are required." });
    }

    try {
        const user = await User.findById(req.user._id);
        const originalFoodData = await Food.findById(itemToSwap.foodId).populate('alternatives');

        if (!originalFoodData || originalFoodData.alternatives.length === 0) {
            return res.status(404).json({ message: "No alternatives found for this item." });
        }

        // اختيار بديل عشوائي
        const alternatives = originalFoodData.alternatives;
        const randomAlternative = alternatives[Math.floor(Math.random() * alternatives.length)];
        
        // استدعاء Gemini للحصول على الكمية والقيم الجديدة
        const newItem = await getEquivalentItem(itemToSwap, randomAlternative);

        // تحديث الخطة الغذائية للمستخدم
        const dietPlan = user.dietPlan[lang];
        const mealToUpdate = dietPlan.meals.find(meal => meal.mealName === mealId);
        if (!mealToUpdate) {
            return res.status(404).json({ message: "Meal not found." });
        }

        const itemIndex = mealToUpdate.items.findIndex(item => item.foodId === itemToSwap.foodId && item.quantity === itemToSwap.quantity);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item to swap not found in the specified meal." });
        }
        
        // استبدال العنصر القديم بالجديد
        mealToUpdate.items[itemIndex] = newItem;

        // إعادة حساب الإجماليات
        dietPlan.totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        dietPlan.meals.forEach(meal => {
            meal.items.forEach(item => {
                dietPlan.totals.calories += item.calories || 0;
                dietPlan.totals.protein += item.protein || 0;
                dietPlan.totals.carbs += item.carbs || 0;
                dietPlan.totals.fat += item.fat || 0;
            });
        });
        
        user.markModified(`dietPlan.${lang}`); // مهم جدًا لإخبار Mongoose أن الكائن قد تغير
        await user.save();

        res.json({
            message: "Item swapped successfully!",
            updatedDietPlan: user.dietPlan[lang]
        });

    } catch (error) {
        console.error("Swap Error:", error);
        res.status(500).json({ message: "Server error during item swap." });
    }
};

module.exports = { swapDietItem };