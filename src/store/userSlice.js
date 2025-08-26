import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userApi from '../services/userApi';

// Async thunks
export const fetchAllUsers = createAsyncThunk(
  'user/fetchAllUsers',
  async (searchQuery = '', { rejectWithValue }) => {
    try {
      const response = await userApi.getAllUsers(searchQuery);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userApi.updateProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const initialState = {
  allUsers: [],
  searchResults: [],
  loading: false,
  error: null,
  searchQuery: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    updateUserOnlineStatus: (state, action) => {
      const { userId, isOnline, lastSeen } = action.payload;
      
      // Update in all users list
      const userIndex = state.allUsers.findIndex(user => user.id === userId);
      if (userIndex !== -1) {
        state.allUsers[userIndex].isOnline = isOnline;
        if (lastSeen) {
          state.allUsers[userIndex].lastSeen = lastSeen;
        }
      }
      
      // Update in search results
      const searchIndex = state.searchResults.findIndex(user => user.id === userId);
      if (searchIndex !== -1) {
        state.searchResults[searchIndex].isOnline = isOnline;
        if (lastSeen) {
          state.searchResults[searchIndex].lastSeen = lastSeen;
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        if (state.searchQuery) {
          state.searchResults = action.payload;
        } else {
          state.allUsers = action.payload;
        }
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  clearSearchResults,
  updateUserOnlineStatus,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;