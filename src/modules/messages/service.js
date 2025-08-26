const messageDao = require('./dao');
const userService = require('../users/service');
const logger = require('../../utils/logger');

const getRecentChats = async (userId) => {
  const chats = await messageDao.getRecentChats(userId);
  
  // Get user details for each chat
  const chatsWithUsers = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.user1_id === userId ? chat.user2_id : chat.user1_id;
      const otherUser = await userService.getUserById(otherUserId);
      
      return {
        id: chat.id,
        user: {
          id: otherUser.id,
          username: otherUser.username,
          profilePicture: otherUser.profile_picture,
          isOnline: !!otherUser.is_online,
          lastSeen: otherUser.last_seen
        },
        lastMessage: {
          text: chat.last_message_text,
          type: chat.last_message_type,
          time: chat.last_message_time
        }
      };
    })
  );

  return chatsWithUsers;
};

const getMessages = async (userId1, userId2, cursor, limit = 50) => {
  const messages = await messageDao.getMessages(userId1, userId2, cursor, limit);
  
  return {
    messages: messages.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      type: msg.message_type,
      text: msg.message_text,
      image: msg.message_image,
      isDeleted: !!msg.is_deleted,
      isEdited: !!msg.is_edited,
      status: msg.status,
      createdAt: msg.created_at,
      updatedAt: msg.updated_at
    })),
    hasMore: messages.length === limit,
    nextCursor: messages.length > 0 ? messages[messages.length - 1].created_at : null
  };
};

const sendMessage = async (messageData) => {
  const { senderId, receiverId, type, text, imageBase64 } = messageData;
  
  // Validate that receiver exists
  const receiver = await userService.getUserById(receiverId);
  if (!receiver) {
    throw new Error('Receiver not found');
  }

  // Create message
  const messageId = await messageDao.createMessage({
    sender_id: senderId,
    receiver_id: receiverId,
    message_type: type,
    message_text: text || null,
    message_image: imageBase64 || null
  });

  // Update or create recent chat
  await messageDao.upsertRecentChat({
    user1_id: Math.min(senderId, receiverId),
    user2_id: Math.max(senderId, receiverId),
    last_message_text: type === 'text' ? text : 'Image',
    last_message_type: type,
    last_message_time: new Date()
  });

  // Get the created message
  const message = await messageDao.getMessageById(messageId);
  
  logger.info('Message sent:', { messageId, senderId, receiverId, type });

  return {
    id: message.id,
    senderId: message.sender_id,
    receiverId: message.receiver_id,
    type: message.message_type,
    text: message.message_text,
    image: message.message_image,
    isDeleted: !!message.is_deleted,
    isEdited: !!message.is_edited,
    status: message.status,
    createdAt: message.created_at,
    updatedAt: message.updated_at
  };
};

const editMessage = async (messageId, userId, updateData) => {
  // Check if message exists and user is the sender
  const message = await messageDao.getMessageById(messageId);
  
  if (!message || message.sender_id !== userId) {
    return null;
  }

  // Update message
  await messageDao.updateMessage(messageId, {
    message_text: updateData.text,
    message_image: updateData.imageBase64,
    is_edited: 1
  });

  // Get updated message
  const updatedMessage = await messageDao.getMessageById(messageId);
  
  logger.info('Message edited:', { messageId, userId });

  return {
    id: updatedMessage.id,
    senderId: updatedMessage.sender_id,
    receiverId: updatedMessage.receiver_id,
    type: updatedMessage.message_type,
    text: updatedMessage.message_text,
    image: updatedMessage.message_image,
    isDeleted: !!updatedMessage.is_deleted,
    isEdited: !!updatedMessage.is_edited,
    status: updatedMessage.status,
    createdAt: updatedMessage.created_at,
    updatedAt: updatedMessage.updated_at
  };
};

const deleteMessage = async (messageId, userId) => {
  // Check if message exists and user is the sender
  const message = await messageDao.getMessageById(messageId);
  
  if (!message || message.sender_id !== userId) {
    return false;
  }

  // Soft delete message
  await messageDao.updateMessage(messageId, { is_deleted: 1 });
  
  logger.info('Message deleted:', { messageId, userId });
  
  return true;
};

const updateMessageStatus = async (messageId, userId, status) => {
  // Check if message exists and user is the receiver
  const message = await messageDao.getMessageById(messageId);
  
  if (!message || message.receiver_id !== userId) {
    return false;
  }

  // Update message status
  await messageDao.updateMessage(messageId, { status });
  
  logger.info('Message status updated:', { messageId, userId, status });
  
  return true;
};

const markMessagesAsSeen = async (fromUserId, toUserId) => {
  await messageDao.markMessagesAsSeen(fromUserId, toUserId);
  logger.info('Messages marked as seen:', { fromUserId, toUserId });
};

module.exports = {
  getRecentChats,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  updateMessageStatus,
  markMessagesAsSeen
};