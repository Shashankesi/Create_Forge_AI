const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const {
  generateCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  getProjectHealth,
  getNextAction,
  getLaunchReadiness,
} = require('../controllers/campaignController');

router.use(authMiddleware);

// Campaign generation & CRUD
router.post('/generate', aiLimiter, generateCampaign);
router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);

// Project health & intelligence endpoints
router.get('/health/:projectId', getProjectHealth);
router.get('/next-action/:projectId', getNextAction);
router.get('/launch-readiness/:projectId', getLaunchReadiness);

module.exports = router;
