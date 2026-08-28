const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getPreferences,
  updatePreferences,
  getProviderHealth,
} = require('../controllers/preferenceController');

router.use(authMiddleware);

router.get('/', getPreferences);
router.put('/', updatePreferences);
router.get('/health', getProviderHealth);

module.exports = router;
