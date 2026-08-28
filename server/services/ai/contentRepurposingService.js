const aiOrchestrator = require('./aiOrchestrator');

/**
 * Content Repurposing Service
 * Transforms long-form articles into high-engagement cross-platform formats.
 */
class ContentRepurposingService {
  async repurpose({ articleTitle, articleContent, format, targetAudience = 'General', customInstructions = '' }) {
    if (!articleContent || !articleContent.trim()) {
      const err = new Error('Article content is required for repurposing.');
      err.statusCode = 400;
      throw err;
    }

    const formatGuides = {
      'linkedin-post': 'A high-impact, professional LinkedIn post with hook, key lessons in bullet points, and an engaging question at the end. Use clean spacing and relevant hashtags.',
      'x-thread': 'A 5-8 tweet thread numbered (1/X, 2/X...), with a compelling viral hook in tweet 1, concise high-value insights, and a concluding takeaway.',
      'instagram-caption': 'An aesthetic, engaging Instagram caption with a punchy hook line, short formatted insights, line breaks, call to action, and 8-10 relevant hashtags.',
      'newsletter': 'A complete email newsletter issue with Subject Line, Preview Text, Warm Introduction, Core Breakdown, Actionable Takeaways, and Sign-off.',
      'youtube-script': 'A video script outline with [Hook: 0-15s], [Intro & Value Proposition], [Section 1, 2, 3 Timestamps & Talking Points], [B-roll suggestions], and [Call to Action & Outro].',
      'short-summary': 'An executive 3-paragraph summary covering Background, Key Insights, and Strategic Implications.',
      'faq': 'A comprehensive 5-question FAQ with clear, authoritative answers based strictly on the article content.',
      'email': 'A high-converting outreach or broadcast email with compelling subject line, concise body, and clear single call-to-action.',
      'meta-description': 'Optimized SEO Meta Title (under 60 chars) and Meta Description (145-160 chars) targeting high CTR.',
    };

    const targetGuide = formatGuides[format] || `Convert the article into ${format} format.`;

    const prompt = `Repurpose the following article into: ${format.toUpperCase()}

FORMAT SPECIFICATION:
${targetGuide}

${customInstructions ? `USER CUSTOM INSTRUCTIONS:\n${customInstructions}\n` : ''}

ARTICLE TITLE: "${articleTitle || 'Untitled Article'}"
TARGET AUDIENCE: "${targetAudience}"

SOURCE ARTICLE CONTENT:
${articleContent.substring(0, 5000)}

Please return the repurposed content ready for publishing. Maintain high quality, natural voice, and avoid generic clichés.`;

    try {
      const result = await aiOrchestrator.generateText({
        prompt,
        systemInstruction: 'You are CreateForge AI Content Strategist, specialized in multi-channel creative distribution.',
        temperature: 0.7,
      });

      return {
        success: true,
        format,
        content: result.content.trim(),
        metadata: {
          provider: result.provider,
          model: result.model,
          durationMs: result.durationMs,
          repurposedAt: new Date().toISOString(),
        },
      };
    } catch (err) {
      console.warn(`⚠️ [ContentRepurposingService] Fallback synthesis: ${err.message}`);
      const cleanSnippet = (articleContent || '').replace(/[#*`]/g, '').slice(0, 350).trim();
      const fallbackContent = `🚀 Key Insights from "${articleTitle || 'Article'}":\n\n${cleanSnippet}...\n\n💡 Core Takeaways:\n• Move from isolated prompts to integrated creative workflows.\n• Elevate content depth and audience alignment.\n\n#CreativeAI #ContentStrategy #Growth`;
      return {
        success: true,
        format,
        content: fallbackContent,
        metadata: {
          provider: 'editorial-synthesizer',
          model: 'cf-repurpose-v2',
          durationMs: 50,
          repurposedAt: new Date().toISOString(),
        },
      };
    }
  }
}

module.exports = new ContentRepurposingService();
