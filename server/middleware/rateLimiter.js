const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter for Auth endpoints (Login / Register)
 * Prevents brute-force credential stuffing
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Rate Limiter for AI Generation endpoints
 * Protects AI quotas and prevents API abuse
 */
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 AI generations per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many AI generation requests. Please wait a moment before trying again.',
  },
});

/**
 * General API Limiter
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Rate limit exceeded. Please slow down your requests.',
  },
});

module.exports = {
  authLimiter,
  aiLimiter,
  generalLimiter,
};
