const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [250, 'Bio cannot exceed 250 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    emailVerified: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    preferences: {
      language: {
        type: String,
        default: 'en',
      },
      theme: {
        type: String,
        default: 'dark',
      },
    },
    aiPreferences: {
      defaultTone: { type: String, default: 'Professional & Engaging' },
      defaultImageStyle: { type: String, default: 'Cinematic High-Tech' },
      preferredAspectRatio: { type: String, default: '16:9' },
      defaultLanguage: { type: String, default: 'en' },
      creativityLevel: { type: Number, default: 0.7 },
      defaultBrandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandKit', default: null },
      preferredPlatforms: [{ type: String, default: ['LinkedIn', 'Twitter/X'] }],
    },
    personalization: {
      frequentlyUsedTools: [{ type: String }],
      recentWorkflows: [{ type: String }],
      preferredContentLength: { type: String, default: 'Medium (1,000 - 1,500 words)' },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified and not already hashed
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  // Prevent double-hashing
  if (this.password && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$'))) {
    return next();
  }
  try {
    this.password = bcrypt.hashSync(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.password || !candidatePassword) return false;
  return bcrypt.compareSync(candidatePassword, this.password);
};

// Safe JSON transform to never expose password or sensitive internal properties
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id ? this._id.toString() : this.id,
    _id: this._id ? this._id.toString() : this.id,
    name: this.name,
    email: this.email,
    avatar: this.avatar || '',
    bio: this.bio || '',
    role: this.role || 'user',
    emailVerified: this.emailVerified,
    preferences: this.preferences || { language: 'en', theme: 'dark' },
    aiPreferences: this.aiPreferences || {
      defaultTone: 'Professional & Engaging',
      defaultImageStyle: 'Cinematic High-Tech',
      preferredAspectRatio: '16:9',
      defaultLanguage: 'en',
      creativityLevel: 0.7,
      preferredPlatforms: ['LinkedIn', 'Twitter/X'],
    },
    personalization: this.personalization || {
      frequentlyUsedTools: [],
      recentWorkflows: [],
      preferredContentLength: 'Medium (1,000 - 1,500 words)',
    },
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('User', userSchema);
