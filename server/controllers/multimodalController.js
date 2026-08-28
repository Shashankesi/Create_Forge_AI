const multimodalIntelligenceService = require('../services/ai/multimodalIntelligenceService');
const smartOptimizationService = require('../services/ai/smartOptimizationService');
const BrandKit = require('../models/BrandKit');

/**
 * Image to Campaign conversion
 */
const imageToCampaign = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { imageDescription, imageUrl, visualKeywords, brandKitId } = req.body;

    if (!imageDescription || typeof imageDescription !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide an image description or analysis.' });
    }

    let brandContext = null;
    if (brandKitId) {
      brandContext = await BrandKit.findOne({ _id: brandKitId, userId });
    } else {
      brandContext = await BrandKit.findOne({ userId });
    }

    const campaign = await multimodalIntelligenceService.imageToCampaign({
      imageDescription,
      imageUrl,
      visualKeywords,
      brandContext,
    });

    return res.status(200).json({
      success: true,
      message: 'Campaign created from visual asset.',
      campaign,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Article to Visual plan
 */
const articleToVisual = async (req, res, next) => {
  try {
    const { articleTitle, articleContent, visualStyle, brandColors } = req.body;

    if (!articleTitle || !articleContent) {
      return res.status(400).json({ success: false, message: 'Article title and content are required.' });
    }

    const visualPlan = await multimodalIntelligenceService.articleToVisual({
      articleTitle,
      articleContent,
      visualStyle: visualStyle || 'Cinematic High-Tech Studio',
      brandColors: brandColors || [],
    });

    return res.status(200).json({
      success: true,
      visualPlan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Convert article to video storyboard blueprint
 */
const articleToVideoBlueprint = async (req, res, next) => {
  try {
    const { articleTitle, articleContent, videoFormat } = req.body;

    if (!articleTitle || !articleContent) {
      return res.status(400).json({ success: false, message: 'Article title and content are required.' });
    }

    const blueprint = await multimodalIntelligenceService.articleToVideoBlueprint({
      articleTitle,
      articleContent,
      videoFormat: videoFormat || 'Short-Form (60s)',
    });

    return res.status(200).json({
      success: true,
      blueprint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Presentation Builder
 */
const generatePresentation = async (req, res, next) => {
  try {
    const { topic, context, targetSlides } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ success: false, message: 'Presentation topic is required.' });
    }

    const presentation = await multimodalIntelligenceService.generatePresentation({
      topic,
      context,
      targetSlides: Number(targetSlides) || 6,
    });

    return res.status(200).json({
      success: true,
      presentation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Smart Content Gap Analysis
 */
const analyzeContentGaps = async (req, res, next) => {
  try {
    const { topic, articleContent, keywords, audience } = req.body;

    if (!topic || !articleContent) {
      return res.status(400).json({ success: false, message: 'Topic and article content are required.' });
    }

    const gaps = await smartOptimizationService.analyzeContentGaps({
      topic,
      articleContent,
      keywords: keywords || [],
      audience,
    });

    return res.status(200).json({
      success: true,
      gaps,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Naturalness & Originality Review
 */
const checkNaturalness = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ success: false, message: 'Content text is required.' });
    }

    const review = await smartOptimizationService.checkNaturalnessAndOriginality({ content });

    return res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Smart Headline Lab
 */
const generateHeadlineLab = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { topic, audience, articleContext } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, message: 'Topic is required.' });
    }

    const brand = await BrandKit.findOne({ userId });

    const result = await smartOptimizationService.generateHeadlineLab({
      topic,
      audience,
      articleContext,
      brandContext: brand,
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
 * AI CTA Optimizer
 */
const optimizeCta = async (req, res, next) => {
  try {
    const { currentCta, goal, platform, brandVoice } = req.body;

    const result = await smartOptimizationService.optimizeCta({
      currentCta,
      goal,
      platform,
      brandVoice,
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
 * Creative A/B Lab Comparison
 */
const runAbComparison = async (req, res, next) => {
  try {
    const { variantA, variantB, assetType, targetAudience } = req.body;

    if (!variantA || !variantB) {
      return res.status(400).json({ success: false, message: 'Both Variant A and Variant B are required.' });
    }

    const result = await smartOptimizationService.runAbComparison({
      variantA,
      variantB,
      assetType,
      targetAudience,
    });

    return res.status(200).json({
      success: true,
      comparison: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ingest Document (PDF/DOCX/TXT)
 */
const ingestDocument = async (req, res, next) => {
  try {
    const { textContent, fileName, projectId } = req.body;
    let name = fileName || 'Uploaded Document';
    let fileType = 'txt';
    let rawBuffer = null;

    if (req.file) {
      name = req.file.originalname || name;
      fileType = req.file.originalname.split('.').pop().toLowerCase() || 'txt';
      rawBuffer = req.file.buffer;
    }

    const result = await multimodalIntelligenceService.ingestDocument({
      fileName: name,
      fileType,
      textContent: textContent || '',
      rawBuffer,
    });

    return res.status(200).json({
      success: true,
      message: 'Document analyzed successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ingest Audio / Spoken Brainstorm
 */
const ingestAudio = async (req, res, next) => {
  try {
    const { audioTranscript, fileName, durationSeconds } = req.body;
    let name = fileName || 'Audio Recording';

    if (req.file) {
      name = req.file.originalname || name;
    }

    const result = await multimodalIntelligenceService.ingestAudio({
      audioTranscript: audioTranscript || '',
      fileName: name,
      durationSeconds: Number(durationSeconds) || 0,
    });

    return res.status(200).json({
      success: true,
      message: 'Audio transcript analyzed successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Image Visual to FLUX Prompt
 */
const analyzeImageVisualPrompt = async (req, res, next) => {
  try {
    const { imageDescription, detectedSubject, visualStyle } = req.body;

    const result = await multimodalIntelligenceService.analyzeImageVisualPrompt({
      imageDescription,
      detectedSubject,
      visualStyle,
    });

    return res.status(200).json({
      success: true,
      message: 'FLUX prompt generated from visual analysis.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  imageToCampaign,
  articleToVisual,
  articleToVideoBlueprint,
  generatePresentation,
  analyzeContentGaps,
  checkNaturalness,
  generateHeadlineLab,
  optimizeCta,
  runAbComparison,
  ingestDocument,
  ingestAudio,
  analyzeImageVisualPrompt,
};
