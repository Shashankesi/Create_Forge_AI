const ResearchItem = require('../models/ResearchItem');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const researchService = require('../services/ai/researchService');

/**
 * Research Studio Controller
 */
exports.conductResearch = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { topic, targetAudience, industry, projectId } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a research topic.',
      });
    }

    const researchData = await researchService.conductResearch({
      topic: topic.trim(),
      targetAudience,
      industry,
    });

    // Save research findings to MongoDB
    const researchItem = await ResearchItem.create({
      userId,
      projectId: projectId || undefined,
      topic: researchData.topic,
      targetAudience: targetAudience || 'General',
      searchIntent: researchData.searchIntent,
      keyPoints: researchData.keyPoints,
      questionsPeopleAsk: researchData.questionsPeopleAsk,
      audiencePainPoints: researchData.audiencePainPoints,
      contentGaps: researchData.contentGaps,
      suggestedSources: researchData.suggestedSources,
      faqIdeas: researchData.faqIdeas,
      competitorAngle: researchData.competitorAngle,
    });

    // Update project stageProgress
    if (projectId) {
      await Project.findOneAndUpdate(
        { _id: projectId, userId },
        {
          $set: { 'stageProgress.research': true },
          $push: {
            items: {
              assetType: 'research',
              title: `Research: ${researchData.topic}`,
              content: researchData,
              createdAt: new Date(),
            },
          },
        }
      );

      await ActivityLog.create({
        userId,
        projectId,
        actionType: 'research_completed',
        title: `Conducted Research on "${researchData.topic}"`,
        metadata: { researchId: researchItem._id },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Research dossier assembled.',
      data: {
        research: researchItem,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getResearchItems = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { projectId } = req.query;

    const query = { userId };
    if (projectId) query.projectId = projectId;

    const researchItems = await ResearchItem.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        researchItems,
      },
    });
  } catch (err) {
    next(err);
  }
};
