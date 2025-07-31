const User = require('../models/User');

// @desc    تحديث بيانات ملف المستخدم
// @route   PUT /api/users/profile
// @access  Private (محمي)
const updateUserProfile = async (req, res) => {
  // نحصل على المستخدم من الـ middleware وليس من قاعدة البيانات مباشرة
  const user = await User.findById(req.user._id);

  if (user) {
    // البيانات القادمة من الواجهة الأمامية
    const { age, weight, height, gender, goal, activityLevel } = req.body;
    
    // تحديث كائن userData داخل موديل المستخدم
    user.userData = {
      age: age || user.userData.age,
      weight: weight || user.userData.weight,
      height: height || user.userData.height,
      gender: gender || user.userData.gender,
      goal: goal || user.userData.goal,
      activityLevel: activityLevel || user.userData.activityLevel,
    };

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      userData: updatedUser.userData,
      message: 'تم تحديث الملف الشخصي بنجاح'
    });
  } else {
    res.status(404).json({ message: 'المستخدم غير موجود' });
  }
};

module.exports = { updateUserProfile };