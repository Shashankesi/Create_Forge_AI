const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },
    assetType: {
      type: String,
      enum: ['article', 'image', 'brief', 'research', 'social', 'campaign', 'project'],
      required: true,
      index: true,
    },
    assetId: {
      type: String,
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      default: 'Creator',
    },
    content: {
      type: String,
      required: [true, 'Comment content cannot be empty'],
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['open', 'resolved'],
      default: 'open',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: Date,
    replies: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        authorName: String,
        content: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

commentSchema.index({ assetType: 1, assetId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
