const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

/**
 * @desc    رفع صورة محادثة
 * @route   POST /api/upload/image
 * @access  Private
 */
const uploadImage = async (req, res) => {
    // req.file يأتي من multer بعد نجاح الرفع إلى Cloudinary
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { conversationId } = req.body;
    const senderId = req.user._id;
    const imageUrl = req.file.path; // الرابط الآمن من Cloudinary

    try {
        // إنشاء رسالة جديدة من نوع "صورة"
        let newImageMessage = new Message({
            conversationId,
            sender: senderId,
            imageUrl: imageUrl,
            messageType: 'image',
            content: 'Image', // نص بديل
        });
        
        await newImageMessage.save();

        // عمل populate للرسالة قبل إرسالها عبر Socket.IO
        newImageMessage = await Message.findById(newImageMessage._id)
            .populate('sender', 'name _id');

        // تحديث آخر رسالة في المحادثة
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: {
                text: '📷 Image', // إظهار أيقونة في قائمة المحادثات
                sender: senderId,
            }
        });
        
        // --- إرسال الرسالة عبر Socket.IO ---
        // نحتاج إلى الوصول إلى `io` instance هنا
        const io = req.app.get('socketio');
        io.to(conversationId).emit('newMessage', newImageMessage);

        res.status(201).json(newImageMessage);
    } catch (error) {
        console.error("Error saving image message:", error);
        res.status(500).json({ message: 'Server error while saving the image.' });
    }
};

module.exports = { uploadImage };