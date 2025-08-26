import api from './api';

// Mock data for development
const MOCK_MODE = import.meta.env.VITE_MOCK_API === 'true';

const mockChats = [
  {
    userId: '2',
    username: 'jane_smith',
    avatar: null,
    lastMessage: 'Hey, how are you doing?',
    lastMessageTime: new Date(Date.now() - 10 * 60000).toISOString(), // 10 minutes ago
    unreadCount: 2,
    isOnline: true,
  },
  {
    userId: '3',
    username: 'bob_wilson',
    avatar: null,
    lastMessage: 'Thanks for the help!',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hours ago
    unreadCount: 0,
    isOnline: false,
  },
  {
    userId: '4',
    username: 'alice_brown',
    avatar: null,
    lastMessage: 'See you tomorrow 👋',
    lastMessageTime: new Date(Date.now() - 24 * 60 * 60000).toISOString(), // 1 day ago
    unreadCount: 1,
    isOnline: true,
  },
];

const mockMessages = {
  '2': [
    {
      id: '1',
      senderId: '2',
      receiverId: '1',
      content: 'Hey there! How are you doing?',
      timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
      messageType: 'text',
      isRead: true,
      isDelivered: true,
      isEdited: false,
      isDeleted: false,
    },
    {
      id: '2',
      senderId: '1',
      receiverId: '2',
      content: 'I\'m doing great! Thanks for asking. How about you?',
      timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
      messageType: 'text',
      isRead: true,
      isDelivered: true,
      isEdited: false,
      isDeleted: false,
    },
    {
      id: '3',
      senderId: '2',
      receiverId: '1',
      content: 'Pretty good! Just working on a new project.',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      messageType: 'text',
      isRead: true,
      isDelivered: true,
      isEdited: false,
      isDeleted: false,
    },
    {
      id: '4',
      senderId: '2',
      receiverId: '1',
      content: 'Hey, how are you doing?',
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      messageType: 'text',
      isRead: false,
      isDelivered: true,
      isEdited: false,
      isDeleted: false,
    }
  ],
  '3': [
    {
      id: '5',
      senderId: '3',
      receiverId: '1',
      content: 'Could you help me with the React project?',
      timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
      messageType: 'text',
      isRead: true,
      isDelivered: true,
      isEdited: false,
      isDeleted: false,
    },
    {
      id: '6',
      senderId: '1',
      receiverId: '3',
      content: 'Sure! What do you need help with?',
      timestamp: new Date(Date.now() - 2.5 * 60 * 60000).toISOString(),
      messageType: 'text',
      isRead: true,
      isDelivered: true,
      isEdited: false,
      isDeleted: false,
    },
    {
      id: '7',
      senderId: '3',
      receiverId: '1',
      content: 'Thanks for the help!',
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      messageType: 'text',
      isRead: true,
      isDelivered: true,
      isEdited: false,
      isDeleted: false,
    }
  ],
  '4': [
    {
      id: '8',
      senderId: '4',
      receiverId: '1',
      content: 'Don\'t forget about our meeting tomorrow!',
      timestamp: new Date(Date.now() - 25 * 60 * 60000).toISOString(),
      messageType: 'text',
      isRead: true,
      isDelivered: true,
      isEdited: false,
      isDeleted: false,
    },
    {
      id: '9',
      senderId: '1',
      receiverId: '4',
      content: 'Of course! I\'ll be there at 10 AM.',
      timestamp: new Date(Date.now() - 24.5 * 60 * 60000).toISOString(),
      messageType: 'text',
      isRead: true,
      isDelivered: true,
      isEdited: false,
      isDeleted: false,
    },
    {
      id: '10',
      senderId: '4',
      receiverId: '1',
      content: 'See you tomorrow 👋',
      timestamp: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
      messageType: 'text',
      isRead: false,
      isDelivered: true,
      isEdited: false,
      isDeleted: false,
    }
  ],
};

// Mock API responses
const mockApiResponse = (data, delay = 800) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data });
    }, delay);
  });
};

export const getRecentChats = async () => {
  if (MOCK_MODE) {
    return mockApiResponse(mockChats);
  }

  try {
    const response = await api.get('/chats/recent');
    return response;
  } catch (error) {
    throw error;
  }
};

