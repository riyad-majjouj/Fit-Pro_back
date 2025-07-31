const User = require('../models/User');

/**
 * @desc    ترقية حساب المستخدم إلى بريميوم بعد الدفع
 * @route   POST /api/subscriptions/upgrade
 * @access  Private (محمي)
 */
const upgradeToPremium = async (req, res) => {
    try {
        // البيانات القادمة من الفرونت اند بعد عملية الدفع
        const { age, weight, height, gender, goal, activityLevel, phoneNumber } = req.body;

        // التحقق من وجود كل البيانات المطلوبة
        if (!age || !weight || !height || !gender || !goal || !activityLevel || !phoneNumber) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // العثور على المستخدم وتحديث بياناته دفعة واحدة
        const user = await User.findByIdAndUpdate(
            req.user._id, // _id يأتي من الـ middleware
            {
                $set: {
                    subscriptionStatus: 'premium',
                    phoneNumber: phoneNumber,
                    'userData.age': age,
                    'userData.weight': weight,
                    'userData.height': height,
                    'userData.gender': gender,
                    'userData.goal': goal,
                    'userData.activityLevel': activityLevel,
                }
            },
            { new: true, runValidators: true } // `new: true` لإرجاع المستند المحدث
        ).select('-password'); // استثناء كلمة المرور

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        console.log(`User ${user.email} has been upgraded to premium.`);

        res.status(200).json({
            message: 'Account upgraded to premium successfully!',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                subscriptionStatus: user.subscriptionStatus,
            }
        });

    } catch (error) {
        console.error("Error upgrading user to premium:", error);
        res.status(500).json({ message: 'Server error during subscription upgrade.' });
    }
};

module.exports = { upgradeToPremium };