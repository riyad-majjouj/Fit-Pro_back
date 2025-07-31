const User = require('../models/User');
const { translateDietPlan, translateWorkoutPlan } = require('../services/geminiService');

const translateExistingPlan = async (req, res) => {
    const { sourceLang, targetLang } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const sourceDietPlan = user.dietPlan[sourceLang];
        const sourceWorkoutPlan = user.workoutPlan[sourceLang];

        if (!sourceDietPlan || !sourceWorkoutPlan) {
            return res.status(400).json({ message: "No source plan to translate." });
        }

        const [translatedDiet, translatedWorkout] = await Promise.all([
            translateDietPlan(sourceDietPlan, targetLang),
            translateWorkoutPlan(sourceWorkoutPlan, targetLang),
        ]);

        user.dietPlan[targetLang] = translatedDiet;
        user.workoutPlan[targetLang] = translatedWorkout;
        await user.save();

        res.status(200).json({
            message: "Plans translated successfully",
            dietPlan: translatedDiet,
            workoutPlan: translatedWorkout,
        });

    } catch (error) {
        console.error("Translation Controller Error:", error);
        res.status(500).json({ message: "Failed to translate plans" });
    }
};

module.exports = { translateExistingPlan };