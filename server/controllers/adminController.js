const User = require('../models/User');
const GenerationHistory = require('../models/GenerationHistory');
const { isDbConnected } = require('../config/db');

/**
 * @route   GET /api/admin/stats
 */
const getAdminStats = async (req, res, next) => {
  try {
    let totalUsers = 0;
    let totalGenerations = 0;
    let toolStats = {
      article: 0,
      title: 0,
      image: 0,
      'background-removal': 0,
    };

    if (isDbConnected()) {
      try {
        totalUsers = await User.countDocuments();
        totalGenerations = await GenerationHistory.countDocuments();

        const toolAgg = await GenerationHistory.aggregate([
          { $group: { _id: '$tool', count: { $sum: 1 } } },
        ]);

        toolAgg.forEach((item) => {
          if (item._id && toolStats[item._id] !== undefined) {
            toolStats[item._id] = item.count;
          }
        });
      } catch (err) {
        // Fallback
      }
    } else {
      const usersStore = global.__createforgeUsers || global.__pixoraUsers || new Map();
      const historyStore = global.__createforgeHistory || global.__pixoraHistory || [];
      totalUsers = Math.max(usersStore.size, 2);
      totalGenerations = historyStore.length;
      historyStore.forEach((h) => {
        if (h.tool && toolStats[h.tool] !== undefined) {
          toolStats[h.tool]++;
        }
      });
    }

    let mostUsedTool = 'article';
    let maxCount = -1;
    for (const [tool, count] of Object.entries(toolStats)) {
      if (count > maxCount) {
        maxCount = count;
        mostUsedTool = tool;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalGenerations,
        mostUsedTool,
        toolBreakdown: toolStats,
        systemHealth: 'Optimal',
        serverUptimeSeconds: Math.floor(process.uptime()),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/users
 */
const getAdminUsers = async (req, res, next) => {
  try {
    let usersWithStats = [];

    if (isDbConnected()) {
      try {
        const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(50);
        usersWithStats = await Promise.all(
          users.map(async (u) => {
            let genCount = 0;
            try {
              genCount = await GenerationHistory.countDocuments({ userId: u._id });
            } catch {
              genCount = 0;
            }
            return {
              id: u._id,
              name: u.name,
              email: u.email,
              role: u.role,
              createdAt: u.createdAt,
              generationsCount: genCount,
            };
          })
        );
      } catch (err) {
        // Fallback
      }
    }

    if (usersWithStats.length === 0) {
      const usersStore = global.__createforgeUsers || global.__pixoraUsers || new Map();
      const historyStore = global.__createforgeHistory || global.__pixoraHistory || [];
      usersWithStats = Array.from(usersStore.values()).map((u) => ({
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt || new Date(),
        generationsCount: historyStore.filter((h) => String(h.userId) === String(u._id || u.id)).length,
      }));
    }

    return res.status(200).json({
      success: true,
      data: {
        users: usersWithStats,
        count: usersWithStats.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/usage
 */
const getAdminUsage = async (req, res, next) => {
  try {
    let recentGenerations = [];

    if (isDbConnected()) {
      try {
        recentGenerations = await GenerationHistory.find()
          .populate('userId', 'name email')
          .sort({ createdAt: -1 })
          .limit(50);
      } catch (err) {
        recentGenerations = [];
      }
    }

    if (recentGenerations.length === 0) {
      const historyStore = global.__createforgeHistory || global.__pixoraHistory || [];
      recentGenerations = historyStore.slice(0, 50);
    }

    return res.status(200).json({
      success: true,
      data: {
        recentGenerations,
        count: recentGenerations.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAdminUsers,
  getAdminUsage,
};
