const express = require('express');
const router = express.Router();
const { getOrCreateConversation, getMessages, getCoachConversations } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
router.get('/coach/conversations', protect, getCoachConversations);
router.get('/conversation', protect, getOrCreateConversation);
router.get('/messages/:conversationId', protect, getMessages);

module.exports = router;