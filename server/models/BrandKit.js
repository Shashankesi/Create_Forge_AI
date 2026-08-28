const mongoose = require('mongoose');

const brandKitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      unique: true,
      index: true,
    },
    brandName: {
      type: String,
      required: [true, 'Please provide a brand name'],
      trim: true,
      maxlength: [100, 'Brand name cannot exceed 100 characters'],
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
      maxlength: [150, 'Tagline cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    targetAudience: {
      type: String,
      default: 'Creators, Founders and Modern Teams',
      trim: true,
    },
    toneOfVoice: {
      type: String,
      enum: ['Professional', 'Conversational', 'Visionary', 'Bold & Disruptive', 'Empathetic', 'Technical'],
      default: 'Visionary',
    },
    preferredKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
    wordsToAvoid: [
      {
        type: String,
        trim: true,
      },
    ],
    colors: {
      primary: { type: String, default: '#6366F1' },
      secondary: { type: String, default: '#A855F7' },
      accent: { type: String, default: '#EC4899' },
      background: { type: String, default: '#0B0F19' },
    },
    logoUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BrandKit', brandKitSchema);
