const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Public auth routes with rate limiting
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

// Protected auth routes
router.get('/me', authMiddleware, getMe);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
