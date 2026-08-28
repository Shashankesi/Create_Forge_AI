const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const {
  getMoodboard,
  generateCreativeDirection,
  generateVisualMatchingMoodboard,
  updateMoodboard,
  applyDirectionToProject,
} = require('../controllers/moodboardController');

router.use(authMiddleware);

router.get('/project/:projectId', getMoodboard);
router.post('/generate-direction', aiLimiter, generateCreativeDirection);
router.post('/:moodboardId/generate-visual', aiLimiter, generateVisualMatchingMoodboard);
router.put('/:id', updateMoodboard);
router.post('/apply-direction', applyDirectionToProject);

module.exports = router;
