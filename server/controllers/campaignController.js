const Campaign = require('../models/Campaign');
const Project = require('../models/Project');
const BrandKit = require('../models/BrandKit');
const CreativeMemory = require('../models/CreativeMemory');
const campaignBuilderService = require('../services/ai/campaignBuilderService');

/**
 * Generate a new autonomous campaign plan from prompt/idea
 */
const generateCampaign = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { idea, objective, audience, projectId, brandKitId } = req.body;

    if (!idea || typeof idea !== 'string' || !idea.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a campaign idea or prompt.' });
    }

    // Retrieve active brand and creative memory if available
    let brandContext = null;
    if (brandKitId) {
      brandContext = await BrandKit.findOne({ _id: brandKitId, userId });
    } else {
      brandContext = await BrandKit.findOne({ userId });
    }

    let memoryContext = null;
    if (projectId) {
      memoryContext = await CreativeMemory.findOne({ projectId, userId });
    }

    const plan = await campaignBuilderService.generateCampaignPlan({
      idea: idea.trim(),
      objective,
      audience,
      brandContext,
      memoryContext,
    });

    const campaign = new Campaign({
      userId,
      projectId: projectId || null,
      title: plan.title || 'Autonomous Creative Campaign',
      idea: idea.trim(),
      objective: plan.objective || objective || '',
      targetAudience: plan.targetAudience || audience || '',
      strategy: plan.strategy || {},
      brief: plan.brief || {},
      researchPlan: plan.researchPlan || {},
      contentStrategy: plan.contentStrategy || {},
      seoStrategy: plan.seoStrategy || {},
      visualStrategy: plan.visualStrategy || {},
      socialStrategy: plan.socialStrategy || {},
      emailCampaign: plan.emailCampaign || {},
      ctaStrategy: plan.ctaStrategy || {},
      deliverables: plan.deliverables || [],
      healthScore: plan.healthScore || { overall: 88 },
      status: 'in_progress',
    });

    await campaign.save();

    return res.status(201).json({
      success: true,
      message: 'Autonomous Campaign Plan synthesized successfully.',
      campaign,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List campaigns for authenticated user
 */
const getCampaigns = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { projectId } = req.query;

    const query = { userId };
    if (projectId) query.projectId = projectId;

    const campaigns = await Campaign.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get campaign by ID
 */
const getCampaignById = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const campaign = await Campaign.findOne({ _id: req.params.id, userId });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign plan not found.' });
    }

    return res.status(200).json({
      success: true,
      campaign,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update campaign status or stage item
 */
const updateCampaign = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: req.body },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign plan not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Campaign updated successfully.',
      campaign,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete campaign
 */
const deleteCampaign = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, userId });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign plan not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate dynamic project campaign health
 */
const getProjectHealth = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { projectId } = req.params;

    const health = await campaignBuilderService.calculateProjectHealth(projectId, userId);
    if (!health) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    return res.status(200).json({
      success: true,
      health,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dynamic AI Next-Best-Action recommendation
 */
const getNextAction = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { projectId } = req.params;

    const nextAction = await campaignBuilderService.getNextBestAction(projectId, userId);
    if (!nextAction) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    return res.status(200).json({
      success: true,
      nextAction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get 10-point Launch Readiness Audit
 */
const getLaunchReadiness = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { projectId } = req.params;

    const readiness = await campaignBuilderService.getLaunchReadiness(projectId, userId);
    if (!readiness) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    return res.status(200).json({
      success: true,
      readiness,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  getProjectHealth,
  getNextAction,
  getLaunchReadiness,
};
