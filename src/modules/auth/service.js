const bcrypt = require('bcryptjs');
const authDao = require('./dao');
const { generateAccessToken } = require('../../utils/jwt');
const logger = require('../../utils/logger');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const registerUser = async (userData) => {
  const { username, email, phone, password } = userData;

  // Check if user already exists
  const existingUser = await authDao.findUserByEmailOrUsername(email, username);
  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error('Email already exists');
    }
    if (existingUser.username === username) {
      throw new Error('Username already exists');
    }
  }

  // Check if phone already exists
  const existingPhone = await authDao.findUserByPhone(phone);
  if (existingPhone) {
    throw new Error('Phone number already exists');
  }

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const userId = await authDao.createUser({
    username,
    email,
    phone,
    password: hashedPassword
  });

  // Get created user
  const user = await authDao.findUserById(userId);

  // Generate JWT token
  const token = generateAccessToken(userId);

  logger.info('User registered successfully:', { userId, username, email });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      profilePicture: user.profile_picture,
      bio: user.bio,
      createdAt: user.created_at
    },
    token
  };
};

const loginUser = async (emailOrUsername, password) => {
  // Find user by email or username
  const user = await authDao.findUserByEmailOrUsername(emailOrUsername, emailOrUsername);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Update user online status
  await authDao.updateUserOnlineStatus(user.id, true);

  // Generate JWT token
  const token = generateAccessToken(user.id);

  logger.info('User logged in successfully:', { userId: user.id, username: user.username });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      profilePicture: user.profile_picture,
      bio: user.bio,
      isOnline: true,
      lastSeen: user.last_seen,
      createdAt: user.created_at
    },
    token
  };
};

const forgotPassword = async (email) => {
  // Check if user exists
  const user = await authDao.findUserByEmail(email);
  
  // Always return success message for security (don't reveal if email exists)
  if (!user) {
    logger.info('Password reset attempted for non-existent email:', { email });
    return;
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set OTP expiration (15 minutes from now)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Save OTP to database
  await authDao.createOtpToken({
    userId: user.id,
    email: user.email,
    otp,
    expiresAt
  });

  // Send OTP email
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'WhatsApp-lite - Password Reset OTP',
      html: `
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Use the OTP below to reset your password:</p>
        <h3 style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 3px;">${otp}</h3>
        <p>This OTP will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    logger.info('Password reset OTP sent successfully:', { email, userId: user.id });
  } catch (error) {
    logger.error('Failed to send OTP email:', { error: error.message, email });
    throw new Error('Failed to send OTP email');
  }
};

const resetPassword = async (email, otp, newPassword) => {
  // Verify OTP
  const otpRecord = await authDao.findValidOtp(email, otp);
  
  if (!otpRecord || otpRecord.used || new Date() > otpRecord.expires_at) {
    throw new Error('Invalid or expired OTP');
  }

  // Hash new password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password and mark OTP as used
  await authDao.updateUserPassword(otpRecord.user_id, hashedPassword);
  await authDao.markOtpAsUsed(otpRecord.id);

  logger.info('Password reset successfully:', { email, userId: otpRecord.user_id });
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
};