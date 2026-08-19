const mongoose = require('mongoose');

const imageGenerationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    enhancedPrompt: {
      type: String,
      trim: true,
    },
    style: {
      type: String,
      default: 'Realistic',
    },
    aspectRatio: {
      type: String,
      default: '1:1',
    },
    dimensions: {
      width: { type: Number, default: 1024 },
      height: { type: Number, default: 1024 },
      size: { type: String, default: '1024x1024' },
    },
    imageUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      default: 'pollinations',
    },
    model: {
      type: String,
      default: 'flux',
    },
    seed: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['completed', 'failed'],
      default: 'completed',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

imageGenerationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ImageGeneration', imageGenerationSchema);
