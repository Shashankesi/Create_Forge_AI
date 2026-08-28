const Brief = require('../models/Brief');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const briefService = require('../services/ai/briefService');

/**
 * Creative Brief Controller
 */
exports.generateBrief = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      rawInput,
      projectName,
      projectId,
      targetAudience,
      industry,
      brandPersonality,
    } = req.body;

    if (!rawInput || !rawInput.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide ideas, notes, or campaign goals to generate a brief.',
      });
    }

    const briefData = await briefService.generateBrief({
      rawInput: rawInput.trim(),
      projectName,
      targetAudience,
      industry,
      brandPersonality,
    });

    // Persist to MongoDB
    const brief = await Brief.create({
      userId,
      projectId: projectId || undefined,
      projectName: briefData.projectName,
      campaignObjective: briefData.campaignObjective,
      targetAudience: briefData.targetAudience,
      industry: briefData.industry,
      mainTopic: briefData.mainTopic,
      brandPersonality: briefData.brandPersonality,
      contentGoal: briefData.contentGoal,
      primaryPlatform: briefData.primaryPlatform,
      callToAction: briefData.callToAction,
      keywords: briefData.keywords,
      visualDirection: briefData.visualDirection,
      competitors: briefData.competitors,
      requiredDeliverables: briefData.requiredDeliverables,
      aiRecommendations: briefData.aiRecommendations,
      status: 'active',
    });

    // Update project stageProgress and activeBriefId if projectId provided
    if (projectId) {
      await Project.findOneAndUpdate(
        { _id: projectId, userId },
        {
          $set: {
            'stageProgress.brief': true,
            activeBriefId: brief._id,
          },
          $push: {
            items: {
              assetType: 'brief',
              title: `Brief: ${brief.projectName}`,
              content: briefData,
              createdAt: new Date(),
            },
          },
        }
      );

      // Log Activity
      await ActivityLog.create({
        userId,
        projectId,
        actionType: 'brief_generated',
        title: `Generated Creative Brief for "${brief.projectName}"`,
        metadata: { briefId: brief._id },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Creative Brief generated and saved.',
      data: {
        brief,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getBriefs = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { projectId } = req.query;

    const query = { userId };
    if (projectId) query.projectId = projectId;

    const briefs = await Brief.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        briefs,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getBriefById = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const brief = await Brief.findOne({ _id: req.params.id, userId });

    if (!brief) {
      return res.status(404).json({
        success: false,
        message: 'Creative Brief not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        brief,
      },
    });
  } catch (err) {
    next(err);
  }
};
