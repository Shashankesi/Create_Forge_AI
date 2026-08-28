const mongoose = require('mongoose');

const generationHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      index: true,
    },
    tool: {
      type: String,
      enum: [
        'article',
        'title',
        'image',
        'background-removal',
        'brief',
        'research',
        'social',
        'seo',
        'campaign',
        'creative-direction',
        'quality',
      ],
      required: true,
      index: true,
    },
    prompt: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      provider: { type: String, default: 'gemini' },
      model: { type: String },
      durationMs: { type: Number },
      options: { type: mongoose.Schema.Types.Mixed },
    },
  },
  {
    timestamps: true,
  }
);

generationHistorySchema.index({ userId: 1, tool: 1, createdAt: -1 });
generationHistorySchema.index({ userId: 1, projectId: 1, createdAt: -1 });
generationHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('GenerationHistory', generationHistorySchema);
