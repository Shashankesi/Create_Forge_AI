const mongoose = require('mongoose');

const researchItemSchema = new mongoose.Schema(
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
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    targetAudience: {
      type: String,
      default: 'General Audience',
    },
    searchIntent: {
      type: String,
      default: 'Informational & Educational',
    },
    keyPoints: [
      {
        type: String,
        trim: true,
      },
    ],
    questionsPeopleAsk: [
      {
        type: String,
        trim: true,
      },
    ],
    audiencePainPoints: [
      {
        type: String,
        trim: true,
      },
    ],
    contentGaps: [
      {
        type: String,
        trim: true,
      },
    ],
    suggestedSources: [
      {
        title: String,
        description: String,
      },
    ],
    faqIdeas: [
      {
        question: String,
        answer: String,
      },
    ],
    competitorAngle: {
      type: String,
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

researchItemSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ResearchItem', researchItemSchema);
