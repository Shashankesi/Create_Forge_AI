const CanvasWorkspace = require('../models/CanvasWorkspace');
const { isDbConnected } = require('../config/db');

const getMemStore = () => {
  global.__createforgeCanvas = global.__createforgeCanvas || new Map();
  return global.__createforgeCanvas;
};

/**
 * @route   GET /api/canvas
 * @desc    Get user's Creative Canvas board state
 * @access  Private
 */
const getCanvas = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    let canvas = null;
    if (isDbConnected()) {
      canvas = await CanvasWorkspace.findOne({ userId });
    } else {
      canvas = getMemStore().get(String(userId));
    }

    if (!canvas) {
      canvas = {
        title: 'Main Creative Canvas',
        nodes: [
          {
            id: 'node-welcome',
            type: 'note',
            position: { x: 80, y: 100 },
            data: {
              title: 'Welcome to CreateForge Canvas',
              text: 'Drag, drop, and link articles, prompts, visual generations, and campaign notes onto this unified visual board.',
            },
          },
        ],
        viewport: { x: 0, y: 0, zoom: 1 },
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        canvas,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/canvas
 * @desc    Save/update user's Creative Canvas state
 * @access  Private
 */
const saveCanvas = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { title, nodes, viewport } = req.body;

    const payload = {
      userId,
      title: title || 'Main Creative Canvas',
      nodes: Array.isArray(nodes) ? nodes : [],
      viewport: viewport || { x: 0, y: 0, zoom: 1 },
    };

    let canvas = null;
    if (isDbConnected()) {
      canvas = await CanvasWorkspace.findOneAndUpdate(
        { userId },
        { $set: payload },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    } else {
      canvas = {
        _id: 'canvas_' + userId,
        id: 'canvas_' + userId,
        ...payload,
        updatedAt: new Date(),
      };
      getMemStore().set(String(userId), canvas);
    }

    return res.status(200).json({
      success: true,
      message: 'Canvas workspace saved.',
      data: {
        canvas,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCanvas,
  saveCanvas,
};
