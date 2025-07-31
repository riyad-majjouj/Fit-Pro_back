const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  // نوع التمرين يساعد الذكاء الاصطناعي على بناء خطة متوازنة
  type: {
    type: String,
    enum: ['weight_lifting', 'cardio', 'bodyweight', 'stretching'],
    required: true,
  },
  // العضلة المستهدفة
  targetMuscle: {
    type: String,
    required: true, // مثال: 'chest', 'back', 'legs', 'shoulders'
  },
  videoUrl: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;