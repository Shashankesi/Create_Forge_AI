const mongoose = require('mongoose');

const briefSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    projectName: {
      type: String,
      trim: true,
      required: true,
    },
    campaignObjective: {
      type: String,
      trim: true,
      required: true,
    },
    targetAudience: {
      type: String,
      trim: true,
      default: 'General Audience',
    },
    industry: {
      type: String,
      trim: true,
      default: 'Technology & Digital',
    },
    mainTopic: {
      type: String,
      trim: true,
      required: true,
    },
    brandPersonality: {
      type: String,
      trim: true,
      default: 'Visionary & Authoritative',
    },
    contentGoal: {
      type: String,
      trim: true,
      default: 'Educate & Convert',
    },
    primaryPlatform: {
      type: String,
      trim: true,
      default: 'Multi-Channel (Blog + Social)',
    },
    callToAction: {
      type: String,
      trim: true,
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    visualDirection: {
      type: String,
      trim: true,
    },
    competitors: [
      {
        type: String,
        trim: true,
      },
    ],
    requiredDeliverables: [
      {
        type: String,
        trim: true,
      },
    ],
    aiRecommendations: {
      suggestedDeliverables: [String],
      keyThemes: [String],
      toneAdvice: String,
      estimatedTimeline: String,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

briefSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Brief', briefSchema);
