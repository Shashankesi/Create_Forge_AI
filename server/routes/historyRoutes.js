const express = require('express');
const router = express.Router();
const {
  getHistory,
  getToolHistory,
  deleteHistoryItem,
  clearHistory,
} = require('../controllers/historyController');
const authMiddleware = require('../middleware/authMiddleware');

// All history routes require authentication
router.use(authMiddleware);

router.get('/', getHistory);
router.delete('/', clearHistory);
router.get('/:tool', getToolHistory);
router.delete('/:id', deleteHistoryItem);

module.exports = router;
