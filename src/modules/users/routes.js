const express = require('express');
const userController = require('./controller');
const { authenticateToken } = require('../../middleware/auth');
const { validateQuery, validate } = require('../../utils/validators');
const { searchUsersSchema, updateProfileSchema } = require('../../utils/validators');

const router = express.Router();

// GET /api/users?search=term - search/list users
router.get('/', authenticateToken, validateQuery(searchUsersSchema), userController.searchUsers);

// GET /api/users/:id - get user profile
router.get('/:id', authenticateToken, userController.getUserProfile);

// PUT /api/users/profile - update own profile
router.put('/profile', authenticateToken, validate(updateProfileSchema), userController.updateProfile);

// GET /api/presence/:userId - get user presence status
router.get('/presence/:userId', authenticateToken, userController.getUserPresence);

module.exports = router;