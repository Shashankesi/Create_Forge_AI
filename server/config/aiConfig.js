/**
 * CreateForge AI — Centralized AI Provider Configuration
 * 
 * Defines validated models, candidate fallback chains, and operational parameters
 * for Gemini, Groq, and FLUX (Pollinations).
 */

const AI_CONFIG = {
  gemini: {
    primaryModel: 'gemini-2.5-flash',
    fallbackModels: [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ],
    defaultTimeoutMs: 15000,
    temperature: {
      creative: 0.7,
      structured: 0.2,
      research: 0.4,
    },
  },
  groq: {
    primaryModel: 'llama-3.3-70b-versatile',
    fallbackModels: [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'qwen/qwen3.8-27b',
      'groq/compound',
    ],
    xaiModels: [
      'grok-2-latest',
      'grok-beta',
      'grok-2-1212',
    ],
    defaultTimeoutMs: 15000,
  },
  image: {
    provider: 'pollinations',
    model: 'flux',
    fallbackModel: 'turbo',
    defaultAspectRatio: '16:9',
    qualityAuditScoreDefault: 88,
  },
};

module.exports = AI_CONFIG;
