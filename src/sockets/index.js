const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const userService = require('../modules/users/service');
const messageService = require('../modules/messages/service');
const socketEvents = require('./events');

// Store active connections
const activeUsers = new Map();

const socketHandler = (io) => {
  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userService.getUserById(decoded.userId);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.id;
      socket.username = user.username;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    const username = socket.username;
    
    logger.info('User connected via socket:', { userId, username, socketId: socket.id });

    // Store active user
    activeUsers.set(userId, {
      socketId: socket.id,
      username,
      connectedAt: new Date()
    });

    // Update user online status
    await userService.updateUserOnlineStatus(userId, true);

    // Emit to all contacts that user is online
    socket.broadcast.emit('user_online', { userId, username });

    // Handle joining chat rooms
    socket.on('join_chat', async (data) => {
      try {
        await socketEvents.handleJoinChat(socket, data, activeUsers);
      } catch (error) {
        logger.error('Error in join_chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        await socketEvents.handleSendMessage(socket, io, data);
      } catch (error) {
        logger.error('Error in send_message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing status
    socket.on('typing', async (data) => {
      try {
        await socketEvents.handleTyping(socket, io, data, activeUsers);
      } catch (error) {
        logger.error('Error in typing:', error);
      }
    });

    // Handle message seen
    socket.on('mark_seen', async (data) => {
      try {
        await socketEvents.handleMarkSeen(socket, io, data, activeUsers);
      } catch (error) {
        logger.error('Error in mark_seen:', error);
        socket.emit('error', { message: 'Failed to mark messages as seen' });
      }
    });

    // Handle message status updates
    socket.on('message_delivered', async (data) => {
      try {
        await socketEvents.handleMessageDelivered(socket, io, data, activeUsers);
      } catch (error) {
        logger.error('Error in message_delivered:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      logger.info('User disconnected:', { userId, username, socketId: socket.id });
      
      // Remove from active users
      activeUsers.delete(userId);

      // Update user offline status
      await userService.updateUserOnlineStatus(userId, false);

      // Emit to all contacts that user is offline
      socket.broadcast.emit('user_offline', { userId, username, lastSeen: new Date() });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error:', { userId, error });
    });
  });

  // Handle connection errors
  io.on('connection_error', (error) => {
    logger.error('Socket.IO connection error:', error);
  });

  logger.info('Socket.IO server initialized');
};

module.exports = socketHandler;