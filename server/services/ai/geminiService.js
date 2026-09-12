require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const AI_CONFIG = require('../../config/aiConfig');

class GeminiService {
  constructor() {
    this.init();
  }

  init() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey) {
      try {
        this.client = new GoogleGenerativeAI(this.apiKey);
        console.log('✅ [GeminiService] Initialized GoogleGenerativeAI client');
      } catch (err) {
        console.warn('⚠️ [GeminiService] Failed to initialize GoogleGenerativeAI client:', err.message);
      }
    } else {
      console.warn('⚠️ [GeminiService] GEMINI_API_KEY is not set. Service will delegate to Groq or fallback logic.');
    }
  }

  getClient() {
    if (!this.client && process.env.GEMINI_API_KEY) {
      this.init();
    }
    return this.client;
  }

  /**
   * Generate text completion using Gemini with rapid fallback across candidate models
   */
  async generateText({ prompt, systemInstruction, temperature = 0.7, timeoutMs = 25000 }) {
    const client = this.getClient();
    if (!client) return null;
    const startTime = Date.now();

    const candidateModels = AI_CONFIG.gemini.fallbackModels;

    for (const modelName of candidateModels) {
      try {
        console.log(`[AI REQUEST] provider=gemini model=${modelName} tool=text status=started`);
        const model = client.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction || undefined,
          generationConfig: {
            temperature,
            maxOutputTokens: 3500,
          },
        });

        const generatePromise = model.generateContent(prompt);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini request timed out')), timeoutMs)
        );

        const result = await Promise.race([generatePromise, timeoutPromise]);
        const response = await result.response;
        const text = response.text();

        if (text) {
          console.log(`[AI RESPONSE] provider=gemini model=${modelName} status=success duration=${Date.now() - startTime}ms`);
          return text;
        }
      } catch (err) {
        console.warn(`[AI ERROR] provider=gemini model=${modelName} error="${err.message}"`);
        if (err.message && (err.message.includes('API key not valid') || err.message.includes('API_KEY_INVALID'))) {
          break; // Key is invalid; don't waste time trying subsequent models
        }
      }
    }

    return null;
  }

  /**
   * Generate structured JSON output using Gemini
   */
  async generateJSON({ prompt, systemInstruction, timeoutMs = 15000 }) {
    const client = this.getClient();
    if (!client) return null;
    const startTime = Date.now();

    const candidateModels = AI_CONFIG.gemini.fallbackModels;

    for (const modelName of candidateModels) {
      try {
        console.log(`[AI REQUEST] provider=gemini model=${modelName} tool=json status=started`);
        const model = client.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction || 'You are an AI that outputs strictly valid JSON only.',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
            maxOutputTokens: 3000,
          },
        });

        const generatePromise = model.generateContent(prompt);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini JSON request timed out')), timeoutMs)
        );

        const result = await Promise.race([generatePromise, timeoutPromise]);
        const response = await result.response;
        const text = response.text();
        const parsed = JSON.parse(text);

        console.log(`[AI RESPONSE] provider=gemini model=${modelName} json=valid duration=${Date.now() - startTime}ms`);
        return parsed;
      } catch (err) {
        console.warn(`[AI ERROR] provider=gemini model=${modelName} json-error="${err.message}"`);
        if (err.message && (err.message.includes('API key not valid') || err.message.includes('API_KEY_INVALID'))) {
          break; // Key is invalid; don't waste time trying subsequent models
        }
      }
    }

    return null;
  }
}

module.exports = new GeminiService();
