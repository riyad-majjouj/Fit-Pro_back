const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

/**
 * @desc    إنشاء أو إيجاد محادثة بين المستخدم ومدربه
 * @route   GET /api/chat/conversation
 * @access  Private (للمستخدمين فقط)
 */
const getOrCreateConversation = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);

        if (currentUser.role === 'coach') {
            return res.status(403).json({ message: "Coaches cannot initiate chats this way." });
        }
        
        if (!currentUser.coach) {
            return res.status(404).json({ message: "You have not been assigned a coach yet. This is available for premium users." });
        }

        const coachId = currentUser.coach;
        
        // --- الإصلاح هنا: إضافة _id إلى populate ---
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, coachId] }
        }).populate('participants', 'name role _id');
        
        if (!conversation) {
            conversation = new Conversation({
                participants: [req.user._id, coachId]
            });
            await conversation.save();
            // --- الإصلاح هنا: إضافة _id إلى populate ---
            conversation = await conversation.populate('participants', 'name role _id');
        }

        res.status(200).json(conversation);
    } catch (error) {
        console.error("Error in getOrCreateConversation:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * @desc    جلب كل الرسائل في محادثة معينة
 * @route   GET /api/chat/messages/:conversationId
 * @access  Private
 */
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            // --- الإصلاح الرئيسي هنا: إضافة _id إلى populate ---
            .populate('sender', 'name _id')
            .sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error getting messages:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * @desc    جلب جميع محادثات المدرب
 * @route   GET /api/chat/coach/conversations
 * @access  Private (للمدربين فقط)
 */
const getCoachConversations = async (req, res) => {
    if (req.user.role !== 'coach') {
        return res.status(403).json({ message: "Access denied. Coaches only." });
    }

    try {
        const conversations = await Conversation.find({ participants: req.user._id })
            // --- الإصلاح هنا: إضافة _id إلى populate ---
            .populate('participants', 'name email _id')
            .populate({
                path: 'lastMessage.sender',
                // --- الإصلاح هنا: إضافة _id إلى populate ---
                select: 'name _id'
            })
            .sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (error) {
        console.error("Error fetching coach conversations:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getOrCreateConversation, getMessages, getCoachConversations };