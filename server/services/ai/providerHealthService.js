/**
 * AI Provider Health Monitor & Retry Intelligence
 * Safely tracks uptime, failure rates, latency metrics, and orchestrates retry recovery strategies
 */
class ProviderHealthService {
  constructor() {
    this.stats = {
      gemini: { successes: 0, failures: 0, totalLatencyMs: 0, lastError: null, lastSuccessAt: null },
      groq: { successes: 0, failures: 0, totalLatencyMs: 0, lastError: null, lastSuccessAt: null },
      flux: { successes: 0, failures: 0, totalLatencyMs: 0, lastError: null, lastSuccessAt: null },
    };
  }

  recordSuccess(provider, durationMs) {
    if (this.stats[provider]) {
      this.stats[provider].successes++;
      this.stats[provider].totalLatencyMs += durationMs;
      this.stats[provider].lastSuccessAt = new Date();
      this.stats[provider].lastError = null;
    }
  }

  recordFailure(provider, errorMsg) {
    if (this.stats[provider]) {
      this.stats[provider].failures++;
      this.stats[provider].lastError = { message: errorMsg, timestamp: new Date() };
    }
  }

  getHealthSummary() {
    const summary = {};
    for (const [provider, data] of Object.entries(this.stats)) {
      const total = data.successes + data.failures;
      const successRate = total > 0 ? Math.round((data.successes / total) * 100) : 100;
      const avgLatencyMs = data.successes > 0 ? Math.round(data.totalLatencyMs / data.successes) : 0;

      summary[provider] = {
        status: data.failures > 5 && data.successes === 0 ? 'degraded' : 'operational',
        successRate: `${successRate}%`,
        avgLatencyMs: `${avgLatencyMs}ms`,
        totalRequests: total,
        lastSuccessAt: data.lastSuccessAt,
      };
    }
    return summary;
  }

  /**
   * Intelligently determine recovery strategy when an AI call fails
   */
  determineRecoveryStrategy(error, currentProvider, taskType) {
    const msg = (error.message || '').toLowerCase();

    if (msg.includes('rate') || msg.includes('429') || msg.includes('quota')) {
      return {
        strategy: 'Switch Provider',
        recommendedProvider: currentProvider === 'gemini' ? 'groq' : 'gemini',
        action: 'switch_provider',
        message: 'Rate limit encountered on primary provider. Switching to high-speed fallback provider.',
      };
    }

    if (msg.includes('context') || msg.includes('token') || msg.includes('length') || msg.includes('too large')) {
      return {
        strategy: 'Prompt Simplification & Chunking',
        action: 'simplify_prompt',
        message: 'Input length exceeded provider budget. Compressing context and retrying.',
      };
    }

    if (msg.includes('timeout') || msg.includes('econnreset') || msg.includes('network')) {
      return {
        strategy: 'Safe Exponential Backoff Retry',
        action: 'retry_backoff',
        message: 'Network glitch detected. Retrying with connection pool refresh.',
      };
    }

    return {
      strategy: 'Fallback to Secondary Engine',
      recommendedProvider: currentProvider === 'gemini' ? 'groq' : 'gemini',
      action: 'switch_provider',
      message: 'Provider error handled. Rerouting to resilient backup engine.',
    };
  }
}

module.exports = new ProviderHealthService();
