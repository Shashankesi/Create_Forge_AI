const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    templateType: {
      type: String,
      enum: ['blog_campaign', 'product_launch', 'social_blast', 'seo_revamp', 'custom'],
      default: 'custom',
    },
    steps: [
      {
        stepIndex: Number,
        stepName: String,
        tool: {
          type: String,
          enum: ['brief', 'research', 'article', 'critic', 'refine', 'seo', 'image', 'social', 'quality'],
          required: true,
        },
        description: String,
        parameters: { type: Object, default: {} },
        status: {
          type: String,
          enum: ['idle', 'pending_approval', 'running', 'completed', 'failed', 'skipped'],
          default: 'idle',
        },
        requiresConfirmation: { type: Boolean, default: false },
        outputSummary: String,
        outputRef: mongoose.Schema.Types.Mixed,
        executedAt: Date,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'running', 'paused', 'completed', 'failed'],
      default: 'draft',
    },
    lastExecutedAt: Date,
  },
  { timestamps: true }
);

workflowSchema.index({ userId: 1, projectId: 1 });

module.exports = mongoose.model('Workflow', workflowSchema);
