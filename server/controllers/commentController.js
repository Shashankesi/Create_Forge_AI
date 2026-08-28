const Comment = require('../models/Comment');

/**
 * Get comments for an asset
 */
const getComments = async (req, res, next) => {
  try {
    const { assetType, assetId } = req.query;

    if (!assetType || !assetId) {
      return res.status(400).json({ success: false, message: 'assetType and assetId are required.' });
    }

    const comments = await Comment.find({ assetType, assetId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add review comment to an asset
 */
const addComment = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const authorName = req.user.name || 'Creator';
    const { assetType, assetId, projectId, content } = req.body;

    if (!assetType || !assetId || !content) {
      return res.status(400).json({ success: false, message: 'assetType, assetId, and content are required.' });
    }

    const comment = new Comment({
      userId,
      projectId: projectId || null,
      assetType,
      assetId,
      authorName,
      content: content.trim(),
    });

    await comment.save();

    return res.status(201).json({
      success: true,
      comment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reply to a comment
 */
const replyComment = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const authorName = req.user.name || 'Creator';
    const { content } = req.body;

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    comment.replies.push({
      userId,
      authorName,
      content: content.trim(),
      createdAt: new Date(),
    });

    await comment.save();

    return res.status(200).json({
      success: true,
      comment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle resolve status of a comment
 */
const toggleResolveComment = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    if (comment.status === 'open') {
      comment.status = 'resolved';
      comment.resolvedBy = userId;
      comment.resolvedAt = new Date();
    } else {
      comment.status = 'open';
      comment.resolvedBy = null;
      comment.resolvedAt = null;
    }

    await comment.save();

    return res.status(200).json({
      success: true,
      comment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a comment
 */
const deleteComment = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const comment = await Comment.findOneAndDelete({ _id: req.params.id, userId });
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    return res.status(200).json({ success: true, message: 'Comment deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComments,
  addComment,
  replyComment,
  toggleResolveComment,
  deleteComment,
};
