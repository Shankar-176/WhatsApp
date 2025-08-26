import api from './api';

// Mock data for development
const MOCK_MODE = import.meta.env.VITE_MOCK_API === 'true';

const mockUsers = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    phone: '+1234567890',
    avatar: null,
    isOnline: true,
    lastSeen: new Date().toISOString(),
  }
];

const mockToken = 'mock-jwt-token-12345';

// Mock API responses
const mockApiResponse = (data, delay = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data });
    }, delay);
  });
};

export const login = async (credentials) => {
  if (MOCK_MODE) {
    // Mock validation
    if (credentials.email === 'john@example.com' && credentials.password === 'password') {
      return mockApiResponse({
        user: mockUsers[0],
        token: mockToken,
        message: 'Login successful'
      });
    } else {
      throw new Error('Invalid credentials');
    }
  }

  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData) => {
  if (MOCK_MODE) {
    // Mock registration
    const newUser = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      avatar: null,
      isOnline: false,
      lastSeen: new Date().toISOString(),
    };
    
    return mockApiResponse({
      user: newUser,
      message: 'Registration successful'
    });
  }

  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email) => {
  if (MOCK_MODE) {
    return mockApiResponse({
      message: 'OTP sent to your email address'
    });
  }

  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOTP = async (email, otp) => {
  if (MOCK_MODE) {
    // Mock OTP verification
    if (otp === '123456') {
      return mockApiResponse({
        message: 'OTP verified successfully',
        resetToken: 'mock-reset-token'
      });
    } else {
      throw new Error('Invalid OTP');
    }
  }

  try {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (resetData) => {
  if (MOCK_MODE) {
    return mockApiResponse({
      message: 'Password reset successful'
    });
  }

  try {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async () => {
  if (MOCK_MODE) {
    return mockApiResponse({
      token: mockToken,
      user: mockUsers[0]
    });
  }

  try {
    const response = await api.post('/auth/refresh');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  if (MOCK_MODE) {
    return mockApiResponse({
      message: 'Logout successful'
    });
  }

  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw error;
  }
};