export const getChatMessages = async (userId, page = 1, limit = 50) => {
  if (MOCK_MODE) {
    const messages = mockMessages[userId] || [];
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMessages = messages.slice(startIndex, endIndex);
    
    return mockApiResponse({
      messages: paginatedMessages,
      hasMore: endIndex < messages.length,
      page,
      totalPages: Math.ceil(messages.length / limit),
    });
  }

  try {
    const response = await api.get(`/chats/${userId}/messages?page=${page}&limit=${limit}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendMessage = async (messageData) => {
  if (MOCK_MODE) {
    const newMessage = {
      id: Date.now().toString(),
      senderId: '1', // Current user
      receiverId: messageData.receiverId,
      content: messageData.content,
      timestamp: new Date().toISOString(),
      messageType: messageData.messageType || 'text',
      isRead: false,
      isDelivered: false,
      isEdited: false,
      isDeleted: false,
      imageUrl: messageData.imageUrl,
    };
    
    // Add to mock messages
    if (!mockMessages[messageData.receiverId]) {
      mockMessages[messageData.receiverId] = [];
    }
    mockMessages[messageData.receiverId].push(newMessage);
    
    return mockApiResponse(newMessage);
  }

  try {
    const response = await api.post('/chats/messages', messageData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const editMessage = async (messageId, content) => {
  if (MOCK_MODE) {
    // Find and update message in mock data
    for (const userId in mockMessages) {
      const messageIndex = mockMessages[userId].findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        mockMessages[userId][messageIndex] = {
          ...mockMessages[userId][messageIndex],
          content,
          isEdited: true,
          editedAt: new Date().toISOString(),
        };
        
        return mockApiResponse(mockMessages[userId][messageIndex]);
      }
    }
    
    throw new Error('Message not found');
  }

  try {
    const response = await api.put(`/chats/messages/${messageId}`, { content });
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteMessage = async (messageId) => {
  if (MOCK_MODE) {
    // Find and mark message as deleted in mock data
    for (const userId in mockMessages) {
      const messageIndex = mockMessages[userId].findIndex(m => m.id === messageId);
      if (messageIndex !== -1) {
        mockMessages[userId][messageIndex] = {
          ...mockMessages[userId][messageIndex],
          content: 'This message was deleted.',
          isDeleted: true,
          deletedAt: new Date().toISOString(),
        };
        
        return mockApiResponse({
          messageId,
          message: 'Message deleted successfully'
        });
      }
    }
    
    throw new Error('Message not found');
  }

  try {
    const response = await api.delete(`/chats/messages/${messageId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const markMessagesAsRead = async (chatUserId, messageIds) => {
  if (MOCK_MODE) {
    // Update mock messages
    if (mockMessages[chatUserId]) {
      mockMessages[chatUserId].forEach(message => {
        if (messageIds.includes(message.id)) {
          message.isRead = true;
          message.readAt = new Date().toISOString();
        }
      });
    }
    
    return mockApiResponse({
      message: 'Messages marked as read'
    });
  }

  try {
    const response = await api.patch(`/chats/${chatUserId}/read`, {
      messageIds
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const uploadImage = async (imageFile) => {
  if (MOCK_MODE) {
    // Simulate image upload
    const mockImageUrl = URL.createObjectURL(imageFile);
    return mockApiResponse({
      imageUrl: mockImageUrl,
      message: 'Image uploaded successfully'
    }, 2000);
  }

  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/chats/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getChatHistory = async (userId, beforeMessageId = null, limit = 50) => {
  if (MOCK_MODE) {
    const messages = mockMessages[userId] || [];
    let filteredMessages = messages;
    
    if (beforeMessageId) {
      const beforeIndex = messages.findIndex(m => m.id === beforeMessageId);
      if (beforeIndex > 0) {
        filteredMessages = messages.slice(0, beforeIndex);
      }
    }
    
    const paginatedMessages = filteredMessages.slice(-limit);
    
    return mockApiResponse({
      messages: paginatedMessages,
      hasMore: filteredMessages.length > limit,
    });
  }

  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    
    if (beforeMessageId) {
      params.append('before', beforeMessageId);
    }
    
    const response = await api.get(`/chats/${userId}/history?${params}`);
    return response;
  } catch (error) {
    throw error;
  }
};