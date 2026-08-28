const creativeMemoryService = require('../services/ai/creativeMemoryService');

/**
 * Get project creative memory
 */
const getMemory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { projectId } = req.params;

    const memory = await creativeMemoryService.getOrCreateMemory(projectId, userId);

    return res.status(200).json({
      success: true,
      memory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update project memory (terms, objective, audience)
 */
const updateMemory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { projectId } = req.params;

    const memory = await creativeMemoryService.updateMemory(projectId, userId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Creative memory updated.',
      memory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record user asset decision (approved, rejected, favorite)
 */
const recordDecision = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { projectId } = req.params;
    const { type, title, status, feedback, summary, keywords } = req.body;

    if (!type || !title || !status) {
      return res.status(400).json({ success: false, message: 'Type, title, and status are required.' });
    }

    const memory = await creativeMemoryService.recordDecision(projectId, userId, {
      type,
      title,
      status,
      feedback,
      summary,
      keywords,
    });

    return res.status(200).json({
      success: true,
      message: `Creative decision saved: ${status}.`,
      memory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear all memory entries for a project
 */
const clearMemory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { projectId } = req.params;

    const memory = await creativeMemoryService.clearMemory(projectId, userId);

    return res.status(200).json({
      success: true,
      message: 'Project creative memory cleared.',
      memory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMemory,
  updateMemory,
  recordDecision,
  clearMemory,
};
