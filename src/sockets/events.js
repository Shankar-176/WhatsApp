const messageService = require('../modules/messages/service');
const userService = require('../modules/users/service');
const logger = require('../utils/logger');

const handleJoinChat = async (socket, data, activeUsers) => {
  const { otherUserId } = data;
  const currentUserId = socket.userId;
  
  if (!otherUserId) {
    socket.emit('error', { message: 'otherUserId is required' });
    return;
  }

  // Create a unique room name for the 1:1 chat
  const roomName = getRoomName(currentUserId, otherUserId);
  
  // Join the room
  socket.join(roomName);
  
  logger.info('User joined chat room:', { 
    currentUserId, 
    otherUserId, 
    roomName,
    socketId: socket.id 
  });

  // Notify the user they've joined the room
  socket.emit('chat_joined', { 
    roomName,
    otherUserId,
    message: 'Successfully joined chat'
  });

  // If the other user is online, notify them
  const otherUser = activeUsers.get(otherUserId);
  if (otherUser) {
    socket.to(otherUser.socketId).emit('user_joined_chat', {
      userId: currentUserId,
      username: socket.username,
      roomName
    });
  }
};

const handleSendMessage = async (socket, io, data) => {
  const { to, type, text, imageBase64 } = data;
  const senderId = socket.userId;
  
  if (!to || !type) {
    socket.emit('error', { message: 'Missing required fields: to, type' });
    return;
  }

  if (type === 'text' && !text) {
    socket.emit('error', { message: 'Text is required for text messages' });
    return;
  }

  if (type === 'image' && !imageBase64) {
    socket.emit('error', { message: 'Image data is required for image messages' });
    return;
  }

  try {
    // Save message to database
    const message = await messageService.sendMessage({
      senderId,
      receiverId: to,
      type,
      text,
      imageBase64
    });

    const roomName = getRoomName(senderId, to);
    
    // Emit message to room (including sender for confirmation)
    io.to(roomName).emit('message_received', {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      type: message.type,
      text: message.text,
      image: message.image,
      status: message.status,
      createdAt: message.createdAt,
      isEdited: message.isEdited,
      isDeleted: message.isDeleted
    });

    // Update message status to delivered if receiver is online
    // This would be handled by the receiver's client when they receive the message
    
    logger.info('Message sent via socket:', { 
      messageId: message.id,
      senderId,
      receiverId: to,
      type
    });

  } catch (error) {
    logger.error('Failed to send message via socket:', error);
    socket.emit('error', { message: 'Failed to send message' });
  }
};

const handleTyping = async (socket, io, data, activeUsers) => {
  const { to, isTyping } = data;
  const fromUserId = socket.userId;
  
  if (!to) {
    return;
  }

  // Get the other user's socket if they're online
  const otherUser = activeUsers.get(to);
  if (otherUser) {
    socket.to(otherUser.socketId).emit('typing_status', {
      from: fromUserId,
      username: socket.username,
      isTyping: !!isTyping
    });
  }

  logger.debug('Typing status updated:', { from: fromUserId, to, isTyping });
};

const handleMarkSeen = async (socket, io, data, activeUsers) => {
  const { from } = data;
  const toUserId = socket.userId;
  
  if (!from) {
    socket.emit('error', { message: 'from field is required' });
    return;
  }

  try {
    // Mark all messages from 'from' user as seen
    await messageService.markMessagesAsSeen(from, toUserId);
    
    // Notify the sender that their messages have been seen
    const senderUser = activeUsers.get(from);
    if (senderUser) {
      socket.to(senderUser.socketId).emit('messages_seen', {
        by: toUserId,
        username: socket.username
      });
    }

    logger.info('Messages marked as seen:', { from, to: toUserId });
    
  } catch (error) {
    logger.error('Failed to mark messages as seen:', error);
    socket.emit('error', { message: 'Failed to mark messages as seen' });
  }
};

const handleMessageDelivered = async (socket, io, data, activeUsers) => {
  const { messageId } = data;
  const userId = socket.userId;
  
  if (!messageId) {
    return;
  }

  try {
    // Update message status to delivered
    await messageService.updateMessageStatus(messageId, userId, 'delivered');
    
    // Emit status update to the room
    socket.emit('message_status', {
      messageId,
      status: 'delivered'
    });

    logger.debug('Message delivered:', { messageId, userId });
    
  } catch (error) {
    logger.error('Failed to update message delivery status:', error);
  }
};

// Utility function to create consistent room names
const getRoomName = (userId1, userId2) => {
  const sortedIds = [userId1, userId2].sort((a, b) => a - b);
  return `chat_${sortedIds[0]}_${sortedIds[1]}`;
};

module.exports = {
  handleJoinChat,
  handleSendMessage,
  handleTyping,
  handleMarkSeen,
  handleMessageDelivered,
  getRoomName
};