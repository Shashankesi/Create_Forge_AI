const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { exportCampaign, getProjectTimeline } = require('../controllers/exportController');

router.use(authMiddleware);

router.get('/campaign/:projectId', exportCampaign);
router.get('/timeline/:projectId', getProjectTimeline);

module.exports = router;
