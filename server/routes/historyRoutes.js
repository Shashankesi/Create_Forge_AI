const express = require('express');
const router = express.Router();
const {
  getHistory,
  getToolHistory,
  deleteHistoryItem,
  clearHistory,
  toggleFavorite,
  getUserStats,
} = require('../controllers/historyController');
const authMiddleware = require('../middleware/authMiddleware');

// All history routes require authentication
router.use(authMiddleware);

router.get('/', getHistory);
router.get('/stats', getUserStats);
router.delete('/', clearHistory);
router.patch('/:id/favorite', toggleFavorite);
router.post('/:id/favorite', toggleFavorite);
router.get('/:tool', getToolHistory);
router.delete('/:id', deleteHistoryItem);

module.exports = router;
