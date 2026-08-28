const express = require('express');
const router = express.Router();
const { getBrandKit, updateBrandKit } = require('../controllers/brandController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getBrandKit);
router.put('/', updateBrandKit);

module.exports = router;
