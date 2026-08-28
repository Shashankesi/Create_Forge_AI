const mongoose = require('mongoose');

const generationJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'campaign_generate',
        'image_generate',
        'article_generate',
        'social_generate',
        'presentation_generate',
        'video_blueprint_generate',
        'workflow_step',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'queued',
      index: true,
    },
    stageMessage: {
      type: String,
      default: 'Initializing generation pipeline...',
    },
    progressPercent: {
      type: Number,
      default: 0,
    },
    provider: {
      type: String,
      default: 'gemini',
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    recoveryStrategy: {
      type: String,
      default: '',
    },
    errorDetails: {
      type: String,
      default: null,
    },
    resultRef: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    inputParams: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

generationJobSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('GenerationJob', generationJobSchema);
