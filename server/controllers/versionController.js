const ContentVersion = require('../models/ContentVersion');
const ActivityLog = require('../models/ActivityLog');

/**
 * Content Version Control Controller
 */
exports.createVersion = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      assetId,
      projectId,
      assetType = 'article',
      title,
      content,
      changesSummary,
      qualityScore,
      metrics,
    } = req.body;

    if (!assetId || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'assetId, title, and content are required to save a version snapshot.',
      });
    }

    // Determine next version number for this asset
    const latest = await ContentVersion.findOne({ userId, assetId }).sort({ versionNumber: -1 });
    const versionNumber = latest ? latest.versionNumber + 1 : 1;

    const newVersion = await ContentVersion.create({
      userId,
      projectId: projectId || undefined,
      assetId,
      assetType,
      versionNumber,
      name: `Version ${versionNumber}`,
      title,
      content,
      changesSummary: changesSummary || (versionNumber === 1 ? 'Initial generation snapshot' : `Snapshot update v${versionNumber}`),
      qualityScore: qualityScore || 88,
      metrics,
    });

    if (projectId) {
      await ActivityLog.create({
        userId,
        projectId,
        actionType: 'version_saved',
        title: `Saved ${newVersion.name} for "${title}"`,
        metadata: { versionId: newVersion._id, versionNumber },
      });
    }

    res.status(201).json({
      success: true,
      message: `Saved ${newVersion.name} snapshot.`,
      data: {
        version: newVersion,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getVersions = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { assetId } = req.params;

    const versions = await ContentVersion.find({ userId, assetId }).sort({ versionNumber: -1 });

    res.status(200).json({
      success: true,
      data: {
        versions,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.renameVersion = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a version name.',
      });
    }

    const version = await ContentVersion.findOneAndUpdate(
      { _id: id, userId },
      { $set: { name: name.trim() } },
      { new: true }
    );

    if (!version) {
      return res.status(404).json({
        success: false,
        message: 'Version snapshot not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { version },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteVersion = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const deleted = await ContentVersion.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Version snapshot not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Version removed.',
    });
  } catch (err) {
    next(err);
  }
};
