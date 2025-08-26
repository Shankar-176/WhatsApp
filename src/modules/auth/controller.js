const authService = require('./service');
const logger = require('../../utils/logger');

const register = async (req, res, next) => {
  try {
    const { username, email, phone, password } = req.body;
    
    const result = await authService.registerUser({
      username,
      email,
      phone,
      password
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;
    
    const result = await authService.loginUser(emailOrUsername, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: 'If the email exists, an OTP has been sent'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    await authService.resetPassword(email, otp, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // For JWT, logout is typically handled on the client side
    // You could implement token blacklisting here if needed
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  logout
};