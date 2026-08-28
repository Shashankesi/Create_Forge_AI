const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes by verifying JWT token from HTTP-only cookie or Authorization header
 */
const authMiddleware = async (req, res, next) => {
  let token;

  // 1. Check HTTP-only cookie (preferred)
  if (req.cookies) {
    token = req.cookies.token || req.cookies.createforge_token;
  }

  // 2. Check Authorization Bearer header (for API/test client flexibility)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'createforge_ai_super_secret_jwt_key_prod_2026_auth';
    const decoded = jwt.verify(token, secret);

    const userId = decoded.id || decoded._id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or user not found. Please sign in again.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid. Please sign in again.',
    });
  }
};

module.exports = authMiddleware;
