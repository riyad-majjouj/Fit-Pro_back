const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  // _id سيتم إضافته تلقائيًا عند استخدام الـ seeder
  name: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  unit: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  // --- الحقل الجديد ---
  // مصفوفة من معرفات الأطعمة الأخرى التي تعتبر بدائل
  alternatives: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food'
  }]
}, { timestamps: true });

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;