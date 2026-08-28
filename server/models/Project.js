const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a project name'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      enum: ['Marketing', 'Esports', 'Technology', 'Personal', 'Client Work', 'General', 'Social Media', 'Product Launch'],
      default: 'General',
    },
    color: {
      type: String,
      default: '#6366F1', // Indigo accent
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    stageProgress: {
      brief: { type: Boolean, default: false },
      research: { type: Boolean, default: false },
      content: { type: Boolean, default: false },
      visuals: { type: Boolean, default: false },
      seo: { type: Boolean, default: false },
      social: { type: Boolean, default: false },
      review: { type: Boolean, default: false },
    },
    activeBriefId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brief',
    },
    creativeContext: {
      topic: { type: String, default: '' },
      audience: { type: String, default: '' },
      objective: { type: String, default: '' },
      tone: { type: String, default: 'Professional' },
      keywords: [{ type: String }],
      brandVoice: { type: String, default: '' },
      visualDirection: { type: String, default: '' },
      contentType: { type: String, default: 'Article' },
      language: { type: String, default: 'en' },
      lastUpdated: { type: Date, default: Date.now },
    },
    sources: [
      {
        name: { type: String, required: true },
        fileType: {
          type: String,
          enum: ['pdf', 'docx', 'txt', 'image', 'audio', 'url', 'other'],
          default: 'txt',
        },
        textContent: { type: String, default: '' },
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    items: [
      {
        assetType: {
          type: String,
          enum: ['article', 'image', 'title', 'titles', 'content-pack', 'social', 'brief', 'research', 'seo', 'note', 'background-removed'],
          required: true,
        },
        title: { type: String, required: true },
        content: { type: mongoose.Schema.Types.Mixed },
        previewUrl: { type: String },
        historyId: { type: mongoose.Schema.Types.Mixed },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        email: String,
        name: String,
        role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'editor' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    approvalStatus: {
      type: String,
      enum: ['Draft', 'In Review', 'Changes Requested', 'Approved', 'Published'],
      default: 'Draft',
    },
    visualContext: {
      mood: { type: String, default: '' },
      colorPalette: [String],
      photographyStyle: { type: String, default: '' },
      illustrationStyle: { type: String, default: '' },
      typography: { heading: String, body: String },
    },
    campaignHealthScore: {
      overall: { type: Number, default: 0 },
      strategy: { type: Number, default: 0 },
      content: { type: Number, default: 0 },
      visuals: { type: Number, default: 0 },
      seo: { type: Number, default: 0 },
      brand: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      completeness: { type: Number, default: 0 },
      lastCalculated: { type: Date, default: Date.now },
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        // Calculate dynamic completion percentage based on actual saved assets
        const items = Array.isArray(ret.items) ? ret.items : [];
        const hasArticle = items.some((i) => i.assetType === 'article');
        const hasImage = items.some((i) => i.assetType === 'image' || i.assetType === 'background-removed');
        const hasTitles = items.some((i) => i.assetType === 'title');
        const hasSocial = items.some((i) => i.assetType === 'social' || i.assetType === 'content-pack');
        const hasSEO = items.some((i) => i.assetType === 'seo' || i.assetType === 'research');
        
        let completedStages = 0;
        const totalStages = 5;
        if (hasArticle) completedStages++;
        if (hasImage) completedStages++;
        if (hasTitles) completedStages++;
        if (hasSocial) completedStages++;
        if (hasSEO) completedStages++;

        ret.completionPercentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
        return ret;
      },
    },
  }
);

projectSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
