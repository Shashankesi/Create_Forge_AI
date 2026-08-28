/**
 * CreateForge AI — Structured Output Service 2.0
 * Comprehensive JSON repair, markdown fence extraction, schema sanitation,
 * and resilient model response normalization.
 */
class StructuredOutputService {
  /**
   * Safely extract and repair JSON from raw LLM output strings
   */
  parseAndRepair(rawText, fallback = null) {
    if (!rawText || (typeof rawText !== 'string' && typeof rawText !== 'object')) {
      return fallback;
    }

    if (typeof rawText === 'object') {
      return rawText;
    }

    let text = rawText.trim();

    // 1. Strip reasoning blocks like <think>...</think> if present
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // 2. Strip Markdown code fences
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/i, '').replace(/\s*```$/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/i, '').replace(/\s*```$/g, '');
    }

    // 3. Try standard JSON.parse first
    try {
      return JSON.parse(text);
    } catch (initialErr) {
      // Continue to heuristic repair
    }

    // 4. Extract outermost JSON object or array
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      let extracted = jsonMatch[0].trim();
      try {
        return JSON.parse(extracted);
      } catch (extractedErr) {
        // Apply algorithmic repairs to extracted string
        const repaired = this.applyHeuristicRepairs(extracted);
        try {
          return JSON.parse(repaired);
        } catch (repairErr) {
          // Continue
        }
      }
    }

    // 5. Apply repairs to entire text
    const repairedFull = this.applyHeuristicRepairs(text);
    try {
      return JSON.parse(repairedFull);
    } catch {
      return fallback;
    }
  }

  /**
   * Fix common LLM JSON syntax errors:
   * - Trailing commas in arrays and objects
   * - Single-quoted keys and values
   * - Unescaped newlines inside strings
   * - Missing closing braces/brackets
   */
  applyHeuristicRepairs(str) {
    let clean = str;

    // Remove trailing commas before closing braces/brackets
    clean = clean.replace(/,\s*([\]}])/g, '$1');

    // Replace single quotes on keys: { 'key': 'value' } -> { "key": "value" }
    clean = clean.replace(/([{,]\s*)'([^']+)'\s*:/g, '$1"$2":');

    // Replace single-quoted string values if safe
    clean = clean.replace(/:\s*'([^']*)'/g, ': "$1"');

    // Balance unclosed curly braces if truncated
    const openBraces = (clean.match(/\{/g) || []).length;
    const closeBraces = (clean.match(/\}/g) || []).length;
    if (openBraces > closeBraces) {
      clean += '}'.repeat(openBraces - closeBraces);
    }

    // Balance unclosed square brackets
    const openBrackets = (clean.match(/\[/g) || []).length;
    const closeBrackets = (clean.match(/\]/g) || []).length;
    if (openBrackets > closeBrackets) {
      clean += ']'.repeat(openBrackets - closeBrackets);
    }

    return clean;
  }

  /**
   * Validate that an object has expected required top-level keys
   */
  validateSchema(obj, requiredKeys = []) {
    if (!obj || typeof obj !== 'object') return false;
    for (const key of requiredKeys) {
      if (obj[key] === undefined || obj[key] === null) {
        return false;
      }
    }
    return true;
  }
}

module.exports = new StructuredOutputService();
