const articleService = require('../services/ai/articleService');
const titleService = require('../services/ai/titleService');
const imageService = require('../services/ai/imageService');
const imageGenerationService = require('../services/imageGenerationService');
const backgroundService = require('../services/ai/backgroundService');
const GenerationHistory = require('../models/GenerationHistory');
const { isDbConnected } = require('../config/db');
const {
  validateArticleInput,
  validateTitleInput,
  validateImageInput,
} = require('../utils/validation');

/**
 * Normalizes provider / runtime AI errors into friendly user messages
 */
const normalizeAIError = (error) => {
  const rawMsg = error?.message || '';
  const status = error?.statusCode || error?.status || error?.response?.status;
  const code = error?.code;

  if (status === 400 || code === 'INVALID_PARAMETERS' || code === 'INVALID_PROMPT' || code === 'VALIDATION_ERROR') {
    return {
      status: 400,
      code: 'INVALID_PARAMETERS',
      message: error?.message || 'Invalid image generation parameters. Please check your prompt and options.',
      retryable: false,
    };
  }

  if (status === 401 || code === 'AUTH_ERROR') {
    return {
      status: 401,
      code: 'AUTH_ERROR',
      message: 'Image generation service authentication failed. Please check the server configuration.',
      retryable: false,
    };
  }

  if (status === 402 || code === 'INSUFFICIENT_CREDITS') {
    return {
      status: 402,
      code: 'INSUFFICIENT_CREDITS',
      message: 'Image generation credits are currently unavailable.',
      retryable: true,
    };
  }

  if (status === 403 || code === 'MODEL_FORBIDDEN') {
    return {
      status: 403,
      code: 'MODEL_FORBIDDEN',
      message: 'The selected image model is not available for this API key.',
      retryable: false,
    };
  }

  if (status === 429 || code === 'RATE_LIMITED' || rawMsg.includes('rate limit') || rawMsg.includes('429')) {
    return {
      status: 429,
      code: 'RATE_LIMITED',
      message: 'Image generation is temporarily busy. Please try again shortly.',
      retryable: true,
    };
  }

  if (status === 504 || code === 'TIMEOUT' || rawMsg.includes('timeout') || rawMsg.includes('timed out') || rawMsg.includes('ECONNABORTED')) {
    return {
      status: 504,
      code: 'AI_TIMEOUT',
      message: 'Image generation timed out. Please try again.',
      retryable: true,
    };
  }

  return {
    status: status && status >= 400 && status < 600 ? status : 500,
    code: code || 'AI_GENERATION_FAILED',
    message: error?.message || 'The image service is temporarily unavailable.',
    retryable: true,
  };
};

/**
 * Record generation history in database or in-memory store
 */
const recordHistory = async ({ userId, tool, prompt, result, metadata }) => {
  try {
    if (!userId) return null;

    let sanitizedResult = result;
    // For images, persist the URL or base64
    if (tool === 'image' && result && typeof result.imageUrl === 'string' && result.imageUrl.length > 500000) {
      sanitizedResult = {
        ...result,
        imageUrl: result.imageUrl.substring(0, 300) + '...[truncated for DB storage]',
      };
    } else if (tool === 'background-removal' && result && typeof result.processedImageUrl === 'string' && result.processedImageUrl.length > 500000) {
      sanitizedResult = {
        ...result,
        processedImageUrl: result.processedImageUrl.substring(0, 300) + '...[truncated for DB storage]',
        originalUrl: null,
      };
    }

    if (isDbConnected()) {
      try {
        const historyRecord = await GenerationHistory.create({
          userId,
          tool,
          prompt,
          result: sanitizedResult,
          metadata: metadata || {},
        });
        return historyRecord;
      } catch (err) {
        // Fallback to in-memory store
      }
    }

    // In-memory record
    const memRecord = {
      _id: 'hist_' + Date.now() + Math.random().toString(36).substring(2, 6),
      id: 'hist_' + Date.now() + Math.random().toString(36).substring(2, 6),
      userId,
      tool,
      prompt,
      result: sanitizedResult,
      metadata: metadata || {},
      createdAt: new Date(),
    };

    global.__createforgeHistory = global.__createforgeHistory || [];
    global.__createforgeHistory.unshift(memRecord);
    return memRecord;
  } catch (err) {
    console.warn('⚠️ [GenerationHistory] History record log error:', err.message);
    return null;
  }
};

