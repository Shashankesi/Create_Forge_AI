const aiOrchestrator = require('./aiOrchestrator');
const imageService = require('./imageService');

/**
 * 1-Click Creative Content Pack Service
 * Generates an end-to-end multi-asset creative campaign from a single idea.
 */
class ContentPackService {
  async generateContentPack({
    topic,
    audience = 'General',
    tone = 'Engaging',
    generateCover = true,
  }) {
    if (!topic || !topic.trim()) {
      const err = new Error('Please provide a topic for the Content Pack.');
      err.statusCode = 400;
      throw err;
    }

    const cleanTopic = topic.trim();

    const prompt = `Generate a complete, high-quality Creative Content Pack for the topic: "${cleanTopic}"
Audience: ${audience}
Tone: ${tone}

Please produce a comprehensive structured JSON response containing:
1. "articleTitle": An engaging, professional headline.
2. "articleContent": A 500-800 word complete, structured Markdown article with subheadings. Start directly with substance, avoiding generic clichés.
3. "titles": An array of 5 alternative title variations (SEO, Curiosity, Professional, Storytelling, Social).
4. "summary": A 2-3 sentence executive summary.
5. "seo": An object with "metaTitle" (under 60 chars), "metaDescription" (under 160 chars), and "primaryKeywords" (array of 4-6 keywords).
6. "faq": An array of 3 objects, each with "question" and "answer".
7. "social": An object with:
   - "linkedInPost": Formatted LinkedIn post with bullet takeaways and hook.
   - "xThread": An array of 4-5 tweet strings.
   - "instagramCaption": Aesthetic IG caption with hashtags.
8. "imagePrompt": A detailed, cinematic FLUX prompt suitable for generating an editorial cover visual for this piece.`;

    const schemaDescription = `{
  "articleTitle": "String",
  "articleContent": "String (Markdown)",
  "titles": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"],
  "summary": "String",
  "seo": {
    "metaTitle": "String",
    "metaDescription": "String",
    "primaryKeywords": ["keyword1", "keyword2"]
  },
  "faq": [
    { "question": "Q1", "answer": "A1" }
  ],
  "social": {
    "linkedInPost": "String",
    "xThread": ["Tweet 1", "Tweet 2"],
    "instagramCaption": "String"
  },
  "imagePrompt": "String"
}`;

    const fallbackData = {
      articleTitle: `Mastering ${cleanTopic}: The Strategic Playbook`,
      articleContent: `# Mastering ${cleanTopic}\n\nIn the evolving creative landscape, mastering ${cleanTopic} requires a balance of clear intent, rapid execution, and continuous optimization.\n\n## 1. Fundamentals\nFocus on core principles first. Build a structured brief and eliminate guesswork.\n\n## 2. Execution\nExecute systematically with unified assets and brand alignment.\n\n## 3. Scale\nRepurpose seamlessly across multi-channel campaigns.`,
      titles: [
        `Mastering ${cleanTopic}: The 2026 Guide`,
        `How to Excel in ${cleanTopic} with Confidence`,
        `The Insider Playbook on ${cleanTopic}`,
        `3 Game-Changing Secrets to ${cleanTopic}`,
        `Why ${cleanTopic} is Defining the Future of Creativity`,
      ],
      summary: `A tactical overview of ${cleanTopic}, focusing on foundational execution and scalable growth.`,
      seo: {
        metaTitle: `${cleanTopic} Playbook | CreateForge AI`,
        metaDescription: `Discover key insights, strategies, and frameworks for ${cleanTopic}.`,
        primaryKeywords: [cleanTopic, 'Strategy', 'Guide', 'Productivity'],
      },
      faq: [
        { question: `What is the key to ${cleanTopic}?`, answer: 'Consistency and clear creative structure.' },
        { question: 'How to get started quickly?', answer: 'Focus on core goals and establish a structured workflow.' },
        { question: 'How to scale results?', answer: 'Repurpose pillar content into multi-channel campaigns.' },
      ],
      social: {
        linkedInPost: `Excited to share our complete framework on ${cleanTopic}.\n\nKey takeaways:\n- Focus on clear intent\n- Eliminate repetitive bottlenecks\n- Scale across channels\n\nWhat is your biggest priority this quarter?`,
        xThread: [
          `1/4 The definitive breakdown on ${cleanTopic} 🧵`,
          `2/4 Principle 1: Start with high-signal research.`,
          `3/4 Principle 2: Build high-quality pillar assets.`,
          `4/4 Retweet to share with fellow creators! 🔁`,
        ],
        instagramCaption: `Transforming how we approach ${cleanTopic}. Swipe through for the full blueprint! 🚀 #CreateForge #${cleanTopic.replace(/\s+/g, '')}`,
      },
      imagePrompt: `Cinematic editorial photograph representing ${cleanTopic}, modern creative workstation, dramatic lighting, high detail, 8k.`,
    };

    const structuredResult = await aiOrchestrator.generateStructuredJSON({
      prompt,
      systemInstruction: 'You are CreateForge AI Creative Director, crafting cohesive multi-format campaigns.',
      schemaDescription,
      fallback: fallbackData,
    });

    const packData = structuredResult.data;

    // Generate Cover visual if requested
    let coverImage = null;
    if (generateCover && packData.imagePrompt) {
      try {
        const visual = await imageService.generateArticleCoverImage({
          title: packData.articleTitle || cleanTopic,
          topic: cleanTopic,
          summary: packData.summary,
          style: 'Cinematic',
        });
        coverImage = visual.imageUrl;
      } catch (imgErr) {
        console.warn(`[ContentPack] Cover image generation notice: ${imgErr.message}`);
      }
    }

    return {
      success: true,
      topic: cleanTopic,
      data: {
        ...packData,
        coverImageUrl: coverImage,
      },
      metadata: {
        provider: structuredResult.provider,
        model: structuredResult.model,
        durationMs: structuredResult.durationMs,
        createdAt: new Date().toISOString(),
      },
    };
  }
}

module.exports = new ContentPackService();
