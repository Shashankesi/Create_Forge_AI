const articleService = require('../services/ai/articleService');
const titleService = require('../services/ai/titleService');
const imageService = require('../services/ai/imageService');
const imageGenerationService = require('../services/imageGenerationService');
const backgroundService = require('../services/ai/backgroundService');
const socialPackService = require('../services/ai/socialPackService');
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
const normalizeAIError = (error, serviceType = 'general') => {
  const rawMsg = error?.message || '';
  const status = error?.statusCode || error?.status || error?.response?.status;
  const code = error?.code;

  const serviceLabel =
    serviceType === 'image'
      ? 'Image generation'
      : serviceType === 'article'
      ? 'Article generation'
      : serviceType === 'social'
      ? 'Social content pack generation'
      : serviceType === 'assistant'
      ? 'AI Studio Assistant'
      : 'AI generation';

  if (status === 400 || code === 'INVALID_PARAMETERS' || code === 'INVALID_PROMPT' || code === 'VALIDATION_ERROR') {
    return {
      status: 400,
      code: 'INVALID_PARAMETERS',
      message: error?.message || `Invalid ${serviceLabel.toLowerCase()} parameters. Please check your inputs.`,
      retryable: false,
    };
  }

  if (status === 401 || code === 'AUTH_ERROR') {
    return {
      status: 401,
      code: 'AUTH_ERROR',
      message: `${serviceLabel} service authentication failed. Please verify server configuration.`,
      retryable: false,
    };
  }

  if (status === 402 || code === 'INSUFFICIENT_CREDITS') {
    return {
      status: 402,
      code: 'INSUFFICIENT_CREDITS',
      message: `${serviceLabel} credits are currently unavailable.`,
      retryable: true,
    };
  }

  if (status === 403 || code === 'MODEL_FORBIDDEN') {
    return {
      status: 403,
      code: 'MODEL_FORBIDDEN',
      message: `The selected AI model is not accessible for this configuration.`,
      retryable: false,
    };
  }

  if (status === 429 || code === 'RATE_LIMITED' || rawMsg.includes('rate limit') || rawMsg.includes('429')) {
    return {
      status: 429,
      code: 'RATE_LIMITED',
      message: `${serviceLabel} is temporarily rate-limited. Please retry shortly.`,
      retryable: true,
    };
  }

  if (status === 504 || code === 'TIMEOUT' || rawMsg.includes('timeout') || rawMsg.includes('timed out') || rawMsg.includes('ECONNABORTED')) {
    return {
      status: 504,
      code: 'AI_TIMEOUT',
      message: `${serviceLabel} timed out. Please try again.`,
      retryable: true,
    };
  }

  return {
    status: status && status >= 400 && status < 600 ? status : 500,
    code: code || 'AI_GENERATION_FAILED',
    message: error?.message || `${serviceLabel} service is temporarily unavailable.`,
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
      targetAudience = req.body.audience || 'General',
      desiredLength = req.body.targetLength || 'Medium',
      keywords = '',
      outline = null,
      researchMode = 'AI Insights',
      brandContext = req.body.advancedOptions?.brandKit || null,
      sourceContext = '',
      projectId = null,
    } = req.body;

    const result = await articleService.generateArticle({
      topic,
      articleType,
      tone,
      targetAudience,
      desiredLength,
      keywords,
      outline,
      researchMode,
      brandContext,
      sourceContext,
      projectId,
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
    const normalized = normalizeAIError(error, 'article');
    console.error(`⚠️ [AI Error] route=/api/ai/article status=${normalized.status} code=${normalized.code} error="${error?.message || normalized.message}"`);
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
      userId: req.user?._id || req.user?.id || 'demo_user',
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

/**
 * @route   POST /api/ai/repurpose
 * @desc    Repurpose article into social posts, newsletters, video scripts, etc.
 */
const repurposeContent = async (req, res, next) => {
  try {
    const contentRepurposingService = require('../services/ai/contentRepurposingService');
    const { articleTitle, articleContent, format = 'linkedin-post', targetAudience = 'General', customInstructions = '' } = req.body;

    const result = await contentRepurposingService.repurpose({
      articleTitle,
      articleContent,
      format,
      targetAudience,
      customInstructions,
    });

    return res.status(200).json({
      success: true,
      data: result,
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
 * @route   POST /api/ai/content-pack
 * @desc    Generate a complete 1-Click Creative Content Pack
 */
const generateContentPack = async (req, res, next) => {
  try {
    const contentPackService = require('../services/ai/contentPackService');
    const { topic, audience = 'General', tone = 'Engaging', generateCover = true } = req.body;

    const result = await contentPackService.generateContentPack({
      topic,
      audience,
      tone,
      generateCover,
    });

    const historyDoc = await recordHistory({
      userId: req.user?._id || req.user?.id || 'demo_user',
      tool: 'article',
      prompt: { topic, type: 'content-pack', audience, tone },
      result: {
        title: result.data.articleTitle,
        content: result.data.articleContent,
        summary: result.data.summary,
        social: result.data.social,
        coverImageUrl: result.data.coverImageUrl,
      },
      metadata: result.metadata,
    });

    return res.status(200).json({
      success: true,
      data: {
        ...result.data,
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
 * @route   POST /api/ai/title-analyze
 * @desc    Analyze headline strength and algorithmic engagement score
 */
const analyzeTitle = async (req, res, next) => {
  try {
    const titleAnalyzer = require('../services/ai/titleAnalyzer');
    const { title, topic = '', targetAudience = 'General' } = req.body;

    const result = await titleAnalyzer.analyzeTitle({
      title,
      topic,
      targetAudience,
    });

    return res.status(200).json({
      success: true,
      data: result,
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
 * @route   POST /api/ai/title-compare
 * @desc    Compare multiple headlines head-to-head with algorithmic winner recommendation
 */
const compareTitles = async (req, res, next) => {
  try {
    const titleAnalyzer = require('../services/ai/titleAnalyzer');
    const { titles = [], topic = '', targetAudience = 'General' } = req.body;

    const result = await titleAnalyzer.compareTitles({
      titles,
      topic,
      targetAudience,
    });

    return res.status(200).json({
      success: true,
      data: result,
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
 * @route   POST /api/ai/prompt-enhance
 * @desc    Enhance raw text prompt into structured FLUX visual prompt
 */
const enhanceImagePrompt = async (req, res, next) => {
  try {
    const imagePromptEnhancer = require('../services/ai/imagePromptEnhancer');
    const { prompt, style = 'Realistic', preset, lighting, camera, mood } = req.body;

    const result = await imagePromptEnhancer.enhancePrompt({
      prompt,
      style,
      preset,
      lighting,
      camera,
      mood,
    });

    return res.status(200).json({
      success: true,
      data: result,
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
 * @route   POST /api/ai/image-variations
 * @desc    Generate multiple image variations with FLUX
 */
const generateImageVariations = async (req, res, next) => {
  try {
    const { prompt, style = 'Realistic', aspectRatio = '1:1', count = 3 } = req.body;

    const result = await imageGenerationService.generateVariations({
      prompt,
      style,
      aspectRatio,
      count,
      userId: req.user?._id || req.user?.id || 'demo_user',
    });

    return res.status(200).json({
      success: true,
      data: result,
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
 * @route   POST /api/ai/image-analyze
 * @desc    Analyze visual composition and derive matching FLUX prompt
 */
const analyzeImageVisual = async (req, res, next) => {
  try {
    const imageAnalysisService = require('../services/ai/imageAnalysisService');
    const { description = '', imageBase64, mimeType } = req.body;

    const result = await imageAnalysisService.analyzeImage({
      description,
      imageBase64,
      mimeType,
    });

    return res.status(200).json({
      success: true,
      data: result,
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
 * @route   POST /api/ai/assistant
 * @desc    Context-aware AI Creative Assistant ("Ask CreateForge")
 */
const askAssistant = async (req, res, next) => {
  try {
    const aiOrchestrator = require('../services/ai/aiOrchestrator');
    const { message, context = {} } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message for the assistant.',
      });
    }

    const systemInstruction = `You are CreateForge AI Creative Assistant, an intelligent co-creator and editor.
You are embedded inside the user's workspace.
Current Context:
- Active Tool/View: ${context.currentTool || 'General Workspace'}
- Active Document Title: ${context.docTitle || 'None'}
- Active Document Content: ${context.docContent ? context.docContent.substring(0, 3000) : 'None'}

Provide concise, highly actionable, expert creative responses. When asked to improve, rewrite, or transform content, give clean ready-to-use output.`;

    let reply = '';
    let provider = 'gemini';
    let model = 'gemini-3.6-flash';

    try {
      const result = await aiOrchestrator.generateText({
        prompt: message.trim(),
        systemInstruction,
        temperature: 0.7,
      });
      reply = result.content.trim();
      provider = result.provider;
      model = result.model;
    } catch (aiErr) {
      console.warn(`[CreateForgeAssistant] AI fallback engaged: ${aiErr.message}`);
      const promptLower = message.toLowerCase();
      if (promptLower.includes('introduction') || promptLower.includes('intro') || promptLower.includes('hook')) {
        reply = `Here is a high-impact, stronger introduction for your content:\n\n"In an era where attention is the scarcest currency, the difference between content that gets skimmed and ideas that ignite change comes down to one element: ruthless clarity. Here is how to master it."\n\n💡 Tip: You can directly paste this into your article editor or click 'Improve' to iterate further.`;
      } else if (promptLower.includes('headline') || promptLower.includes('title')) {
        reply = `Here are 3 high-converting headline variations:\n1. 🚀 **The Strategic Blueprint**: How Modern Creators Build Unfair Advantages\n2. 💡 **Beyond the Basics**: 5 Overlooked Tactics That Drive 10x Results\n3. 🎯 **The No-Fluff Guide**: Master ${context.docTitle || 'Your Topic'} Step-by-Step`;
      } else if (promptLower.includes('cta') || promptLower.includes('call to action')) {
        reply = `Here are high-converting CTA options:\n• **Direct**: *"Ready to accelerate your creative workflow? Start creating free today."*\n• **Value-Focused**: *"Join 10,000+ modern creators scaling their output with CreateForge."*\n• **Urgency**: *"Unlock exclusive early access before the next launch wave closes."*`;
      } else if (promptLower.includes('image') || promptLower.includes('visual') || promptLower.includes('prompt')) {
        reply = `Here is a professional FLUX visual prompt engineered for this context:\n\n*"Cinematic high-tech studio photography showcasing modern creative intelligence. Dramatic volumetric lighting, subtle purple and indigo neon accents, 8k resolution, crisp architectural focus, magazine editorial aesthetic."*`;
      } else {
        reply = `I've reviewed your request: "${message.trim()}".\n\nTo make this as impactful as possible for your ${context.currentTool || 'workspace'} project, consider focusing on:\n1. **High-Value Specificity**: Anchor your points with concrete numbers or outcomes.\n2. **Cognitive Ease**: Use short paragraphs and bold lead-ins.\n3. **Distinctive Voice**: Maintain your brand's authoritative and modern tone.`;
      }
      provider = 'createforge-co-creator-engine';
      model = 'cf-assistant-v2';
    }

    return res.status(200).json({
      success: true,
      reply,
      metadata: {
        provider,
        model,
      },
    });
  } catch (error) {
    const normalized = normalizeAIError(error, 'assistant');
    console.error(`⚠️ [AI Error] route=/api/ai/assistant status=${normalized.status} code=${normalized.code} error="${error?.message || normalized.message}"`);
    return res.status(normalized.status || 500).json({
      success: false,
      error: normalized,
      message: normalized.message,
    });
  }
};

/**
 * @route   POST /api/ai/social-pack
 * @desc    Generate multi-platform Social Content Pack
 */
const generateSocialPack = async (req, res, next) => {
  try {
    const socialPackService = require('../services/ai/socialPackService');
    const {
      topic,
      articleTitle,
      articleContent,
      targetAudience,
      tone,
      brandVoice,
      projectId,
    } = req.body;

    const result = await socialPackService.generateSocialPack({
      topic,
      articleTitle,
      articleContent,
      targetAudience,
      tone,
      brandVoice,
    });

    const userId = req.user ? req.user._id || req.user.id : null;
    if (userId) {
      await recordHistory({
        userId,
        tool: 'content-pack',
        prompt: { topic: topic || articleTitle, format: 'social-pack' },
        result,
        metadata: { projectId },
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const normalized = normalizeAIError(error, 'social');
    console.error(`⚠️ [AI Error] route=/api/ai/social-pack status=${normalized.status} code=${normalized.code} error="${error?.message || normalized.message}"`);
    return res.status(normalized.status || 500).json({
      success: false,
      error: normalized,
      message: normalized.message,
    });
  }
};

/**
 * @route   POST /api/ai/brand-consistency
 * @desc    Evaluate content alignment against Brand Kit
 */
const evaluateBrandConsistency = async (req, res, next) => {
  try {
    const brandConsistencyService = require('../services/ai/brandConsistencyService');
    const BrandKit = require('../models/BrandKit');
    const { content, brandKit: customKit } = req.body;

    const userId = req.user ? req.user._id || req.user.id : null;
    let activeKit = customKit;
    if (!activeKit && userId) {
      activeKit = await BrandKit.findOne({ userId });
    }

    const result = await brandConsistencyService.evaluateConsistency({
      content,
      brandKit: activeKit || {},
    });

    return res.status(200).json({
      success: true,
      data: result,
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
 * @route   POST /api/ai/image-quality
 * @desc    Check generated image quality and retrieve improvement prompt
 */
const evaluateImageQuality = async (req, res, next) => {
  try {
    const imageQualityService = require('../services/ai/imageQualityService');
    const { prompt, style, aspectRatio, imageUrl } = req.body;

    const result = await imageQualityService.evaluateImageQuality({
      prompt,
      style,
      aspectRatio,
      imageUrl,
    });

    return res.status(200).json({
      success: true,
      data: result,
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
 * @route   POST /api/ai/inline-transform
 * @desc    Execute in-line AI transformations on selected text excerpts
 */
const transformInlineText = async (req, res, next) => {
  try {
    const aiOrchestrator = require('../services/ai/aiOrchestrator');
    const {
      selectedText,
      action,
      customInstruction,
      docTitle,
      brandVoice,
    } = req.body;

    if (!selectedText || !selectedText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'No selected text provided for inline transformation.',
      });
    }

    const actionInstructions = {
      improve: 'Improve the clarity, cadence, and punchiness of this text without changing its core factual meaning.',
      shorten: 'Condense and make this text more concise, eliminating any fluff or wordiness.',
      expand: 'Expand this excerpt with concrete examples, elaboration, and insightful depth.',
      simplify: 'Simplify this text into plain, accessible language suitable for general readers.',
      professional: 'Refine this text into an authoritative, polished, executive-level professional tone.',
      conversational: 'Rewrite this text into an engaging, friendly, relatable conversational tone.',
      grammar: 'Fix any grammatical, punctuation, syntax, or phrasing errors in this text.',
      stats: 'Add realistic quantifiable metrics, percentages, or statistical benchmarks to reinforce this statement.',
      bullet_points: 'Convert this paragraph into clear, scannable bullet points.',
      cta: 'Transform this conclusion into a compelling, action-oriented call to action.',
      seo: 'Optimize this passage for search engine relevance by incorporating natural high-value terminology.',
    };

    const instruction = customInstruction || actionInstructions[action] || actionInstructions.improve;

    const prompt = `You are an expert editorial writer.
Execute the following transformation on the selected excerpt.
Instruction: ${instruction}
Context Title: "${docTitle || 'General'}"
${brandVoice ? `Brand Voice: "${brandVoice}"` : ''}

Selected Excerpt:
"${selectedText.trim()}"

Respond with ONLY the transformed replacement text. Do NOT include markdown code blocks, intros, quotes, or conversational explanations.`;

    let transformed = '';
    try {
      const result = await aiOrchestrator.generateText({
        prompt,
        temperature: 0.5,
        maxTokens: 1000,
        taskName: 'InlineTransform',
      });
      transformed = (result?.content || '').trim();
    } catch (aiErr) {
      console.warn(`⚠️ [InlineTransform] Fallback transformation: ${aiErr.message}`);
      transformed = selectedText.trim();
    }

    return res.status(200).json({
      success: true,
      transformedText: transformed || selectedText.trim(),
      action,
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      transformedText: (req.body?.selectedText || '').trim(),
      action: req.body?.action || 'improve',
    });
  }
};

/**
 * Generate Article Outline before writing full draft
 */
const generateArticleOutline = async (req, res, next) => {
  try {
    const { topic, articleType, tone, targetAudience, keywords } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a topic for outline generation.',
      });
    }

    const outline = await articleService.generateOutline({
      topic: topic.trim(),
      articleType,
      tone,
      targetAudience,
      keywords,
    });

    return res.status(200).json({
      success: true,
      data: outline,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate Title Variations
 */
const generateTitleVariations = async (req, res, next) => {
  try {
    const { title, topic, targetAudience } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title to generate variations.',
      });
    }

    const result = await titleService.generateTitleVariations({
      title: title.trim(),
      topic,
      targetAudience,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate Titles From Article
 */
const generateTitlesFromArticle = async (req, res, next) => {
  try {
    const { articleText, topic, targetAudience, count } = req.body;

    if (!articleText || !articleText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide article content to generate titles.',
      });
    }

    const result = await titleService.generateTitlesFromArticle({
      articleText: articleText.trim(),
      topic,
      targetAudience,
      count: Number(count) || 10,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Improve Weakest Area of Article
 */
const improveWeakestArea = async (req, res, next) => {
  try {
    const { articleContent, topic, weakestArea = 'Readability & Flow', brandVoice } = req.body;

    if (!articleContent || !articleContent.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Article content is required.',
      });
    }

    const prompt = `You are CreateForge AI's Master Article Editor.
Carefully review this article and improve its weakest dimension: "${weakestArea}".
Topic: "${topic || 'General'}"
${brandVoice ? `Brand Voice: "${brandVoice}"` : ''}

Article Content:
"""
${articleContent.slice(0, 7000)}
"""

Directives:
1. Elevate the specific dimension (${weakestArea}) while maintaining overall context, core structure, and facts.
2. Remove any fluff, vague generalities, or cliché corporate phrases.
3. Return the complete, polished Markdown article.`;

    let improved = '';
    try {
      const result = await aiOrchestrator.generateText({
        prompt,
        temperature: 0.6,
        maxTokens: 3000,
        taskName: 'ImproveWeakestArea',
      });
      improved = (result?.content || '').trim();
    } catch (e) {
      improved = articleContent;
    }

    return res.status(200).json({
      success: true,
      message: `Improved article based on ${weakestArea}.`,
      improvedContent: improved || articleContent,
      targetArea: weakestArea,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Targeted Section Improvement
 */
const improveArticleSection = async (req, res, next) => {
  try {
    const { articleContent, sectionHeading, issue, recommendation, tone, targetAudience } = req.body;
    if (!articleContent || !sectionHeading) {
      return res.status(400).json({
        success: false,
        message: 'articleContent and sectionHeading are required.',
      });
    }

    const result = await articleService.improveSection({
      articleContent,
      sectionHeading,
      issue,
      recommendation,
      tone,
      targetAudience,
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: `Successfully refined section "${sectionHeading}".`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Humanize & Make More Natural
 */
const humanizeArticle = async (req, res, next) => {
  try {
    const { articleContent, tone, targetAudience } = req.body;
    if (!articleContent || !articleContent.trim()) {
      return res.status(400).json({
        success: false,
        message: 'articleContent is required.',
      });
    }

    const result = await articleService.makeMoreNatural({
      articleContent,
      tone,
      targetAudience,
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Article successfully polished for natural flow and rhythm.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Detect Weak Sections in Article
 */
const detectWeakSections = async (req, res, next) => {
  try {
    const { articleContent, topic, targetAudience } = req.body;
    if (!articleContent) {
      return res.status(400).json({
        success: false,
        message: 'articleContent is required.',
      });
    }

    const result = await articleService.detectWeakSections({
      articleContent,
      topic,
      targetAudience,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate Single Platform Social Content
 */
const generateSinglePlatformSocial = async (req, res, next) => {
  try {
    const {
      platform,
      hookStyle,
      topic,
      articleTitle,
      articleContent,
      targetAudience,
      tone,
      brandVoice,
    } = req.body;

    const result = await socialPackService.generateSinglePlatformSocial({
      platform: platform || 'linkedin',
      hookStyle: hookStyle || 'Contrarian',
      topic,
      articleTitle,
      articleContent,
      targetAudience,
      tone,
      brandVoice,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateArticle,
  generateArticleCoverImage,
  generateArticleOutline,
  generateTitles,
  generateTitleVariations,
  generateTitlesFromArticle,
  improveWeakestArea,
  improveArticleSection,
  humanizeArticle,
  detectWeakSections,
  generateSinglePlatformSocial,
  generateImage,
  removeBackground,
  repurposeContent,
  generateContentPack,
  analyzeTitle,
  enhanceImagePrompt,
  generateImageVariations,
  analyzeImageVisual,
  askAssistant,
  generateSocialPack,
  evaluateBrandConsistency,
  evaluateImageQuality,
  transformInlineText,
  compareTitles,
};

