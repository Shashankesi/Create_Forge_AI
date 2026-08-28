const User = require('../models/User');
const providerHealthService = require('../services/ai/providerHealthService');

/**
 * Get user AI preferences & personalization
 */
const getPreferences = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    return res.status(200).json({
      success: true,
      aiPreferences: user.aiPreferences,
      personalization: user.personalization,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user AI preferences
 */
const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (req.body.aiPreferences) {
      user.aiPreferences = { ...user.aiPreferences, ...req.body.aiPreferences };
    }
    if (req.body.personalization) {
      user.personalization = { ...user.personalization, ...req.body.personalization };
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'AI preferences updated.',
      aiPreferences: user.aiPreferences,
      personalization: user.personalization,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get internal AI provider health metrics (without exposing keys)
 */
const getProviderHealth = async (req, res) => {
  const health = providerHealthService.getHealthSummary();
  return res.status(200).json({
    success: true,
    providers: health,
  });
};

module.exports = {
  getPreferences,
  updatePreferences,
  getProviderHealth,
};
