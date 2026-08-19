const mongoose = require('mongoose');

const generationHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    tool: {
      type: String,
      enum: ['article', 'title', 'image', 'background-removal'],
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
    metadata: {
      provider: { type: String, default: 'gemini' },
      model: { type: String },
      durationMs: { type: Number },
      options: { type: mongoose.Schema.Types.Mixed },
    },
  },
  {
    timestamps: true,
    bufferCommands: false,
    autoIndex: false,
  }
);

generationHistorySchema.index({ userId: 1, tool: 1, createdAt: -1 });
generationHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('GenerationHistory', generationHistorySchema);
