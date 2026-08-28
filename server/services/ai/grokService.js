require('dotenv').config();
const axios = require('axios');
const AI_CONFIG = require('../../config/aiConfig');

class GrokService {
  constructor() {
    this.refresh();
  }

  refresh() {
    this.apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
    const isXai = this.apiKey && (this.apiKey.startsWith('xai-') || (!this.apiKey.startsWith('gsk_') && Boolean(process.env.GROK_API_KEY)));

    if (isXai) {
      this.apiUrl = 'https://api.x.ai/v1/chat/completions';
      this.candidateModels = AI_CONFIG.groq.xaiModels;
    } else {
      this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      this.candidateModels = AI_CONFIG.groq.fallbackModels;
    }

    if (!this.apiKey) {
      console.warn('⚠️ [GrokService] GROQ_API_KEY/GROK_API_KEY is not set. Service will delegate to Gemini/fallback logic.');
    } else {
      console.log(`✅ [GrokService] Configured with ${isXai ? 'xAI Grok Engine' : 'Groq Engine'}`);
    }
  }

  getKey() {
    if (!this.apiKey && (process.env.GROQ_API_KEY || process.env.GROK_API_KEY)) {
      this.refresh();
    }
    return this.apiKey;
  }

  /**
   * Generate text using Groq / xAI API with automatic model candidate fallback
   */
  async generateText({ prompt, systemInstruction, temperature = 0.7, maxTokens = 3000, timeoutMs = 20000 }) {
    const key = this.getKey();
    if (!key) return null;
    const startTime = Date.now();
    const actualTimeout = Math.max(Number(timeoutMs) || 20000, 15000);

    const userPromptText = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
    if (!userPromptText) return null;

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: String(systemInstruction) });
    }
    messages.push({ role: 'user', content: userPromptText });

    for (const model of this.candidateModels) {
      try {
        console.log(`[AI REQUEST] provider=groq model=${model} status=started`);
        const response = await axios.post(
          this.apiUrl,
          {
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
          },
          {
            headers: {
              Authorization: `Bearer ${key}`,
              'Content-Type': 'application/json',
            },
            timeout: actualTimeout,
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (content) {
          console.log(`[AI RESPONSE] provider=groq model=${model} status=success duration=${Date.now() - startTime}ms`);
          return content;
        }
      } catch (err) {
        const errMsg = err.response?.data?.error?.message || err.message;
        console.warn(`[AI ERROR] provider=groq model=${model} error="${errMsg}"`);
        if (errMsg && (errMsg.includes('Invalid API Key') || errMsg.includes('invalid_api_key') || err.response?.status === 401)) {
          break; // Don't try other models if the key itself is rejected
        }
      }
    }

    return null;
  }

  /**
   * Generate structured JSON using Groq / xAI API with model candidate fallback
   */
  async generateJSON({ prompt, systemInstruction, temperature = 0.2, timeoutMs = 20000 }) {
    const key = this.getKey();
    if (!key) return null;
    const startTime = Date.now();
    const actualTimeout = Math.max(Number(timeoutMs) || 20000, 15000);

    const userPromptText = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
    if (!userPromptText) return null;

    const messages = [
      {
        role: 'system',
        content: `${systemInstruction || ''}\nYou MUST return strictly valid JSON matching the requested structure. No preamble, no markdown backticks, raw JSON only.`,
      },
      {
        role: 'user',
        content: userPromptText,
      },
    ];

    for (const model of this.candidateModels) {
      try {
        console.log(`[AI REQUEST] provider=groq model=${model} tool=json status=started`);
        const response = await axios.post(
          this.apiUrl,
          {
            model,
            messages,
            temperature,
            response_format: { type: 'json_object' },
          },
          {
            headers: {
              Authorization: `Bearer ${key}`,
              'Content-Type': 'application/json',
            },
            timeout: actualTimeout,
          }
        );

        const raw = response.data?.choices?.[0]?.message?.content;
        if (raw) {
          const parsed = JSON.parse(raw);
          console.log(`[AI RESPONSE] provider=groq model=${model} json=valid duration=${Date.now() - startTime}ms`);
          return parsed;
        }
      } catch (err) {
        const errMsg = err.response?.data?.error?.message || err.message;
        console.warn(`[AI ERROR] provider=groq model=${model} json-error="${errMsg}"`);
        if (errMsg && (errMsg.includes('Invalid API Key') || errMsg.includes('invalid_api_key') || err.response?.status === 401)) {
          break; // Don't try other models if the key itself is rejected
        }
      }
    }

    return null;
  }
}

module.exports = new GrokService();
