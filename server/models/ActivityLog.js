const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
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
    actionType: {
      type: String,
      required: true,
      enum: [
        'project_created',
        'brief_generated',
        'research_completed',
        'article_generated',
        'article_refined',
        'version_saved',
        'image_generated',
        'social_pack_generated',
        'seo_analyzed',
        'brand_updated',
        'campaign_exported',
      ],
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
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

activityLogSchema.index({ userId: 1, projectId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
