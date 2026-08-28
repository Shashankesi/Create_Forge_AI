const Moodboard = require('../models/Moodboard');
const Project = require('../models/Project');
const BrandKit = require('../models/BrandKit');
const creativeDirectionService = require('../services/ai/creativeDirectionService');

/**
 * Get or create moodboard for a project
 */
const getMoodboard = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { projectId } = req.params;

    let moodboard = await Moodboard.findOne({ projectId, userId });
    if (!moodboard) {
      moodboard = new Moodboard({
        projectId,
        userId,
        title: 'Campaign Visual Moodboard',
        cards: [],
      });
      await moodboard.save();
    }

    return res.status(200).json({
      success: true,
      moodboard,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * AI Synthesize Creative Direction & Moodboard theme
 */
const generateCreativeDirection = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { projectId, goal } = req.body;

    const project = projectId ? await Project.findOne({ _id: projectId, userId }) : null;
    const brand = await BrandKit.findOne({ userId });

    const direction = await creativeDirectionService.generateCreativeDirection({
      projectContext: project,
      brandContext: brand,
      goal,
    });

    let moodboard = null;
    if (projectId) {
      moodboard = await Moodboard.findOne({ projectId, userId });
      if (!moodboard) {
        moodboard = new Moodboard({ projectId, userId, title: 'Project Visual Moodboard' });
      }
      moodboard.theme = direction.theme;

      // Seed initial cards from sample keywords and colors
      if (moodboard.cards.length === 0) {
        const initialCards = [];
        direction.theme.colorPalette.forEach((c, idx) => {
          initialCards.push({
            id: 'c_col_' + idx,
            type: 'color',
            content: c.hex,
            title: c.name,
            tags: [c.role],
            position: { x: (idx % 3) * 200, y: Math.floor(idx / 3) * 160, w: 180, h: 140 },
          });
        });
        direction.visualKeywords.slice(0, 4).forEach((kw, idx) => {
          initialCards.push({
            id: 'c_kw_' + idx,
            type: 'keyword',
            content: kw,
            title: 'Keyword',
            position: { x: (idx % 2) * 200, y: 300 + Math.floor(idx / 2) * 100, w: 180, h: 80 },
          });
        });
        moodboard.cards = initialCards;
      }
      await moodboard.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Creative Direction synthesized successfully.',
      direction,
      moodboard,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate FLUX visual prompt matching active moodboard
 */
const generateVisualMatchingMoodboard = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { moodboardId } = req.params;
    const { intent } = req.body;

    const result = await creativeDirectionService.generateVisualMatchingMoodboard({
      moodboardId,
      userId,
      promptIntent: intent,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Moodboard cards and theme
 */
const updateMoodboard = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const moodboard = await Moodboard.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true }
    );

    if (!moodboard) {
      return res.status(404).json({ success: false, message: 'Moodboard not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Moodboard updated.',
      moodboard,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Apply moodboard visual direction to project visual context
 */
const applyDirectionToProject = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { moodboardId, projectId } = req.body;

    const moodboard = await Moodboard.findOne({ _id: moodboardId, userId });
    if (!moodboard) return res.status(404).json({ success: false, message: 'Moodboard not found.' });

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    project.visualContext = {
      mood: moodboard.theme?.mood || '',
      colorPalette: moodboard.theme?.colorPalette?.map((c) => c.hex) || [],
      photographyStyle: moodboard.theme?.photographyStyle || '',
      illustrationStyle: moodboard.theme?.illustrationStyle || '',
      typography: {
        heading: moodboard.theme?.typography?.heading || '',
        body: moodboard.theme?.typography?.body || '',
      },
    };

    await project.save();

    return res.status(200).json({
      success: true,
      message: 'Creative visual direction applied to project context.',
      project,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMoodboard,
  generateCreativeDirection,
  generateVisualMatchingMoodboard,
  updateMoodboard,
  applyDirectionToProject,
};
