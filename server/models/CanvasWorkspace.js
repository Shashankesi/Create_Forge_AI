const mongoose = require('mongoose');

const canvasWorkspaceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Main Creative Canvas',
      trim: true,
    },
    nodes: [
      {
        id: { type: String, required: true },
        type: {
          type: String,
          enum: ['article', 'image', 'title', 'note', 'prompt', 'color-palette'],
          required: true,
        },
        position: {
          x: { type: Number, default: 0 },
          y: { type: Number, default: 0 },
        },
        data: { type: mongoose.Schema.Types.Mixed },
      },
    ],
    viewport: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      zoom: { type: Number, default: 1 },
    },
  },
  {
    timestamps: true,
  }
);

canvasWorkspaceSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('CanvasWorkspace', canvasWorkspaceSchema);
