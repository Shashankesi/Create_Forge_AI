require('dotenv').config();
const axios = require('axios');

class GrokService {
  constructor() {
    this.refresh();
  }

  refresh() {
    this.apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
    const isGroq = this.apiKey && (this.apiKey.startsWith('gsk_') || Boolean(process.env.GROQ_API_KEY));
    this.apiUrl = isGroq
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.x.ai/v1/chat/completions';
    this.candidateModels = isGroq
      ? [
          'openai/gpt-oss-120b',
          'openai/gpt-oss-20b',
          'qwen/qwen3.6-27b',
          'groq/compound',
          'llama-3.3-70b-versatile',
          'llama-3.1-8b-instant',
        ]
      : ['grok-2-latest', 'grok-beta'];

    if (!this.apiKey) {
      console.warn('⚠️ [GrokService] GROQ_API_KEY/GROK_API_KEY is not set. Service will delegate to Gemini/fallback logic.');
    } else {
      console.log(`✅ [GrokService] Configured with ${isGroq ? 'Groq Engine' : 'xAI Grok Engine'}`);
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
  async generateText({ prompt, systemInstruction, temperature = 0.7, maxTokens = 2500, timeoutMs = 25000 }) {
    const key = this.getKey();
    if (!key) return null;
    const startTime = Date.now();

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

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
            timeout: timeoutMs,
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
      }
    }

    return null;
  }

  /**
   * Generate structured JSON using Groq / xAI API with model candidate fallback
   */
  async generateJSON({ prompt, systemInstruction, temperature = 0.3, timeoutMs = 25000 }) {
    const key = this.getKey();
    if (!key) return null;
    const startTime = Date.now();

    const messages = [
      {
        role: 'system',
        content: `${systemInstruction || ''}\nYou MUST return strictly valid JSON matching the requested structure. No preamble, no markdown backticks, raw JSON only.`,
      },
      {
        role: 'user',
        content: prompt,
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
            timeout: timeoutMs,
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
      }
    }

    return null;
  }
}

module.exports = new GrokService();
