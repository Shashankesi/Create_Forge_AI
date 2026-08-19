const express = require('express');
const router = express.Router();
const { generateImage } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

// Image generation routes
router.use(authMiddleware);
router.use(aiLimiter);

router.post('/generate', generateImage);

module.exports = router;
