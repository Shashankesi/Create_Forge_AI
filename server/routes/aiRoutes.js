const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  generateArticle,
  generateArticleCoverImage,
  generateArticleOutline,
  generateTitles,
  generateTitleVariations,
  generateTitlesFromArticle,
  improveWeakestArea,
  improveArticleSection,
  humanizeArticle,
  detectWeakSections,
  generateSinglePlatformSocial,
  generateImage,
  removeBackground,
  repurposeContent,
  generateContentPack,
  analyzeTitle,
  enhanceImagePrompt,
  generateImageVariations,
  analyzeImageVisual,
  askAssistant,
  generateSocialPack,
  evaluateBrandConsistency,
  evaluateImageQuality,
  transformInlineText,
  compareTitles,
} = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

// Setup multer memory storage for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (PNG, JPG, JPEG, WEBP) are allowed!'), false);
    }
  },
});

// All AI generation routes are protected and rate-limited
router.use(authMiddleware);
router.use(aiLimiter);

router.post('/article', generateArticle);
router.post('/article-outline', generateArticleOutline);
router.post('/article-cover-image', generateArticleCoverImage);
router.post('/article-improve-weakest', improveWeakestArea);
router.post('/article-improve-section', improveArticleSection);
router.post('/article-humanize', humanizeArticle);
router.post('/article-weak-sections', detectWeakSections);
router.post('/titles', generateTitles);
router.post('/title-variations', generateTitleVariations);
router.post('/titles-from-article', generateTitlesFromArticle);
router.post('/title-analyze', analyzeTitle);
router.post('/title-compare', compareTitles);
router.post('/image', generateImage);
router.post('/prompt-enhance', enhanceImagePrompt);
router.post('/image-variations', generateImageVariations);
router.post('/image-analyze', upload.single('image'), analyzeImageVisual);
router.post('/image-quality', evaluateImageQuality);
router.post('/background-remove', upload.single('image'), removeBackground);
router.post('/repurpose', repurposeContent);
router.post('/content-pack', generateContentPack);
router.post('/social-pack', generateSocialPack);
router.post('/social-single-platform', generateSinglePlatformSocial);
router.post('/brand-consistency', evaluateBrandConsistency);
router.post('/inline-transform', transformInlineText);
router.post('/assistant', askAssistant);

module.exports = router;
