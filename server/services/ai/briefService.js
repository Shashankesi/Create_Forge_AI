const aiOrchestrator = require('./aiOrchestrator');

/**
 * Creative Brief Engine
 * Transforms raw user thoughts into an executive creative campaign brief with recommended deliverables.
 */
class BriefService {
  async generateBrief({
    rawInput,
    projectName,
    targetAudience = 'General',
    industry = 'Technology',
    brandPersonality = 'Visionary',
  }) {
    const prompt = `You are the Executive Creative Director at CreateForge AI Studio.
Transform the following campaign ideas and notes into a structured, publication-grade Creative Brief.

Campaign Name: "${projectName || 'New Campaign'}"
User Raw Notes / Ideas: "${rawInput}"
Target Audience: "${targetAudience}"
Industry: "${industry}"
Brand Voice / Personality: "${brandPersonality}"

Respond strictly in valid JSON matching this schema:
{
  "projectName": "${projectName || 'Campaign Blueprint'}",
  "campaignObjective": "Clear, measurable 1-2 sentence core mission",
  "targetAudience": "Deeply specified audience segment with psychographics",
  "industry": "${industry}",
  "mainTopic": "Refined thematic subject",
  "brandPersonality": "${brandPersonality}",
  "contentGoal": "e.g. Drive product awareness, generate inbound leads, or establish category leadership",
  "primaryPlatform": "e.g. Multi-Channel (LinkedIn, Blog, X, YouTube)",
  "callToAction": "Compelling primary CTA phrase",
  "keywords": ["Core Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4"],
  "visualDirection": "Detailed visual style guidelines for FLUX image generator",
  "competitors": ["Generic competitor archetype 1", "Generic archetype 2"],
  "requiredDeliverables": [
    "Comprehensive Pillar Article (1,200 words)",
    "10 High-CTR Headlines",
    "Hero FLUX Promotional Visual",
    "LinkedIn Thought-Leadership Post",
    "5-Tweet X Thread",
    "Instagram Carousel Script",
    "SEO Meta Description & SERP Blueprint"
  ],
  "aiRecommendations": {
    "suggestedDeliverables": [
      "Landing Page Copy",
      "Executive Case Study",
      "Email Newsletter Teaser"
    ],
    "keyThemes": [
      "Theme 1: Innovation and speed",
      "Theme 2: Trust and quantifiable ROI",
      "Theme 3: Modern practitioner empowerment"
    ],
    "toneAdvice": "Maintain an authoritative yet approachable tone with concrete metrics.",
    "estimatedTimeline": "3-5 Phase Workflow"
  }
}`;

    try {
      const responseText = await aiOrchestrator.generateText(prompt, {
        temperature: 0.6,
        maxTokens: 2000,
        taskName: 'CreativeBrief',
      });

      const parsed = aiOrchestrator.extractJson(responseText);
      if (parsed && parsed.campaignObjective) {
        return parsed;
      }
    } catch (err) {
      console.warn('[BriefService] Fallback brief generated:', err.message);
    }

    return {
      projectName: projectName || 'Campaign Blueprint',
      campaignObjective: `Position ${projectName || 'the product'} as the premier solution for ${targetAudience}.`,
      targetAudience: targetAudience || 'Modern Creators & Founders',
      industry,
      mainTopic: rawInput.substring(0, 80),
      brandPersonality,
      contentGoal: 'Educate, engage, and inspire action.',
      primaryPlatform: 'Multi-Channel (Blog + Social)',
      callToAction: 'Explore the future of creative production today.',
      keywords: [rawInput.split(' ')[0] || 'Innovation', 'Best Practices', 'Productivity', '2026 Strategy'],
      visualDirection: 'Cinematic photography, clean minimalist compositions, vibrant accent lighting.',
      competitors: ['Traditional fragmented tools', 'Surface-level AI wrappers'],
      requiredDeliverables: [
        'Comprehensive Pillar Article',
        '10 Categorized Headlines',
        'FLUX Hero Visual',
        'LinkedIn Thought-Leadership Post',
        '5-Tweet X Thread',
        'SEO Meta & SERP Blueprint',
      ],
      aiRecommendations: {
        suggestedDeliverables: ['Instagram Reel Script', 'Executive Summary'],
        keyThemes: ['Empowerment', 'High-Velocity Execution', 'Uncompromised Quality'],
        toneAdvice: 'Bold, structured, and free of filler phrases.',
        estimatedTimeline: 'Ready for production pipeline',
      },
    };
  }
}

module.exports = new BriefService();
