const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const generateAccessToken = (userId) => {
  return generateToken({ userId, type: 'access' });
};

const generateRefreshToken = (userId) => {
  return generateToken({ userId, type: 'refresh' }, '30d');
};

module.exports = {
  generateToken,
  verifyToken,
  generateAccessToken,
  generateRefreshToken
};