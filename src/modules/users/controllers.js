const userService = require('./service');
const logger = require('../../utils/logger');

const searchUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const currentUserId = req.user.id;
    
    const users = await userService.searchUsers(search, currentUserId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;
    
    const user = await userService.getUserProfile(parseInt(id), currentUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    const updatedUser = await userService.updateUserProfile(userId, updateData);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

const getUserPresence = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const presence = await userService.getUserPresence(parseInt(userId));

    if (!presence) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User presence retrieved successfully',
      data: presence
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchUsers,
  getUserProfile,
  updateProfile,
  getUserPresence
};