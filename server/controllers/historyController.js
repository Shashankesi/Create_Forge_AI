const GenerationHistory = require('../models/GenerationHistory');
const { isDbConnected } = require('../config/db');

/**
 * @route   GET /api/history
 * @desc    Get user's generation history with optional tool filter & search
 * @access  Private
 */
const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { tool, search, favorites, isFavorite, page = 1, limit = 20 } = req.query;

    let records = [];
    let total = 0;

    if (isDbConnected()) {
      try {
        const query = { userId };
        if (tool && tool !== 'all') query.tool = tool;
        if (favorites === 'true' || isFavorite === 'true') query.isFavorite = true;

        total = await GenerationHistory.countDocuments(query);
        records = await GenerationHistory.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number(limit));
      } catch (err) {
        records = [];
      }
    } else {
      const historyStore = global.__createforgeHistory || global.__pixoraHistory || [];
      let list = historyStore.filter((h) => String(h.userId) === String(userId));
      if (tool && tool !== 'all') {
        list = list.filter((h) => h.tool === tool);
      }
      if (favorites === 'true' || isFavorite === 'true') {
        list = list.filter((h) => h.isFavorite === true);
      }
      total = list.length;
      records = list.slice((page - 1) * limit, page * limit);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      records = records.filter((item) => {
        const promptStr = JSON.stringify(item.prompt || '').toLowerCase();
        const resultStr = JSON.stringify(item.result || '').toLowerCase();
        return promptStr.includes(q) || resultStr.includes(q);
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        history: records,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)) || 1,
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/history/:tool
 * @desc    Get user's history for a specific tool
 * @access  Private
 */
const getToolHistory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { tool } = req.params;

    let records = [];
    if (isDbConnected()) {
      try {
        records = await GenerationHistory.find({ userId, tool })
          .sort({ createdAt: -1 })
          .limit(30);
      } catch (err) {
        records = [];
      }
    } else {
      const historyStore = global.__createforgeHistory || global.__pixoraHistory || [];
      records = historyStore
        .filter((h) => String(h.userId) === String(userId) && h.tool === tool)
        .slice(0, 30);
    }

    return res.status(200).json({
      success: true,
      data: {
        tool,
        history: records,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/history/:id
 * @desc    Delete a specific history item strictly belonging to the authenticated user
 * @access  Private
 */
const deleteHistoryItem = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    if (isDbConnected()) {
      const item = await GenerationHistory.findOne({ _id: id, userId });
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'History item not found or you do not have permission to delete it.',
        });
      }
      await item.deleteOne();
    } else {
      const historyStore = global.__createforgeHistory || global.__pixoraHistory || [];
      const idx = historyStore.findIndex(
        (h) => (h._id || h.id) === id && String(h.userId) === String(userId)
      );
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'History item not found or you do not have permission to delete it.',
        });
      }
      historyStore.splice(idx, 1);
    }

    return res.status(200).json({
      success: true,
      message: 'Item removed from your history.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/history
 * @desc    Clear all generation history for the authenticated user
 * @access  Private
 */
const clearHistory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (isDbConnected()) {
      await GenerationHistory.deleteMany({ userId });
    } else {
      const historyStore = global.__createforgeHistory || global.__pixoraHistory || [];
      const filtered = historyStore.filter((h) => String(h.userId) !== String(userId));
      global.__createforgeHistory = filtered;
      global.__pixoraHistory = filtered;
    }

    return res.status(200).json({
      success: true,
      message: 'Your generation history has been cleared.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/history/:id/favorite
 * @desc    Toggle favorite status of a history item
 * @access  Private
 */
const toggleFavorite = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    let item = null;
    if (isDbConnected()) {
      item = await GenerationHistory.findOne({ _id: id, userId });
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'History item not found or you do not have permission to modify it.',
        });
      }
      item.isFavorite = !item.isFavorite;
      await item.save();
    } else {
      const historyStore = global.__createforgeHistory || global.__pixoraHistory || [];
      item = historyStore.find(
        (h) => (h._id || h.id) === id && String(h.userId) === String(userId)
      );
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'History item not found or you do not have permission to modify it.',
        });
      }
      item.isFavorite = !item.isFavorite;
    }

    return res.status(200).json({
      success: true,
      data: item,
      message: item.isFavorite ? 'Saved to favorites' : 'Removed from favorites',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/history/user/stats
 * @desc    Get real-time MongoDB user creation metrics
 * @access  Private
 */
const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const Project = require('../models/Project');

    let totalCreations = 0;
    let articles = 0;
    let images = 0;
    let titles = 0;
    let social = 0;
    let backgroundRemoval = 0;
    let totalProjects = 0;
    let favoritesCount = 0;

    if (isDbConnected()) {
      try {
        const query = { userId };
        totalCreations = await GenerationHistory.countDocuments(query);
        articles = await GenerationHistory.countDocuments({ userId, tool: 'article' });
        images = await GenerationHistory.countDocuments({ userId, tool: 'image' });
        titles = await GenerationHistory.countDocuments({ userId, tool: 'title' });
        social = await GenerationHistory.countDocuments({ userId, tool: 'social' });
        backgroundRemoval = await GenerationHistory.countDocuments({ userId, tool: 'background-removal' });
        favoritesCount = await GenerationHistory.countDocuments({ userId, isFavorite: true });
        totalProjects = await Project.countDocuments({ userId });
      } catch (err) {
        // Fallback
      }
    } else {
      const historyStore = global.__createforgeHistory || global.__pixoraHistory || [];
      const userItems = historyStore.filter((h) => String(h.userId) === String(userId));
      totalCreations = userItems.length;
      articles = userItems.filter((h) => h.tool === 'article').length;
      images = userItems.filter((h) => h.tool === 'image').length;
      titles = userItems.filter((h) => h.tool === 'title').length;
      social = userItems.filter((h) => h.tool === 'social').length;
      backgroundRemoval = userItems.filter((h) => h.tool === 'background-removal').length;
      favoritesCount = userItems.filter((h) => h.isFavorite === true).length;
      const projectStore = global.__createforgeProjects || [];
      totalProjects = projectStore.filter((p) => String(p.userId) === String(userId)).length;
    }

    return res.status(200).json({
      success: true,
      data: {
        totalCreations,
        articles,
        images,
        titles,
        social,
        backgroundRemoval,
        projects: totalProjects,
        saved: favoritesCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHistory,
  getToolHistory,
  deleteHistoryItem,
  clearHistory,
  toggleFavorite,
  getUserStats,
};
