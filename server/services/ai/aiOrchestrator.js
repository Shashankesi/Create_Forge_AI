const geminiService = require('./geminiService');
const grokService = require('./grokService');
const structuredOutputService = require('./structuredOutputService');

/**
 * Centralized AI Orchestration Engine 2.0
 * Routes requests intelligently between Gemini (complex tasks) and Groq (fast tasks),
 * handles automated provider fallbacks, structured JSON self-healing repair, and schema validation.
 */
class AIOrchestrator {
  constructor() {
    this.primaryProvider = 'gemini';
    this.fallbackProvider = 'groq';
  }

  /**
   * Universal text generation with automated provider fallback.
   * Supports both generateText({ prompt, ... }) and generateText(promptString, { ... })
   */
  async generateText(optionsOrPrompt, maybeOptions = {}) {
    let prompt, systemInstruction, temperature, maxTokens, preferredProvider;
    if (typeof optionsOrPrompt === 'string') {
      prompt = optionsOrPrompt;
      systemInstruction = maybeOptions.systemInstruction || '';
      temperature = maybeOptions.temperature || 0.7;
      maxTokens = maybeOptions.maxTokens || 4000;
      preferredProvider = maybeOptions.preferredProvider;
    } else {
      prompt = optionsOrPrompt?.prompt || '';
      systemInstruction = optionsOrPrompt?.systemInstruction || '';
      temperature = optionsOrPrompt?.temperature || 0.7;
      maxTokens = optionsOrPrompt?.maxTokens || 4000;
      preferredProvider = optionsOrPrompt?.preferredProvider;
    }

    const startTime = Date.now();
    let primaryError = null;

    // Fast-path routing if Groq is explicitly preferred
    if (preferredProvider === 'groq') {
      try {
        const grokKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
        if (grokKey) {
          const text = await grokService.generateText({
            prompt,
            systemInstruction: systemInstruction || 'You are CreateForge AI, an expert creative AI.',
            temperature,
            maxTokens,
          });

          if (text) {
            return {
              content: text,
              provider: 'groq',
              model: 'llama-3.3-70b-versatile',
              durationMs: Date.now() - startTime,
            };
          }
        }
      } catch (groqErr) {
        console.warn(`[AIOrchestrator] Groq fast-path notice: ${groqErr.message}. Falling back to Gemini...`);
      }
    }

    // Attempt Primary Provider (Gemini)
    try {
      if (process.env.GEMINI_API_KEY) {
        const text = await geminiService.generateText({
          prompt,
          systemInstruction,
          temperature,
        });
        if (text) {
          return {
            content: text,
            provider: 'gemini',
            model: 'gemini-1.5-flash',
            durationMs: Date.now() - startTime,
          };
        }
      }
    } catch (err) {
      primaryError = err;
      console.warn(`⚠️ [AIOrchestrator] Gemini attempt notice (${err.message}). Switching to Groq fallback...`);
    }

    // Attempt Fallback Provider (Groq / Llama)
    try {
      const grokKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
      if (grokKey) {
        const text = await grokService.generateText({
          prompt,
          systemInstruction: systemInstruction || 'You are CreateForge AI, an expert creative AI.',
          temperature,
          maxTokens,
        });

        if (text) {
          return {
            content: text,
            provider: 'groq',
            model: 'llama-3.3-70b-versatile',
            durationMs: Date.now() - startTime,
          };
        }
      }
    } catch (fallbackErr) {
      console.error(`❌ [AIOrchestrator] Fallback provider failed: ${fallbackErr.message}`);
    }

    // If both failed, return a clean normalized error
    if (primaryError) throw primaryError;
    const finalErr = new Error('AI generation services are currently unavailable. Please check API key configurations.');
    finalErr.statusCode = 503;
    finalErr.code = 'AI_UNAVAILABLE';
    throw finalErr;
  }

  /**
   * Universal structured JSON generator with automatic repair, validation, and fallback
   */
  async generateStructuredJSON({ prompt, systemInstruction = '', schemaDescription = '', requiredKeys = [], fallback = null }) {
    const structuredSystem = `${systemInstruction}
IMPORTANT: You MUST respond ONLY with valid, parseable JSON matching this schema:
${schemaDescription}
DO NOT wrap the JSON in conversational text. Return valid JSON only.`;

    // Attempt 1: Standard generation
    try {
      const { content, provider, model, durationMs } = await this.generateText({
        prompt,
        systemInstruction: structuredSystem,
        temperature: 0.2,
      });

      const parsed = structuredOutputService.parseAndRepair(content);
      if (parsed) {
        if (requiredKeys.length === 0 || structuredOutputService.validateSchema(parsed, requiredKeys)) {
          return {
            data: parsed,
            provider,
            model,
            durationMs,
          };
        }
      }
    } catch (err1) {
      console.warn(`[AIOrchestrator] Structured JSON Attempt 1 notice: ${err1.message}`);
    }

    // Attempt 2: Groq JSON Mode / Fallback with strict prompt
    try {
      const groqRes = await grokService.generateJSON({
        prompt,
        systemInstruction: structuredSystem,
      });

      if (groqRes) {
        const parsed = structuredOutputService.parseAndRepair(groqRes);
        if (parsed) {
          return {
            data: parsed,
            provider: 'groq',
            model: 'llama-3.3-70b-versatile',
            durationMs: 1500,
          };
        }
      }
    } catch (err2) {
      console.warn(`[AIOrchestrator] Structured JSON Attempt 2 notice: ${err2.message}`);
    }

    // Attempt 3: If fallback provided, return heuristic baseline safely
    if (fallback) {
      return {
        data: fallback,
        provider: 'createforge-heuristic-engine',
        model: 'cf-curator-v2',
        durationMs: 10,
      };
    }

    const err = new Error('Something went wrong while preparing the result. Please try again.');
    err.statusCode = 500;
    err.code = 'AI_STRUCTURED_ERROR';
    throw err;
  }

  /**
   * Safely extract JSON from raw model string or response object output
   */
  extractJson(textOrResponse) {
    if (textOrResponse && typeof textOrResponse === 'object' && textOrResponse.content) {
      return structuredOutputService.parseAndRepair(textOrResponse.content);
    }
    return structuredOutputService.parseAndRepair(textOrResponse);
  }
}

module.exports = new AIOrchestrator();
