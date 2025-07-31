const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// -------------------- SCHEMAS FOR PLANS (No changes) --------------------
const dietItemSchema = new mongoose.Schema({ foodId: String, quantity: String, calories: Number, protein: Number, carbs: Number, fat: Number }, { _id: false });
const mealSchema = new mongoose.Schema({ mealName: String, items: [dietItemSchema] }, { _id: false });
const totalsSchema = new mongoose.Schema({ calories: Number, protein: Number, carbs: Number, fat: Number }, { _id: false });
const dailyDietPlanSchema = new mongoose.Schema({ totals: totalsSchema, meals: [mealSchema] }, { _id: false });
const workoutDaySchema = new mongoose.Schema({ day: String, exercises: [{ exerciseId: String, sets: Number, reps: String, weight: String, rest: String, _id: false }] }, { _id: false });
const fullWorkoutPlanSchema = new mongoose.Schema({ splitName: String, days: [workoutDaySchema] }, { _id: false });


// -------------------- MAIN USER SCHEMA (With updates) --------------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // --- التحديثات الرئيسية ---
  role: {
    type: String,
    enum: ['user', 'coach'],
    default: 'user'
  },
  // للمستخدم: من هو مدربه
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // للمدرب: قائمة المستخدمين الذين يدربهم
  clients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // للمدرب: الحد الأقصى للمستخدمين
  maxClients: {
    type: Number,
    default: 10
  },
  // -------------------------

  subscriptionStatus: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  userData: {
    age: { type: Number },
    weight: { type: Number },
    height: { type: Number },
    gender: { type: String, enum: ['male', 'female'] },
    goal: { type: String },
    activityLevel: { type: String }
  },
  dietPlan: {
    ar: dailyDietPlanSchema,
    en: dailyDietPlanSchema
  },
  workoutPlan: {
    ar: fullWorkoutPlanSchema,
    en: fullWorkoutPlanSchema
  }
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { next(); }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;