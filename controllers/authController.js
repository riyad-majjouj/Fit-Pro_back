const User = require('../models/User');
const jwt = require('jsonwebtoken');

// دالة مساعدة لإنشاء التوكن (لا تغيير)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * @desc    تسجيل مستخدم جديد
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'المستخدم مسجل بالفعل' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // --- الإصلاح الرئيسي هنا: إضافة subscriptionStatus إلى الرد ---
      // الآن أصبحت بنية الرد متطابقة تمامًا مع بنية رد تسجيل الدخول
      res.status(201).json({
        message: 'تم إنشاء الحساب بنجاح!',
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          subscriptionStatus: user.subscriptionStatus,
          role: user.role , // القيمة الافتراضية 'free'
        }
      });
    } else {
      res.status(400).json({ message: 'بيانات المستخدم غير صالحة' });
    }
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};

/**
 * @desc    تسجيل دخول المستخدم
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { identifier, password } = req.body;
  const email = identifier;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      
      const hasGeneratedPlans = 
        (user.dietPlan?.ar?.meals?.length > 0 || user.dietPlan?.en?.meals?.length > 0);

      res.json({
        message: 'تم تسجيل الدخول بنجاح!',
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          subscriptionStatus: user.subscriptionStatus,
          role: user.role , // إرسال حالة الاشتراك
        },
        hasGeneratedPlans: hasGeneratedPlans
      });
    } else {
      res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};

module.exports = { registerUser, loginUser };