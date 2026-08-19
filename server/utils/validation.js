/**
 * Input validation helpers for CreateForge AI endpoints
 */
const { VALID_ASPECT_RATIO_VALUES } = require('../config/aspectRatios');

const validateRegisterInput = (data) => {
  const errors = [];
  const { name, email, password } = data || {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (name.trim().length > 50) {
    errors.push('Name cannot exceed 50 characters');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(String(email).trim())) {
    errors.push('Please provide a valid email address');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateLoginInput = (data) => {
  const errors = [];
  const { email, password } = data || {};

  if (!email || !String(email).trim()) {
    errors.push('Email is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateArticleInput = (data) => {
  const errors = [];
  const { topic, tone, articleType, desiredLength } = data || {};

  if (!topic || typeof topic !== 'string' || topic.trim().length < 2) {
    errors.push('Topic is required and must be at least 2 characters long');
  } else if (topic.length > 500) {
    errors.push('Topic cannot exceed 500 characters');
  }

  const validTones = ['Professional', 'Casual', 'Educational', 'Friendly', 'Technical', 'Persuasive', 'Engaging'];
  if (tone && !validTones.includes(tone)) {
    errors.push(`Tone must be one of: ${validTones.join(', ')}`);
  }

  const validTypes = [
    'Comprehensive Guide',
    'Beginner Guide',
    'How-To',
    'Tutorial',
    'Comparison',
    'Listicle',
    'Case Study',
    'Thought Leadership',
  ];
  if (articleType && !validTypes.includes(articleType)) {
    errors.push(`Article type must be one of: ${validTypes.join(', ')}`);
  }

  const validLengths = ['Short', 'Medium', 'Long'];
  if (desiredLength && !validLengths.includes(desiredLength)) {
    errors.push(`Desired length must be one of: ${validLengths.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateTitlesInput = (data) => {
  const errors = [];
  const { topic, count } = data || {};

  if (!topic || typeof topic !== 'string' || topic.trim().length < 2) {
    errors.push('Topic is required and must be at least 2 characters long');
  } else if (topic.length > 300) {
    errors.push('Topic cannot exceed 300 characters');
  }

  if (count !== undefined) {
    const num = Number(count);
    if (isNaN(num) || num < 1 || num > 20) {
      errors.push('Count must be a number between 1 and 20');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateImageInput = (data) => {
  const errors = [];
  const { prompt, aspectRatio } = data || {};

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 2) {
    errors.push('Prompt is required and must be at least 2 characters long');
  } else if (prompt.length > 1000) {
    errors.push('Prompt cannot exceed 1000 characters');
  }

  if (aspectRatio && !VALID_ASPECT_RATIO_VALUES.includes(aspectRatio)) {
    errors.push(
      `Aspect ratio "${aspectRatio}" is unsupported. Must be one of: ${VALID_ASPECT_RATIO_VALUES.join(', ')}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateArticleInput,
  validateTitleInput: validateTitlesInput,
  validateTitlesInput,
  validateImageInput,
};
