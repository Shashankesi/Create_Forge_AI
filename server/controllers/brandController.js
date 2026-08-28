const BrandKit = require('../models/BrandKit');
const { isDbConnected } = require('../config/db');

const getMemStore = () => {
  global.__createforgeBrandKits = global.__createforgeBrandKits || new Map();
  return global.__createforgeBrandKits;
};

/**
 * @route   GET /api/brand
 * @desc    Get authenticated user's Brand Kit
 * @access  Private
 */
const getBrandKit = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    let brandKit = null;
    if (isDbConnected()) {
      brandKit = await BrandKit.findOne({ userId });
    } else {
      brandKit = getMemStore().get(String(userId));
    }

    if (!brandKit) {
      // Default initial brand kit template
      const defaultKit = {
        brandName: '',
        tagline: '',
        description: '',
        targetAudience: 'Creators & Innovators',
        toneOfVoice: 'Visionary',
        preferredKeywords: [],
        wordsToAvoid: [],
        colors: {
          primary: '#6366F1',
          secondary: '#A855F7',
          accent: '#EC4899',
          background: '#0B0F19',
        },
        logoUrl: '',
      };

      return res.status(200).json({
        success: true,
        data: {
          brandKit: defaultKit,
          isConfigured: false,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        brandKit,
        isConfigured: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/brand
 * @desc    Update or create authenticated user's Brand Kit
 * @access  Private
 */
const updateBrandKit = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      brandName,
      tagline,
      description,
      targetAudience,
      toneOfVoice,
      preferredKeywords,
      wordsToAvoid,
      colors,
      logoUrl,
    } = req.body;

    if (!brandName || !brandName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a brand name.',
      });
    }

    const payload = {
      userId,
      brandName: brandName.trim(),
      tagline: tagline?.trim() || '',
      description: description?.trim() || '',
      targetAudience: targetAudience || 'General Audience',
      toneOfVoice: toneOfVoice || 'Visionary',
      preferredKeywords: Array.isArray(preferredKeywords) ? preferredKeywords : [],
      wordsToAvoid: Array.isArray(wordsToAvoid) ? wordsToAvoid : [],
      colors: colors || {
        primary: '#6366F1',
        secondary: '#A855F7',
        accent: '#EC4899',
        background: '#0B0F19',
      },
      logoUrl: logoUrl || '',
    };

    let brandKit = null;
    if (isDbConnected()) {
      brandKit = await BrandKit.findOneAndUpdate(
        { userId },
        { $set: payload },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    } else {
      brandKit = {
        _id: 'brand_' + userId,
        id: 'brand_' + userId,
        ...payload,
        updatedAt: new Date(),
      };
      getMemStore().set(String(userId), brandKit);
    }

    return res.status(200).json({
      success: true,
      message: 'Brand Kit updated successfully.',
      data: {
        brandKit,
        isConfigured: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBrandKit,
  updateBrandKit,
};
