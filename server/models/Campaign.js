const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      maxlength: 120,
    },
    idea: {
      type: String,
      required: [true, 'Original idea/prompt is required'],
      trim: true,
    },
    objective: {
      type: String,
      default: '',
      trim: true,
    },
    targetAudience: {
      type: String,
      default: '',
      trim: true,
    },
    strategy: {
      overview: { type: String, default: '' },
      keyMessage: { type: String, default: '' },
      positioning: { type: String, default: '' },
      funnelStages: [{ stage: String, goal: String, tactics: [String] }],
    },
    brief: {
      type: Object,
      default: {},
    },
    researchPlan: {
      searchQueries: [{ query: String, intent: String }],
      keyQuestions: [String],
      marketInsights: [String],
      competitorAngles: [String],
    },
    contentStrategy: {
      themes: [String],
      contentPillars: [String],
      articleIdeas: [
        {
          title: String,
          angle: String,
          targetKeyword: String,
          wordCountTarget: Number,
          status: { type: String, enum: ['pending', 'generated', 'published'], default: 'pending' },
          articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'GenerationHistory', default: null },
        },
      ],
      headlines: [
        {
          text: String,
          category: String,
          score: Number,
          isFavorite: { type: Boolean, default: false },
        },
      ],
    },
    seoStrategy: {
      primaryKeyword: String,
      secondaryKeywords: [String],
      searchIntent: String,
      metaTitle: String,
      metaDescription: String,
      slug: String,
    },
    visualStrategy: {
      mood: String,
      style: String,
      colorPalette: [String],
      imagePrompts: [
        {
          label: String,
          prompt: String,
          aspectRatio: { type: String, default: '16:9' },
          status: { type: String, enum: ['pending', 'generated'], default: 'pending' },
          imageId: { type: mongoose.Schema.Types.ObjectId, ref: 'ImageGeneration', default: null },
        },
      ],
    },
    socialStrategy: {
      platforms: [String],
      posts: [
        {
          platform: String,
          caption: String,
          hashtags: [String],
          cta: String,
          imageSuggestion: String,
        },
      ],
    },
    emailCampaign: {
      subjectLines: [String],
      previewText: String,
      bodyOutline: String,
      callToAction: String,
    },
    ctaStrategy: {
      primaryCta: String,
      secondaryCta: String,
      urgencyVariants: [String],
    },
    deliverables: [
      {
        id: String,
        title: String,
        type: { type: String, enum: ['article', 'visual', 'social', 'seo', 'brief', 'email', 'review'] },
        status: { type: String, enum: ['pending', 'completed', 'in_progress'], default: 'pending' },
        actionEndpoint: String,
        outputRef: mongoose.Schema.Types.Mixed,
      },
    ],
    healthScore: {
      overall: { type: Number, default: 0 },
      breakdown: {
        strategy: { type: Number, default: 0 },
        content: { type: Number, default: 0 },
        visuals: { type: Number, default: 0 },
        seo: { type: Number, default: 0 },
        brand: { type: Number, default: 0 },
        social: { type: Number, default: 0 },
        completeness: { type: Number, default: 0 },
      },
    },
    status: {
      type: String,
      enum: ['draft', 'in_progress', 'ready', 'launched', 'archived'],
      default: 'in_progress',
    },
  },
  { timestamps: true }
);

campaignSchema.index({ userId: 1, createdAt: -1 });
campaignSchema.index({ userId: 1, projectId: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);
