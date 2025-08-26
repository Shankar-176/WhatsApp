const express = require('express');
const authController = require('./controller');
const { validate } = require('../../utils/validators');
const { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} = require('../../utils/validators');

const router = express.Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// POST /api/auth/logout (optional - for token blacklisting if needed)
router.post('/logout', authController.logout);

module.exports = router;