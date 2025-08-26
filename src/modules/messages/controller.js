const messageService = require('./service');
const logger = require('../../utils/logger');

const getRecentChats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const recentChats = await messageService.getRecentChats(userId);

    res.status(200).json({
      success: true,
      message: 'Recent chats retrieved successfully',
      data: recentChats
    });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { userId, cursor, limit = 50 } = req.query;
    const currentUserId = req.user.id;
    
    const messages = await messageService.getMessages(
      currentUserId, 
      parseInt(userId), 
      cursor, 
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, type, text, imageBase64 } = req.body;
    const senderId = req.user.id;
    
    const message = await messageService.sendMessage({
      senderId,
      receiverId,
      type,
      text,
      imageBase64
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

const editMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text, imageBase64 } = req.body;
    const userId = req.user.id;
    
    const updatedMessage = await messageService.editMessage(
      parseInt(id), 
      userId, 
      { text, imageBase64 }
    );

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you are not authorized to edit it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: updatedMessage
    });
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const success = await messageService.deleteMessage(parseInt(id), userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you are not authorized to delete it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    
    if (!['delivered', 'seen'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be either "delivered" or "seen"'
      });
    }
    
    const success = await messageService.updateMessageStatus(parseInt(id), userId, status);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you are not authorized to update its status'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecentChats,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  updateMessageStatus
};