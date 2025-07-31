const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // --- التحديثات هنا ---
    // المحتوى الآن ليس مطلوبًا، لأن رسالة الصورة قد لا تحتوي على نص
    content: {
        type: String, 
    },
    // حقل جديد لتخزين رابط الصورة
    imageUrl: {
        type: String,
    },
    messageType: {
        type: String,
        enum: ['text', 'image'], // يمكن إضافة 'video' لاحقًا
        default: 'text',
        required: true,
    }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;