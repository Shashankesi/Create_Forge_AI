const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { generateBrief, getBriefs, getBriefById } = require('../controllers/briefController');

router.use(authMiddleware);

router.post('/generate', generateBrief);
router.get('/', getBriefs);
router.get('/:id', getBriefById);

module.exports = router;
