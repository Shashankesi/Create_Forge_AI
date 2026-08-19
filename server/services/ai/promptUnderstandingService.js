/**
 * Prompt Understanding & Topic Normalization Service
 * Intelligently extracts true subject, intent, and implicit options from raw user prompts.
 * Handles common typos, casual phrasing, and conversational prefixes without overprocessing simple inputs.
 */
class PromptUnderstandingService {
  /**
   * Normalize user prompt into a clean subject topic and inferred parameters
   * @param {string} rawInput - The raw string entered by user
   * @param {Object} existingOptions - Options already chosen via dropdowns
   * @returns {Object} { normalizedTopic, intent, inferredArticleType, rawInput }
   */
  normalize(rawInput = '', existingOptions = {}) {
    if (!rawInput || typeof rawInput !== 'string') {
      return {
        normalizedTopic: 'General Topic',
        rawInput: '',
        intent: 'generate_article',
        inferredArticleType: existingOptions.articleType || 'Comprehensive Guide',
      };
    }

    const trimmed = rawInput.trim();

    // 1. Detect if input is already a clean simple topic (e.g., "esports", "react hooks", "cricket")
    // Simple 1-3 word inputs without instruction verbs or meta words shouldn't be stripped.
    const isSingleWordOrSimpleNoun = /^[a-zA-Z0-9\s#+.\-_/&']{1,40}$/.test(trimmed) &&
      !/^(write|genrate|generate|create|make|give|tell|explain|provide|draft|summarize|compare|article|blog|guide|tutorial|essay|how to)\b/i.test(trimmed);

    if (isSingleWordOrSimpleNoun && trimmed.split(/\s+/).length <= 4) {
      return {
        normalizedTopic: this.toTitleCase(this.fixCommonTypos(trimmed)),
        rawInput: trimmed,
        intent: 'generate_article',
        inferredArticleType: existingOptions.articleType || 'Comprehensive Guide',
      };
    }

    // 2. Identify implicit article type from phrasing if not explicitly overridden
    let inferredArticleType = existingOptions.articleType || 'Comprehensive Guide';
    if (/\b(beginner guide|beginner's guide|for beginners|introduction to|getting started with)\b/i.test(trimmed)) {
      inferredArticleType = 'Beginner Guide';
    } else if (/\b(how to|step by step|guide on how to|tutorial on)\b/i.test(trimmed)) {
      inferredArticleType = 'Tutorial';
    } else if (/\b(comparison|versus|vs\.?|difference between|compare)\b/i.test(trimmed)) {
      inferredArticleType = 'Comparison';
    } else if (/\b(case study|real world example|analysis of)\b/i.test(trimmed)) {
      inferredArticleType = 'Case Study';
    } else if (/\b(thought leadership|future of|trends in|predictions for)\b/i.test(trimmed)) {
      inferredArticleType = 'Thought Leadership';
    }

    // 3. Strip conversational and instructional preambles
    let cleaned = trimmed;

    // Remove leading conversational fillers
    cleaned = cleaned.replace(/^(can you|please|i want to|i need to|kindly|could you|help me)\s+/i, '');

    // Normalize spelling of common verbs/nouns first before regex matching
    cleaned = cleaned
      .replace(/\bgenrate\b/gi, 'generate')
      .replace(/\bartilce\b/gi, 'article')
      .replace(/\bcrickit\b/gi, 'cricket');

    // Handle "comparison between X and Y" -> "X vs Y"
    const comparisonMatch = cleaned.match(/^(?:write|generate|make|create)?\s*(?:a|an)?\s*comparison\s+between\s+(.+?)\s+and\s+(.+)$/i);
    if (comparisonMatch) {
      cleaned = `${comparisonMatch[1].trim()} vs ${comparisonMatch[2].trim()}`;
    }

    // Handle "difference between X and Y" -> "X vs Y"
    const diffMatch = cleaned.match(/^(?:what is|explain)?\s*(?:the)?\s*(?:difference|differences)\s+between\s+(.+?)\s+and\s+(.+)$/i);
    if (diffMatch) {
      cleaned = `${diffMatch[1].trim()} vs ${diffMatch[2].trim()}`;
    }

    // Remove instruction action verbs & specifiers with strict word boundaries
    const instructionPatterns = [
      // "write an article about", "generate article on", "make blog on", "give me titles for", etc.
      /^(?:write|generate|create|make|give\s+me|produce|draft|craft|compose|publish)\s+(?:(?:a|an|the|me|some)\s+)?(?:(?:detailed|in-depth|short|quick|comprehensive|complete|ultimate|beginner'?s?|simple)\s+)?(?:(?:articles?|blog\s+posts?|blogs?|posts?|guides?|tutorials?|essays?|writeups?|titles?|headlines?|ideas?)\s+)?(?:(?:on|about|for|regarding|to|explaining)\s+)?(?:the\s+)?/i,
      // "article on...", "article for...", "guide to...", "article about..."
      /^(?:(?:a|an)\s+)?(?:detailed|in-depth|comprehensive|complete|ultimate)?\s*(?:articles?|blog\s+posts?|blogs?|guides?|tutorials?|essays?)\s+(?:on|about|for|regarding|to)\s+(?:the\s+)?/i,
      // "tell me about", "explain", "what is"
      /^(?:tell\s+me\s+about|explain|describe|what\s+is|what\s+are|breakdown\s+of|summary\s+of)\s+(?:the\s+)?/i,
    ];

    for (const pattern of instructionPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }

    // Handle "how X is changing/transforming Y" -> "X in Y"
    const howChangingMatch = cleaned.match(/^how\s+(.+?)\s+is\s+(?:changing|transforming|revolutionizing|impacting|reshaping)\s+(.+)$/i);
    if (howChangingMatch) {
      cleaned = `${howChangingMatch[1].trim()} in ${howChangingMatch[2].trim()}`;
    }

    // Handle trailing filler phrases
    cleaned = cleaned.replace(/\s+(for beginners|in detail|with examples|step by step|in 2026|today)$/i, '');

    // 4. Fix common typos in domain words
    cleaned = this.fixCommonTypos(cleaned);

    // 5. Final fallback cleanup
    cleaned = cleaned.replace(/^[^\w#+']+/g, '').replace(/[.!?]+$/g, '').trim();

    if (!cleaned) {
      cleaned = trimmed; // fallback to raw if overly stripped
    }

    const normalizedTopic = this.toTitleCase(cleaned);

    return {
      normalizedTopic,
      rawInput: trimmed,
      intent: 'generate_article',
      inferredArticleType,
    };
  }

  /**
   * Fix common spelling errors and shorthand
   */
  fixCommonTypos(text) {
    const typoMap = {
      esport: 'Esports',
      esports: 'Esports',
      'e-sports': 'Esports',
      ai: 'AI',
      ml: 'Machine Learning',
      js: 'JavaScript',
      ts: 'TypeScript',
      py: 'Python',
      cricket: 'Cricket',
      frontend: 'Front-End Development',
      backend: 'Back-End Development',
      devops: 'DevOps',
      saas: 'SaaS',
    };

    const words = text.split(/\s+/);
    const corrected = words.map((w) => {
      const lower = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      return typoMap[lower] || w;
    });

    return corrected.join(' ');
  }

  /**
   * Convert normalized string to proper Title Case preserving acronyms and contractions
   */
  toTitleCase(str) {
    if (!str) return '';
    const minorWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'the', 'to', 'with', 'vs', 'how', 'is']);
    const acronyms = new Set(['ai', 'ml', 'ui', 'ux', 'api', 'rest', 'jwt', 'seo', 'css', 'html', 'js', 'ts', 'sql', 'nosql', 'saas', 'fps', 'moba', 'pc', 'rpg', 'llm']);

    return str
      .split(/\s+/)
      .map((word, index) => {
        const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (acronyms.has(clean)) {
          return word.toUpperCase();
        }
        if (index > 0 && minorWords.has(clean) && !word.includes("'")) {
          return word.toLowerCase();
        }
        // Handle apostrophes e.g. India's
        if (word.includes("'")) {
          const parts = word.split("'");
          return parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + "'" + parts[1].toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }
}

module.exports = new PromptUnderstandingService();
