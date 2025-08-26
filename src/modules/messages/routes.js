const express = require('express');
const messageController = require('./controller');
const { authenticateToken } = require('../../middleware/auth');
const { validate, validateQuery } = require('../../utils/validators');
const { 
  messageSchema, 
  editMessageSchema, 
  getMessagesSchema 
} = require('../../utils/validators');

const router = express.Router();

// Chat routes
// GET /api/chats/recent - get recent chats
router.get('/recent', authenticateToken, messageController.getRecentChats);

// Message routes
// GET /api/messages?userId=otherId&cursor=ts - get messages between users
router.get('/', authenticateToken, validateQuery(getMessagesSchema), messageController.getMessages);

// POST /api/messages - send message
router.post('/', authenticateToken, validate(messageSchema), messageController.sendMessage);

// PUT /api/messages/:id - edit message
router.put('/:id', authenticateToken, validate(editMessageSchema), messageController.editMessage);

// DELETE /api/messages/:id - delete message
router.delete('/:id', authenticateToken, messageController.deleteMessage);

// PUT /api/messages/:id/status - update message status
router.put('/:id/status', authenticateToken, messageController.updateMessageStatus);

module.exports = router;