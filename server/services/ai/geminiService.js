require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

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
   * Generate text completion using Gemini
   */
  async generateText({ prompt, systemInstruction, temperature = 0.7, timeoutMs = 25000 }) {
    const client = this.getClient();
    if (!client) return null;
    const startTime = Date.now();

    const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash'];

    for (const modelName of candidateModels) {
      try {
        console.log(`[AI REQUEST] provider=gemini model=${modelName} tool=text status=started`);
        const model = client.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction || undefined,
          generationConfig: {
            temperature,
            maxOutputTokens: 3000,
          },
        });

        const generatePromise = model.generateContent(prompt);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini request timed out')), timeoutMs)
        );

        const result = await Promise.race([generatePromise, timeoutPromise]);
        const response = await result.response;
        const text = response.text();

        console.log(`[AI RESPONSE] provider=gemini model=${modelName} status=success duration=${Date.now() - startTime}ms`);
        return text;
      } catch (err) {
        console.warn(`[AI ERROR] provider=gemini model=${modelName} error="${err.message}"`);
      }
    }

    return null;
  }

  /**
   * Generate structured JSON output using Gemini
   */
  async generateJSON({ prompt, systemInstruction, timeoutMs = 25000 }) {
    const client = this.getClient();
    if (!client) return null;
    const startTime = Date.now();

    const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash'];

    for (const modelName of candidateModels) {
      try {
        console.log(`[AI REQUEST] provider=gemini model=${modelName} tool=json status=started`);
        const model = client.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction || 'You are an AI that outputs strictly valid JSON only.',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
            maxOutputTokens: 2500,
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
      }
    }

    return null;
  }
}

module.exports = new GeminiService();
