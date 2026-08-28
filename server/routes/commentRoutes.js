const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getComments,
  addComment,
  replyComment,
  toggleResolveComment,
  deleteComment,
} = require('../controllers/commentController');

router.use(authMiddleware);

router.get('/', getComments);
router.post('/', addComment);
router.post('/:id/reply', replyComment);
router.put('/:id/resolve', toggleResolveComment);
router.delete('/:id', deleteComment);

module.exports = router;
