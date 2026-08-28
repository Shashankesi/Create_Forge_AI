const mongoose = require('mongoose');

const contentVersionSchema = new mongoose.Schema(
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
    assetId: {
      type: String,
      required: true,
      index: true,
    },
    assetType: {
      type: String,
      enum: ['article', 'title', 'social', 'brief', 'seo'],
      default: 'article',
    },
    versionNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    name: {
      type: String,
      default: function () {
        return `Version ${this.versionNumber}`;
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    changesSummary: {
      type: String,
      default: 'Auto-saved generation snapshot',
    },
    qualityScore: {
      type: Number,
      default: 85,
    },
    metrics: {
      clarity: Number,
      structure: Number,
      depth: Number,
      readability: Number,
      seoScore: Number,
      specificity: Number,
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

contentVersionSchema.index({ userId: 1, assetId: 1, versionNumber: -1 });

module.exports = mongoose.model('ContentVersion', contentVersionSchema);
