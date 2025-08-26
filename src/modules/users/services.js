const userDao = require('./dao');
const logger = require('../../utils/logger');

const searchUsers = async (searchTerm, currentUserId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  
  const users = await userDao.searchUsers(searchTerm, currentUserId, limit, offset);
  const totalCount = await userDao.getUsersCount(searchTerm, currentUserId);
  
  return {
    users: users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.profile_picture,
      bio: user.bio,
      isOnline: !!user.is_online,
      lastSeen: user.last_seen
    })),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
      itemsPerPage: limit
    }
  };
};

const getUserProfile = async (userId, currentUserId) => {
  const user = await userDao.findUserById(userId);
  
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: currentUserId === userId ? user.email : undefined, // Only show email for own profile
    phone: currentUserId === userId ? user.phone : undefined, // Only show phone for own profile
    profilePicture: user.profile_picture,
    bio: user.bio,
    isOnline: !!user.is_online,
    lastSeen: user.last_seen,
    createdAt: user.created_at
  };
};

const getUserById = async (userId) => {
  return await userDao.findUserById(userId);
};

const updateUserProfile = async (userId, updateData) => {
  const { username, bio, profilePicture } = updateData;
  
  // Check if username is being updated and if it already exists
  if (username) {
    const existingUser = await userDao.findUserByUsername(username);
    if (existingUser && existingUser.id !== userId) {
      throw new Error('Username already exists');
    }
  }

  await userDao.updateUserProfile(userId, {
    username,
    bio,
    profile_picture: profilePicture
  });

  // Return updated user profile
  const updatedUser = await userDao.findUserById(userId);
  
  return {
    id: updatedUser.id,
    username: updatedUser.username,
    email: updatedUser.email,
    phone: updatedUser.phone,
    profilePicture: updatedUser.profile_picture,
    bio: updatedUser.bio,
    isOnline: !!updatedUser.is_online,
    lastSeen: updatedUser.last_seen,
    createdAt: updatedUser.created_at
  };
};

const getUserPresence = async (userId) => {
  const user = await userDao.findUserById(userId);
  
  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    isOnline: !!user.is_online,
    lastSeen: user.last_seen
  };
};

const updateUserOnlineStatus = async (userId, isOnline) => {
  await userDao.updateUserOnlineStatus(userId, isOnline);
};

module.exports = {
  searchUsers,
  getUserProfile,
  getUserById,
  updateUserProfile,
  getUserPresence,
  updateUserOnlineStatus
};