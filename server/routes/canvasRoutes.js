const express = require('express');
const router = express.Router();
const { getCanvas, saveCanvas } = require('../controllers/canvasController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getCanvas);
router.put('/', saveCanvas);

module.exports = router;
