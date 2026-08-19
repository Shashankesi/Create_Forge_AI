const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  generateArticle,
  generateArticleCoverImage,
  generateTitles,
  generateImage,
  removeBackground,
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
router.post('/article-cover-image', generateArticleCoverImage);
router.post('/titles', generateTitles);
router.post('/image', generateImage);
router.post('/background-remove', upload.single('image'), removeBackground);

module.exports = router;
