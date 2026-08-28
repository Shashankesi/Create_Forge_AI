const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createVersion,
  getVersions,
  renameVersion,
  deleteVersion,
} = require('../controllers/versionController');

router.use(authMiddleware);

router.post('/', createVersion);
router.get('/asset/:assetId', getVersions);
router.patch('/:id/rename', renameVersion);
router.delete('/:id', deleteVersion);

module.exports = router;
