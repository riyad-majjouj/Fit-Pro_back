const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// استيراد الموديلات
const Food = require('./models/Food');
const Exercise = require('./models/Exercise');

dotenv.config();
connectDB();
const foods = [
    // --- Proteins ---
    { _id: "60d5ecb3a3a4b40015a5e3a0", name: { en: 'Chicken Breast', ar: 'صدر دجاج' }, unit: 'g', imageUrl: '/images/foods/chicken.png', alternatives: ["60d5ecb3a3a4b40015a5e3a4", "60d5ecb3a3a4b40015a5e3a1"] },
    { _id: "60d5ecb3a3a4b40015a5e3a1", name: { en: 'Eggs', ar: 'بيض' }, unit: 'piece', imageUrl: '/images/foods/eggs.png', alternatives: ["60d5ecb3a3a4b40015a5e3a0", "60d5ecb3a3a4b40015a5e3a3"] },
    { _id: "60d5ecb3a3a4b40015a5e3a4", name: { en: 'Tuna (canned)', ar: 'تونة' }, unit: 'g', imageUrl: '/images/foods/tuna.png', alternatives: ["60d5ecb3a3a4b40015a5e3a0"] },
    { _id: "60d5ecb3a3a4b40015a5e3a2", name: { en: 'Lentils', ar: 'عدس' }, unit: 'g', imageUrl: '/images/foods/lentils.png', alternatives: [] },
    { _id: "60d5ecb3a3a4b40015a5e3a3", name: { en: 'Greek Yogurt', ar: 'زبادي يوناني' }, unit: 'g', imageUrl: '/images/foods/yogurt.png', alternatives: ["60d5ecb3a3a4b40015a5e3a1"] },
    
    // --- Carbohydrates ---
    { _id: "60d5ecb3a3a4b40015a5e3b0", name: { en: 'White Rice', ar: 'أرز أبيض' }, unit: 'g', imageUrl: '/images/foods/rice.png', alternatives: ["60d5ecb3a3a4b40015a5e3b2", "60d5ecb3a3a4b40015a5e3b3"] },
    { _id: "60d5ecb3a3a4b40015a5e3b1", name: { en: 'Oats', ar: 'شوفان' }, unit: 'g', imageUrl: '/images/foods/oats.png', alternatives: ["60d5ecb3a3a4b40015a5e3b0"] },
    { _id: "60d5ecb3a3a4b40015a5e3b2", name: { en: 'Potatoes', ar: 'بطاطس' }, unit: 'g', imageUrl: '/images/foods/potatoes.png', alternatives: ["60d5ecb3a3a4b40015a5e3b0", "60d5ecb3a3a4b40015a5e3b3"] },
    { _id: "60d5ecb3a3a4b40015a5e3b3", name: { en: 'Whole Wheat Bread', ar: 'خبز أسمر' }, unit: 'slice', imageUrl: '/images/foods/bread.png', alternatives: ["60d5ecb3a3a4b40015a5e3b0", "60d5ecb3a3a4b40015a5e3b2"] },

    // --- (بقية الأطعمة بدون بدائل حالياً للتبسيط) ---
    { _id: "60d5ecb3a3a4b40015a5e3c0", name: { en: 'Olive Oil', ar: 'زيت زيتون' }, unit: 'ml', imageUrl: '/images/foods/oil.png', alternatives: [] },
    { _id: "60d5ecb3a3a4b40015a5e3c1", name: { en: 'Almonds', ar: 'لوز' }, unit: 'g', imageUrl: '/images/foods/almonds.png', alternatives: [] },
    { _id: "60d5ecb3a3a4b40015a5e3c2", name: { en: 'Avocado', ar: 'أفوكادو' }, unit: 'piece', imageUrl: '/images/foods/avocado.png', alternatives: [] },
    { _id: "60d5ecb3a3a4b40015a5e3d0", name: { en: 'Apple', ar: 'تفاح' }, unit: 'piece', imageUrl: '/images/foods/apple.png', alternatives: ["60d5ecb3a3a4b40015a5e3d1"] },
    { _id: "60d5ecb3a3a4b40015a5e3d1", name: { en: 'Banana', ar: 'موز' }, unit: 'piece', imageUrl: '/images/foods/banana.png', alternatives: ["60d5ecb3a3a4b40015a5e3d0"] },
    { _id: "60d5ecb3a3a4b40015a5e3d2", name: { en: 'Broccoli', ar: 'بروكلي' }, unit: 'g', imageUrl: '/images/foods/broccoli.png', alternatives: ["60d5ecb3a3a4b40015a5e3d3"] },
    { _id: "60d5ecb3a3a4b40015a5e3d3", name: { en: 'Spinach', ar: 'سبانخ' }, unit: 'g', imageUrl: '/images/foods/spinach.png', alternatives: ["60d5ecb3a3a4b40015a5e3d2"] },
];

