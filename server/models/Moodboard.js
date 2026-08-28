const mongoose = require('mongoose');

const moodboardSchema = new mongoose.Schema(
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
      required: [true, 'Moodboard title is required'],
      trim: true,
      default: 'Campaign Visual Moodboard',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    theme: {
      mood: { type: String, default: 'Modern & High-Tech' },
      colorPalette: [{ hex: String, name: String, role: String }],
      typography: { heading: String, body: String, vibes: String },
      photographyStyle: { type: String, default: 'Cinematic studio lighting with rich contrast' },
      lighting: { type: String, default: 'Soft rim light with ambient fill' },
      composition: { type: String, default: 'Rule of thirds, spacious negative space' },
      graphicStyle: { type: String, default: 'Glassmorphism with clean geometric accents' },
      illustrationStyle: { type: String, default: '3D isometric with iridescent materials' },
      threedDirection: { type: String, default: 'Floating frosted glass and glowing neon filaments' },
    },
    cards: [
      {
        id: { type: String, required: true },
        type: {
          type: String,
          enum: ['image', 'color', 'note', 'keyword', 'palette', 'direction'],
          required: true,
        },
        content: { type: String, required: true }, // Image URL, Hex code, Note text, or Keyword
        title: { type: String, default: '' },
        tags: [String],
        metadata: { type: Object, default: {} },
        position: {
          x: { type: Number, default: 0 },
          y: { type: Number, default: 0 },
          w: { type: Number, default: 280 },
          h: { type: Number, default: 200 },
        },
        isPreferred: { type: Boolean, default: false },
        isAvoided: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

moodboardSchema.index({ userId: 1, projectId: 1 });

module.exports = mongoose.model('Moodboard', moodboardSchema);
