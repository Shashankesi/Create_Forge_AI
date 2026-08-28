const mongoose = require('mongoose');

const creativeMemorySchema = new mongoose.Schema(
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
      required: [true, 'Project ID is required'],
      index: true,
    },
    objective: {
      type: String,
      default: '',
      trim: true,
    },
    audience: {
      type: String,
      default: '',
      trim: true,
    },
    brandVoice: {
      type: String,
      default: '',
      trim: true,
    },
    importantTerminology: [
      {
        term: { type: String, trim: true },
        definition: { type: String, trim: true },
        usageRule: { type: String, trim: true },
      },
    ],
    preferredVisualDirections: [
      {
        style: String,
        keywords: [String],
        reason: String,
        addedAt: { type: Date, default: Date.now },
      },
    ],
    avoidedVisualDirections: [
      {
        style: String,
        keywords: [String],
        reason: String,
        rejectedAt: { type: Date, default: Date.now },
      },
    ],
    approvedConcepts: [
      {
        conceptId: String,
        title: String,
        type: { type: String, enum: ['article', 'headline', 'image', 'cta', 'social', 'strategy'] },
        summary: String,
        approvedAt: { type: Date, default: Date.now },
      },
    ],
    rejectedConcepts: [
      {
        conceptId: String,
        title: String,
        type: { type: String, enum: ['article', 'headline', 'image', 'cta', 'social', 'strategy'] },
        feedback: String,
        rejectedAt: { type: Date, default: Date.now },
      },
    ],
    decisionsHistory: [
      {
        decision: String,
        rationale: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    campaignStage: {
      type: String,
      enum: ['ideation', 'planning', 'production', 'review', 'ready', 'launched'],
      default: 'ideation',
    },
  },
  { timestamps: true }
);

creativeMemorySchema.index({ userId: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.model('CreativeMemory', creativeMemorySchema);
