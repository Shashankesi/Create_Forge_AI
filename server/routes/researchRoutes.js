const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { conductResearch, getResearchItems } = require('../controllers/researchController');

router.use(authMiddleware);

router.post('/conduct', conductResearch);
router.get('/', getResearchItems);

module.exports = router;
