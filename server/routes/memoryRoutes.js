const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getMemory,
  updateMemory,
  recordDecision,
  clearMemory,
} = require('../controllers/memoryController');

router.use(authMiddleware);

router.get('/:projectId', getMemory);
router.put('/:projectId', updateMemory);
router.post('/:projectId/decision', recordDecision);
router.delete('/:projectId', clearMemory);

module.exports = router;
