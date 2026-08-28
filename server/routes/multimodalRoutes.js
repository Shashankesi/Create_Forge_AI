const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const {
  imageToCampaign,
  articleToVisual,
  articleToVideoBlueprint,
  generatePresentation,
  analyzeContentGaps,
  checkNaturalness,
  generateHeadlineLab,
  optimizeCta,
  runAbComparison,
  ingestDocument,
  ingestAudio,
  analyzeImageVisualPrompt,
} = require('../controllers/multimodalController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
});

router.use(authMiddleware);

router.post('/ingest-document', upload.single('file'), aiLimiter, ingestDocument);
router.post('/ingest-audio', upload.single('audio'), aiLimiter, ingestAudio);
router.post('/image-prompt', aiLimiter, analyzeImageVisualPrompt);
router.post('/image-to-campaign', aiLimiter, imageToCampaign);
router.post('/article-to-visual', aiLimiter, articleToVisual);
router.post('/video-blueprint', aiLimiter, articleToVideoBlueprint);
router.post('/presentation', aiLimiter, generatePresentation);
router.post('/content-gap', aiLimiter, analyzeContentGaps);
router.post('/naturalness-check', aiLimiter, checkNaturalness);
router.post('/headline-lab', aiLimiter, generateHeadlineLab);
router.post('/cta-optimizer', aiLimiter, optimizeCta);
router.post('/ab-test', aiLimiter, runAbComparison);

module.exports = router;
