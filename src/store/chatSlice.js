import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as chatApi from '../services/chatApi';

// Async thunks
export const fetchRecentChats = createAsyncThunk(
  'chat/fetchRecentChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatApi.getRecentChats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
    }
  }
);

export const fetchChatMessages = createAsyncThunk(
  'chat/fetchChatMessages',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await chatApi.getChatMessages(userId, page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await chatApi.sendMessage(messageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await chatApi.deleteMessage(messageId);
      return { messageId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete message');
    }
  }
);

export const editMessage = createAsyncThunk(
  'chat/editMessage',
  async ({ messageId, content }, { rejectWithValue }) => {
    try {
      const response = await chatApi.editMessage(messageId, content);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to edit message');
    }
  }
);

const initialState = {
  recentChats: [],
  currentChat: {
    userId: null,
    messages: [],
    hasMore: true,
    page: 1,
  },
  typingUsers: {},
  onlineUsers: new Set(),
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat.userId = action.payload;
      state.currentChat.messages = [];
      state.currentChat.hasMore = true;
      state.currentChat.page = 1;
    },
    addMessage: (state, action) => {
      const message = action.payload;
      const existingIndex = state.currentChat.messages.findIndex(m => m.id === message.id);
      
      if (existingIndex === -1) {
        state.currentChat.messages.push(message);
      }
      
      // Update recent chats
      const chatIndex = state.recentChats.findIndex(
        chat => chat.userId === message.senderId || chat.userId === message.receiverId
      );
      
      if (chatIndex !== -1) {
        state.recentChats[chatIndex].lastMessage = message.content;
        state.recentChats[chatIndex].lastMessageTime = message.timestamp;
        state.recentChats[chatIndex].unreadCount = 
          message.senderId !== state.currentChat.userId ? 
          (state.recentChats[chatIndex].unreadCount || 0) + 1 : 0;
      }
    },
    updateMessage: (state, action) => {
      const { messageId, updates } = action.payload;
      const messageIndex = state.currentChat.messages.findIndex(m => m.id === messageId);
      
      if (messageIndex !== -1) {
        state.currentChat.messages[messageIndex] = {
          ...state.currentChat.messages[messageIndex],
          ...updates,
        };
      }
    },
    removeMessage: (state, action) => {
      const messageId = action.payload;
      const messageIndex = state.currentChat.messages.findIndex(m => m.id === messageId);
      
      if (messageIndex !== -1) {
        state.currentChat.messages[messageIndex] = {
          ...state.currentChat.messages[messageIndex],
          content: 'This message was deleted.',
          isDeleted: true,
        };
      }
    },
    setTypingUser: (state, action) => {
      const { userId, isTyping } = action.payload;
      if (isTyping) {
        state.typingUsers[userId] = true;
      } else {
        delete state.typingUsers[userId];
      }
    },
    updateOnlineUsers: (state, action) => {
      state.onlineUsers = new Set(action.payload);
    },
    markMessagesAsRead: (state, action) => {
      const { chatUserId } = action.payload;
      state.currentChat.messages.forEach(message => {
        if (message.senderId === chatUserId && !message.isRead) {
          message.isRead = true;
        }
      });
      
      // Update recent chats unread count
      const chatIndex = state.recentChats.findIndex(chat => chat.userId === chatUserId);
      if (chatIndex !== -1) {
        state.recentChats[chatIndex].unreadCount = 0;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Recent Chats
      .addCase(fetchRecentChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentChats.fulfilled, (state, action) => {
        state.loading = false;
        state.recentChats = action.payload;
      })
      .addCase(fetchRecentChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Chat Messages
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { messages, hasMore, page } = action.payload;
        
        if (page === 1) {
          state.currentChat.messages = messages;
        } else {
          state.currentChat.messages = [...messages, ...state.currentChat.messages];
        }
        
        state.currentChat.hasMore = hasMore;
        state.currentChat.page = page;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Message will be added through socket event
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete Message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const { messageId } = action.payload;
        const messageIndex = state.currentChat.messages.findIndex(m => m.id === messageId);
        
        if (messageIndex !== -1) {
          state.currentChat.messages[messageIndex] = {
            ...state.currentChat.messages[messageIndex],
            content: 'This message was deleted.',
            isDeleted: true,
          };
        }
      })
      // Edit Message
      .addCase(editMessage.fulfilled, (state, action) => {
        const updatedMessage = action.payload;
        const messageIndex = state.currentChat.messages.findIndex(m => m.id === updatedMessage.id);
        
        if (messageIndex !== -1) {
          state.currentChat.messages[messageIndex] = updatedMessage;
        }
      });
  },
});

export const {
  setCurrentChat,
  addMessage,
  updateMessage,
  removeMessage,
  setTypingUser,
  updateOnlineUsers,
  markMessagesAsRead,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;