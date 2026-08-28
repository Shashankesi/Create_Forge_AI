const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { validateRegisterInput, validateLoginInput } = require('../utils/validation');

/**
 * Mask email for safe development logging without leaking sensitive data
 */
const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '***';
  const parts = email.split('@');
  if (parts.length < 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length <= 2 ? name[0] + '***' : name.slice(0, 2) + '***';
  return `${maskedName}@${domain}`;
};

/**
 * Generate signed JWT token
 */
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'createforge_ai_super_secret_jwt_key_prod_2026_auth';
  const userId = user._id ? user._id.toString() : user.id;
  return jwt.sign(
    {
      id: userId,
      _id: userId,
      name: user.name,
      email: user.email,
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * Set HTTP-only secure authentication cookie
 */
const setTokenCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };

  res.cookie('token', token, cookieOptions);
  res.cookie('createforge_token', token, cookieOptions);
};

/**
 * Clear authentication cookies on logout
 */
const clearTokenCookies = (res) => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  };

  res.clearCookie('token', cookieOptions);
  res.clearCookie('createforge_token', cookieOptions);
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user in MongoDB
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { isValid, errors } = validateRegisterInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors.join('. '),
      });
    }

    // Check MongoDB Connection Health
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service is temporarily unavailable.',
      });
    }

    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    console.log(`[Auth] Register request received for: ${maskEmail(normalizedEmail)}`);

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log(`[Auth] Duplicate registration rejected for: ${maskEmail(normalizedEmail)}`);
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create new MongoDB user
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      lastLoginAt: new Date(),
    });

    await user.save();
    console.log(`[Auth] User created in MongoDB: ${maskEmail(normalizedEmail)} (ID: ${user._id})`);

    const token = generateToken(user);
    setTokenCookie(res, token);
    console.log(`[Auth] Token issued for: ${maskEmail(normalizedEmail)}`);

    const safeUser = user.toSafeObject();

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: safeUser,
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }
    if (
      error.name === 'MongoServerSelectionError' ||
      error.name === 'MongooseServerSelectionError' ||
      error.name === 'MongoNetworkError'
    ) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service is temporarily unavailable.',
      });
    }
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate MongoDB user & establish session
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { isValid, errors } = validateLoginInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors.join('. '),
      });
    }

    // Check MongoDB Connection Health
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service is temporarily unavailable.',
      });
    }

    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    console.log(`[Auth] Login request received for: ${maskEmail(normalizedEmail)}`);

    // Look up user with explicit password selection
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      console.log(`[Auth] User lookup: not found for ${maskEmail(normalizedEmail)}`);
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password.',
      });
    }

    console.log(`[Auth] User lookup: found for ${maskEmail(normalizedEmail)}`);

    // Compare bcrypt password hash
    const isMatch = user.comparePassword(password);
    if (!isMatch) {
      console.log(`[Auth] Password verification: failed for ${maskEmail(normalizedEmail)}`);
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password.',
      });
    }

    console.log(`[Auth] Password verification: success for ${maskEmail(normalizedEmail)}`);

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user);
    setTokenCookie(res, token);
    console.log(`[Auth] Token issued for ${maskEmail(normalizedEmail)}`);

    const safeUser = user.toSafeObject();

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: safeUser,
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (error) {
    if (
      error.name === 'MongoServerSelectionError' ||
      error.name === 'MongooseServerSelectionError' ||
      error.name === 'MongoNetworkError'
    ) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service is temporarily unavailable.',
      });
    }
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Invalidate session & clear HTTP-only cookies
 * @access  Public
 */
const logout = async (req, res) => {
  console.log('[Auth] Logout request received. Clearing session cookies.');
  clearTokenCookies(res);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated MongoDB user profile
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service is temporarily unavailable.',
      });
    }

    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      console.log(`[Auth] /me request: user ${userId} not found in MongoDB`);
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    console.log(`[Auth] /me request: user restored from MongoDB (${maskEmail(user.email)})`);

    const safeUser = user.toSafeObject();

    return res.status(200).json({
      success: true,
      user: safeUser,
      data: {
        user: safeUser,
      },
    });
  } catch (error) {
    if (
      error.name === 'MongoServerSelectionError' ||
      error.name === 'MongooseServerSelectionError' ||
      error.name === 'MongoNetworkError'
    ) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service is temporarily unavailable.',
      });
    }
    next(error);
  }
};

/**
 * @route   PUT /api/auth/change-password
 * @desc    Update authenticated user password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id || req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your current and new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const isMatch = user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update authenticated user profile (name, bio, avatar, preferences)
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, bio, avatar, preferences } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (name && typeof name === 'string') user.name = name.trim();
    if (bio !== undefined && typeof bio === 'string') user.bio = bio.trim();
    if (avatar !== undefined && typeof avatar === 'string') user.avatar = avatar.trim();
    if (preferences && typeof preferences === 'object') {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }

    await user.save();
    const safeUser = user.toSafeObject();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: safeUser,
      data: {
        user: safeUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  changePassword,
  updateProfile,
};
