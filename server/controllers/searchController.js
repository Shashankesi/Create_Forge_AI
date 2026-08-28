const Project = require('../models/Project');
const GenerationHistory = require('../models/GenerationHistory');
const ImageGeneration = require('../models/ImageGeneration');
const Brief = require('../models/Brief');
const ResearchItem = require('../models/ResearchItem');
const Campaign = require('../models/Campaign');

/**
 * Global Search 2.0 Engine
 */
const globalSearch = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { query } = req.query;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(200).json({
        success: true,
        results: {
          projects: [],
          articles: [],
          images: [],
          briefs: [],
          research: [],
          campaigns: [],
        },
      });
    }

    const regex = new RegExp(query.trim(), 'i');

    const [projects, articles, images, briefs, research, campaigns] = await Promise.all([
      Project.find({ userId, $or: [{ name: regex }, { description: regex }, { tags: regex }] })
        .limit(5)
        .select('name description color category updatedAt'),
      GenerationHistory.find({ userId, $or: [{ title: regex }, { prompt: regex }] })
        .limit(5)
        .select('title type prompt createdAt'),
      ImageGeneration.find({ userId, $or: [{ prompt: regex }, { enhancedPrompt: regex }] })
        .limit(5)
        .select('prompt imageUrl previewUrl style isFavorite createdAt'),
      Brief.find({ userId, $or: [{ title: regex }, { targetAudience: regex }] })
        .limit(5)
        .select('title targetAudience createdAt'),
      ResearchItem.find({ userId, $or: [{ topic: regex }, { query: regex }] })
        .limit(5)
        .select('topic query keyFindings createdAt'),
      Campaign.find({ userId, $or: [{ title: regex }, { idea: regex }] })
        .limit(5)
        .select('title idea status healthScore createdAt'),
    ]);

    return res.status(200).json({
      success: true,
      query: query.trim(),
      results: {
        projects,
        articles,
        images,
        briefs,
        research,
        campaigns,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  globalSearch,
};
