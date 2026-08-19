const geminiService = require('./geminiService');
const grokService = require('./grokService');
const promptUnderstandingService = require('./promptUnderstandingService');

class TitleService {
  /**
   * Generate high-impact categorized blog titles
   */
  async generateTitles({ topic: rawTopic, niche = 'General', targetAudience = 'General', tone = 'Engaging', count = 10 }) {
    const startTime = Date.now();

    // 1. Semantic normalization
    const { normalizedTopic } = promptUnderstandingService.normalize(rawTopic);
    const titleCount = Math.min(Math.max(Number(count) || 10, 3), 20);

    const systemPrompt = `You are a world-class editorial headline strategist and copywriter.
Generate exactly ${titleCount} high-impact, engaging, and non-generic blog titles specifically for the topic: "${normalizedTopic}".

Categorize each title into diverse angles:
- "How-To"
- "Deep Dive"
- "Trend Analysis"
- "Listicle"
- "Case Study"
- "Beginner Guide"
- "Thought Leadership"

Return ONLY a JSON object with this exact schema:
{
  "titles": [
    { "title": "Example Title String", "category": "How-To" }
  ]
}`;

    const userPrompt = `Topic: ${normalizedTopic}\nNiche: ${niche}\nTarget Audience: ${targetAudience}\nTone: ${tone}\nCount: ${titleCount}\n\nGenerate ${titleCount} compelling titles now.`;

    let titlesList = null;
    let provider = 'groq';
    let model = 'llama-3.1-8b-instant';

    // 1. Try Groq JSON mode
    const grokRes = await grokService.generateJSON({
      prompt: userPrompt,
      systemInstruction: systemPrompt,
    });

    if (grokRes && Array.isArray(grokRes.titles) && grokRes.titles.length > 0) {
      titlesList = grokRes.titles;
    } else {
      // 2. Try Gemini JSON mode
      const geminiRes = await geminiService.generateJSON({
        prompt: userPrompt,
        systemInstruction: systemPrompt,
      });

      if (geminiRes && Array.isArray(geminiRes.titles) && geminiRes.titles.length > 0) {
        titlesList = geminiRes.titles;
        provider = 'gemini';
        model = 'gemini-1.5-flash';
      }
    }

    // 3. Fallback title generator if neither API responded
    if (!titlesList || titlesList.length === 0) {
      titlesList = this.getFallbackTitles(normalizedTopic, niche, titleCount);
      provider = 'createforge-title-engine';
      model = 'cf-title-curator-v2';
    }

    // Sanitize title entries
    const sanitizedTitles = titlesList.slice(0, titleCount).map((item) => ({
      title: (item.title || item.name || '').replace(/^[0-9]+[.\-)]\s*/, '').trim(),
      category: item.category || 'Guide',
    }));

    return {
      titles: sanitizedTitles,
      count: sanitizedTitles.length,
      normalizedTopic,
      rawTopic,
      metadata: {
        provider,
        model,
        topic: normalizedTopic,
        niche,
        tone,
        durationMs: Date.now() - startTime,
      },
    };
  }

  getFallbackTitles(topic, niche, count) {
    const templates = [
      { t: `${topic} Explained: A Clear Guide to How It Works`, cat: 'Explainer' },
      { t: `The Rise of ${topic}: Key Trends Shaping the Future`, cat: 'Trend Analysis' },
      { t: `How to Get Started with ${topic}: A Practical Roadmap`, cat: 'Beginner Guide' },
      { t: `Inside ${topic}: Strategy, Best Practices, and Real-World Insights`, cat: 'Deep Dive' },
      { t: `7 Essential Lessons Everyone Should Know About ${topic}`, cat: 'Listicle' },
      { t: `How to Master ${topic} Without Getting Overwhelmed`, cat: 'How-To' },
      { t: `Is ${topic} the Next Big Frontier? A Balanced Breakdown`, cat: 'Question' },
      { t: `${topic} vs Alternative Approaches: Which One Fits Your Needs?`, cat: 'Comparison' },
      { t: `Common Misconceptions About ${topic} (And What Really Works)`, cat: 'Guide' },
      { t: `The Modern Playbook for Navigating ${topic}`, cat: 'Deep Dive' },
      { t: `5 Proven Strategies to Accelerate Your ${topic} Workflow`, cat: 'Listicle' },
      { t: `Why ${topic} Matters More Than Ever in Modern ${niche}`, cat: 'Trend Analysis' },
    ];

    return templates.slice(0, count).map((item) => ({
      title: item.t,
      category: item.cat,
    }));
  }
}

module.exports = new TitleService();
