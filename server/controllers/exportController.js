const Project = require('../models/Project');
const Brief = require('../models/Brief');
const BrandKit = require('../models/BrandKit');
const ActivityLog = require('../models/ActivityLog');
const exportService = require('../services/exportService');

/**
 * Export Center & Campaign Package Controller
 */
exports.exportCampaign = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { projectId } = req.params;

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Load Brief and Brand Kit in parallel
    const [brief, brandKit] = await Promise.all([
      project.activeBriefId ? Brief.findOne({ _id: project.activeBriefId, userId }) : null,
      BrandKit.findOne({ userId }),
    ]);

    const packageResult = exportService.packageProjectCampaign({
      project,
      brief,
      brandKit,
      assets: project.items || [],
    });

    // Log Activity
    await ActivityLog.create({
      userId,
      projectId,
      actionType: 'campaign_exported',
      title: `Exported Complete Campaign for "${project.name}"`,
    });

    res.status(200).json({
      success: true,
      message: 'Campaign package compiled.',
      data: packageResult,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProjectTimeline = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { projectId } = req.params;

    const activities = await ActivityLog.find({ userId, projectId })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      data: {
        activities,
      },
    });
  } catch (err) {
    next(err);
  }
};