/**
 * @route   POST /api/ai/article
 */
const generateArticle = async (req, res, next) => {
  try {
    const { isValid, errors } = validateArticleInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errors.join('. '),
        },
      });
    }

    const {
      topic,
      articleType = 'Comprehensive Guide',
      tone = 'Professional',
      targetAudience = 'General',
      desiredLength = 'Medium',
      keywords = '',
    } = req.body;

    const result = await articleService.generateArticle({
      topic,
      articleType,
      tone,
      targetAudience,
      desiredLength,
      keywords,
    });

    const historyDoc = await recordHistory({
      userId: req.user?._id || req.user?.id || 'demo_user',
      tool: 'article',
      prompt: {
        topic: result.normalizedTopic || topic,
        rawInput: topic,
        articleType: result.metadata.articleType,
        tone,
        targetAudience,
        desiredLength,
        keywords,
      },
      result: { title: result.title, content: result.content, summary: result.summary },
      metadata: result.metadata,
    });

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        historyId: historyDoc ? historyDoc._id || historyDoc.id : null,
      },
    });
  } catch (error) {
    const normalized = normalizeAIError(error);
    return res.status(normalized.status || 500).json({
      success: false,
      error: normalized,
      message: normalized.message,
    });
  }
};

/**
 * @route   POST /api/ai/article-cover-image
 */
const generateArticleCoverImage = async (req, res, next) => {
  try {
    const { title, topic, summary, style = 'Cinematic' } = req.body;
    if (!title && !topic) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TOPIC',
          message: 'Article title or topic is required to generate a cover image.',
        },
      });
    }

    const result = await imageService.generateArticleCoverImage({
      title,
      topic,
      summary,
      style,
    });

    const historyDoc = await recordHistory({
      userId: req.user?._id || req.user?.id || 'demo_user',
      tool: 'image',
      prompt: {
        prompt: `Cover image for "${title || topic}"`,
        style,
        aspectRatio: '16:9',
        articleContext: true,
      },
      result: {
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        style: result.style,
        aspectRatio: result.aspectRatio,
        provider: 'pollinations',
        model: 'flux',
      },
      metadata: result.metadata,
    });

    return res.status(200).json({
      success: true,
      imageUrl: result.imageUrl,
      provider: 'pollinations',
      model: 'flux',
      data: {
        ...result,
        historyId: historyDoc ? historyDoc._id || historyDoc.id : null,
      },
    });
  } catch (error) {
    const normalized = normalizeAIError(error);
    return res.status(normalized.status || 500).json({
      success: false,
      error: normalized,
      message: normalized.message,
    });
  }
};

/**
 * @route   POST /api/ai/titles
 */
const generateTitles = async (req, res, next) => {
  try {
    const { isValid, errors } = validateTitleInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errors.join('. '),
        },
      });
    }

    const {
      topic,
      niche = 'Technology',
      targetAudience = 'General',
      tone = 'Engaging',
      count = 10,
    } = req.body;

    const result = await titleService.generateTitles({
      topic,
      niche,
      targetAudience,
      tone,
      count,
    });

    const historyDoc = await recordHistory({
      userId: req.user?._id || req.user?.id || 'demo_user',
      tool: 'title',
      prompt: {
        topic: result.normalizedTopic || topic,
        rawInput: topic,
        niche,
        targetAudience,
        tone,
        count,
      },
      result: { titles: result.titles },
      metadata: result.metadata,
    });

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        historyId: historyDoc ? historyDoc._id || historyDoc.id : null,
      },
    });
  } catch (error) {
    const normalized = normalizeAIError(error);
    return res.status(normalized.status || 500).json({
      success: false,
      error: normalized,
      message: normalized.message,
    });
  }
};