const exercises = [
  // Chest
  { _id: "60d5f0bda3a4b40015a5e4a0", name: { en: 'Bench Press', ar: 'بنش برس (ضغط البار)' }, type: 'weight_lifting', targetMuscle: 'chest', videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg' },
  { _id: "60d5f0bda3a4b40015a5e4a1", name: { en: 'Push-up', ar: 'تمرين الضغط' }, type: 'bodyweight', targetMuscle: 'chest', videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4' },
  // Back
  { _id: "60d5f0bda3a4b40015a5e4b0", name: { en: 'Dumbbell Row', ar: 'سحب دمبل (تجديف)' }, type: 'weight_lifting', targetMuscle: 'back', videoUrl: 'https://www.youtube.com/watch?v=pYcpY20QaE8' },
  { _id: "60d5f0bda3a4b40015a5e4b1", name: { en: 'Pull-up', ar: 'تمرين العقلة' }, type: 'bodyweight', targetMuscle: 'back', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
  // Legs
  { _id: "60d5f0bda3a4b40015a5e4c0", name: { en: 'Barbell Squat', ar: 'سكوات بالبار' }, type: 'weight_lifting', targetMuscle: 'legs', videoUrl: 'https://www.youtube.com/watch?v=bEv6CCg2BC8' },
  { _id: "60d5f0bda3a4b40015a5e4c1", name: { en: 'Lunge', ar: 'تمرين الطعن' }, type: 'bodyweight', targetMuscle: 'legs', videoUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U' },
  // Shoulders
  { _id: "60d5f0bda3a4b40015a5e4d0", name: { en: 'Overhead Press', ar: 'رفرفة الأكتاف بالبار' }, type: 'weight_lifting', targetMuscle: 'shoulders', videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI' },
  { _id: "60d5f0bda3a4b40015a5e4d1", name: { en: 'Pike Push-up', ar: 'ضغط البايك' }, type: 'bodyweight', targetMuscle: 'shoulders', videoUrl: 'https://www.youtube.com/watch?v=Qx0b2_i8i2c' },
  // Biceps
  { _id: "60d5f0bda3a4b40015a5e4e0", name: { en: 'Dumbbell Bicep Curl', ar: 'مرجحة الدمبل للبايسبس' }, type: 'weight_lifting', targetMuscle: 'biceps', videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo' },
  { _id: "60d5f0bda3a4b40015a5e4e1", name: { en: 'Chin-up', ar: 'عقلة (قبضة ضيقة)' }, type: 'bodyweight', targetMuscle: 'biceps', videoUrl: 'https://www.youtube.com/watch?v=brhRXlOhsAM' },
  // Triceps
  { _id: "60d5f0bda3a4b40015a5e4f0", name: { en: 'Tricep Dips (on bench)', ar: 'تمرين الغطس للترايسبس' }, type: 'bodyweight', targetMuscle: 'triceps', videoUrl: 'https://www.youtube.com/watch?v=0326dy_-CzM' },
  { _id: "60d5f0bda3a4b40015a5e4f1", name: { en: 'Skull Crusher', ar: 'تمرين سحق الجمجمة' }, type: 'weight_lifting', targetMuscle: 'triceps', videoUrl: 'https://www.youtube.com/watch?v=d_KZxkY_0cM' },
  // Abs
  { _id: "60d5f0bda3a4b40015a5e500", name: { en: 'Cable Crunch', ar: 'تمرين البطن بالكابل' }, type: 'weight_lifting', targetMuscle: 'abs', videoUrl: 'https://www.youtube.com/watch?v=vM-B0wg2HkM' },
  { _id: "60d5f0bda3a4b40015a5e501", name: { en: 'Plank', ar: 'تمرين البلانك' }, type: 'bodyweight', targetMuscle: 'abs', videoUrl: 'https://www.youtube.com/watch?v=pDdk2T6G3fA' },
];

const importData = async () => {
    try {
        await Food.deleteMany();
        await Exercise.deleteMany();

        await Food.insertMany(foods);
        await Exercise.insertMany(exercises);

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

const destroyData = async () => {
    try {
        await Food.deleteMany();
        await Exercise.deleteMany();
        console.log('Data Destroyed Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}