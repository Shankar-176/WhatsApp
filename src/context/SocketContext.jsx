import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import {
  addMessage,
  updateMessage,
  setTypingUser,
  updateOnlineUsers,
  markMessagesAsRead,
} from '../store/chatSlice';
import { updateUserOnlineStatus } from '../store/userSlice';

const SocketContext = createContext({});

export const SocketProvider = ({ children }) => {
  const socket = useRef(null);
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      socket.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      // Connection events
      socket.current.on('connect', () => {
        console.log('Connected to server');
        socket.current.emit('user:online', user.id);
      });

      socket.current.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      // Message events
      socket.current.on('message:new', (message) => {
        dispatch(addMessage(message));
      });

      socket.current.on('message:updated', (message) => {
        dispatch(updateMessage({ messageId: message.id, updates: message }));
      });

      socket.current.on('message:deleted', (messageId) => {
        dispatch(updateMessage({ 
          messageId, 
          updates: { content: 'This message was deleted.', isDeleted: true } 
        }));
      });

      socket.current.on('message:read', ({ messageIds, readBy }) => {
        messageIds.forEach(messageId => {
          dispatch(updateMessage({ 
            messageId, 
            updates: { isRead: true, readBy } 
          }));
        });
      });

      // Typing events
      socket.current.on('user:typing', ({ userId, isTyping }) => {
        dispatch(setTypingUser({ userId, isTyping }));
      });

      // Online status events
      socket.current.on('users:online', (onlineUserIds) => {
        dispatch(updateOnlineUsers(onlineUserIds));
        
        // Update individual user statuses
        onlineUserIds.forEach(userId => {
          dispatch(updateUserOnlineStatus({ 
            userId, 
            isOnline: true,
            lastSeen: new Date().toISOString()
          }));
        });
      });

      socket.current.on('user:status', ({ userId, isOnline, lastSeen }) => {
        dispatch(updateUserOnlineStatus({ userId, isOnline, lastSeen }));
      });

      // Error handling
      socket.current.on('error', (error) => {
        console.error('Socket error:', error);
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect();
          socket.current = null;
        }
      };
    }
  }, [isAuthenticated, user, dispatch]);

  // Socket methods
  const sendMessage = (messageData) => {
    if (socket.current) {
      socket.current.emit('message:send', messageData);
    }
  };

  const editMessage = (messageId, content) => {
    if (socket.current) {
      socket.current.emit('message:edit', { messageId, content });
    }
  };

  const deleteMessage = (messageId) => {
    if (socket.current) {
      socket.current.emit('message:delete', messageId);
    }
  };

  const markAsRead = (messageIds, chatUserId) => {
    if (socket.current) {
      socket.current.emit('message:read', { messageIds, chatUserId });
      dispatch(markMessagesAsRead({ chatUserId }));
    }
  };

  const setTyping = (receiverId, isTyping) => {
    if (socket.current) {
      socket.current.emit('user:typing', { receiverId, isTyping });
    }
  };

  const joinChat = (chatId) => {
    if (socket.current) {
      socket.current.emit('chat:join', chatId);
    }
  };

  const leaveChat = (chatId) => {
    if (socket.current) {
      socket.current.emit('chat:leave', chatId);
    }
  };

  const value = {
    socket: socket.current,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    setTyping,
    joinChat,
    leaveChat,
    isConnected: socket.current?.connected || false,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};