/**
 * @route   POST /api/ai/image
 * @route   POST /api/images/generate
 */
const generateImage = async (req, res, next) => {
  try {
    const { isValid, errors } = validateImageInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errors.join('. '),
        },
      });
    }

    const {
      prompt,
      style = 'Realistic',
      aspectRatio = '1:1',
      additionalInstructions = '',
      advancedOptions = {},
      seed,
      quality,
      negativePrompt,
      lighting,
      composition,
    } = req.body;

    const mergedAdvanced = {
      additionalInstructions,
      seed: seed !== undefined ? seed : advancedOptions.seed,
      quality: quality || advancedOptions.quality,
      negativePrompt: negativePrompt || advancedOptions.negativePrompt,
      lighting: lighting || advancedOptions.lighting,
      composition: composition || advancedOptions.composition,
      ...advancedOptions,
    };

    const result = await imageGenerationService.generateImage({
      prompt,
      style,
      aspectRatio,
      advancedOptions: mergedAdvanced,
    });

    // Validate that we received an actual image URL/base64
    if (!result || !result.imageUrl) {
      return res.status(502).json({
        success: false,
        error: {
          code: 'INVALID_IMAGE_PAYLOAD',
          message: 'The image service could not return a valid visual. Please try again.',
        },
      });
    }

    const historyDoc = await recordHistory({
      userId: req.user?._id || req.user?.id || 'demo_user',
      tool: 'image',
      prompt: {
        prompt,
        originalPrompt: prompt,
        finalPrompt: result.revisedPrompt,
        style,
        aspectRatio: result.aspectRatio,
        width: result.dimensions.width,
        height: result.dimensions.height,
        advancedOptions: mergedAdvanced,
      },
      result: {
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        style: result.style,
        aspectRatio: result.aspectRatio,
        provider: result.provider,
        model: result.model,
      },
      metadata: result.metadata,
    });

    return res.status(200).json({
      success: true,
      imageUrl: result.imageUrl,
      mimeType: result.mimeType || 'image/png',
      provider: result.provider || 'pollinations',
      model: result.model || 'flux',
      revisedPrompt: result.revisedPrompt,
      prompt: result.prompt,
      style: result.style,
      aspectRatio: result.aspectRatio,
      dimensions: result.dimensions,
      data: {
        ...result,
        historyId: historyDoc ? historyDoc._id || historyDoc.id : null,
      },
    });
  } catch (error) {
    const normalized = normalizeAIError(error);
    return res.status(normalized.status || 500).json({
      success: false,
      error: normalized,
      message: normalized.message,
    });
  }
};

/**
 * @route   POST /api/ai/background-remove
 */
const removeBackground = async (req, res, next) => {
  try {
    let imageBase64 = null;
    let mimeType = 'image/png';

    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype;
    } else if (req.body.image) {
      imageBase64 = req.body.image;
      if (req.body.mimeType) mimeType = req.body.mimeType;
    }

    const mode = req.body.mode || 'transparent';

    const result = await backgroundService.removeBackground({
      imageBase64,
      mimeType,
      mode,
    });

    const historyDoc = await recordHistory({
      userId: req.user?._id || req.user?.id || 'demo_user',
      tool: 'background-removal',
      prompt: {
        filename: req.file ? req.file.originalname : 'uploaded_image.png',
        mode,
        mimeType,
      },
      result: {
        processedImageUrl: result.processedImageUrl,
        isTransparent: result.isTransparent,
        format: result.format,
      },
      metadata: result.metadata,
    });

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        historyId: historyDoc ? historyDoc._id || historyDoc.id : null,
      },
    });
  } catch (error) {
    const normalized = normalizeAIError(error);
    return res.status(normalized.status || 500).json({
      success: false,
      error: normalized,
      message: normalized.message,
    });
  }
};

module.exports = {
  generateArticle,
  generateArticleCoverImage,
  generateTitles,
  generateImage,
  removeBackground,
};
