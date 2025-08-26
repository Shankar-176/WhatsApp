import api from './api';

// Mock data for development
const MOCK_MODE = import.meta.env.VITE_MOCK_API === 'true';

const mockUsers = [
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    avatar: null,
    isOnline: true,
    lastSeen: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
  },
  {
    id: '3',
    username: 'bob_wilson',
    email: 'bob@example.com',
    phone: '+1234567892',
    avatar: null,
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hours ago
  },
  {
    id: '4',
    username: 'alice_brown',
    email: 'alice@example.com',
    phone: '+1234567893',
    avatar: null,
    isOnline: true,
    lastSeen: new Date().toISOString(),
  },
  {
    id: '5',
    username: 'charlie_davis',
    email: 'charlie@example.com',
    phone: '+1234567894',
    avatar: null,
    isOnline: false,
    lastSeen: new Date(Date.now() - 24 * 60 * 60000).toISOString(), // 1 day ago
  },
];

// Mock API responses
const mockApiResponse = (data, delay = 800) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data });
    }, delay);
  });
};

export const getAllUsers = async (searchQuery = '') => {
  if (MOCK_MODE) {
    let filteredUsers = mockUsers;
    
    if (searchQuery) {
      filteredUsers = mockUsers.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return mockApiResponse(filteredUsers);
  }

  try {
    const response = await api.get(`/users?search=${encodeURIComponent(searchQuery)}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (userId) => {
  if (MOCK_MODE) {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    return mockApiResponse(user);
  }

  try {
    const response = await api.get(`/users/${userId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  if (MOCK_MODE) {
    const updatedUser = {
      id: '1',
      ...profileData,
      lastSeen: new Date().toISOString(),
    };
    
    return mockApiResponse({
      user: updatedUser,
      message: 'Profile updated successfully'
    });
  }

  try {
    const response = await api.put('/users/profile', profileData);
    return response;
  } catch (error) {
    throw error;
  }
};

export const uploadAvatar = async (avatarFile) => {
  if (MOCK_MODE) {
    // Simulate file upload
    const mockAvatarUrl = URL.createObjectURL(avatarFile);
    return mockApiResponse({
      avatarUrl: mockAvatarUrl,
      message: 'Avatar uploaded successfully'
    });
  }

  try {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const searchUsers = async (query) => {
  if (MOCK_MODE) {
    const filteredUsers = mockUsers.filter(user =>
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
    
    return mockApiResponse(filteredUsers);
  }

  try {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateUserStatus = async (isOnline, lastSeen) => {
  if (MOCK_MODE) {
    return mockApiResponse({
      message: 'Status updated successfully'
    });
  }

  try {
    const response = await api.patch('/users/status', {
      isOnline,
      lastSeen,
    });
    return response;
  } catch (error) {
    throw error;
  }
};