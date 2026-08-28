const aiOrchestrator = require('./aiOrchestrator');

/**
 * Social Content Pack Engine
 * Generates ready-to-publish social assets tailored specifically for LinkedIn, X, Instagram, and YouTube.
 */
class SocialPackService {
  async generateSocialPack({
    topic,
    articleTitle,
    articleContent,
    targetAudience = 'Creators & Professionals',
    tone = 'Engaging & Authoritative',
    brandVoice = 'Visionary',
  }) {
    const prompt = `You are a world-class Social Media Content Director.
Create a complete, high-converting Social Media Pack based on the following material:

Topic: "${topic || articleTitle}"
Article Title: "${articleTitle || topic}"
Core Excerpt: "${(articleContent || '').substring(0, 1000)}"
Target Audience: "${targetAudience}"
Tone: "${tone}"
Brand Voice: "${brandVoice}"

Produce native, platform-optimized copies. Respond strictly in valid JSON matching this schema:
{
  "linkedin": {
    "hooks": [
      "Hook option 1 (curiosity/contrarian)",
      "Hook option 2 (data/insight)",
      "Hook option 3 (storytelling)",
      "Hook option 4 (how-to)",
      "Hook option 5 (provocative question)"
    ],
    "fullPost": "Full-length LinkedIn post with line breaks, value delivery, and final discussion question."
  },
  "twitter": {
    "standalonePosts": [
      "Short punchy tweet 1 with hashtag",
      "Short punchy tweet 2",
      "Short punchy tweet 3",
      "Short punchy tweet 4",
      "Short punchy tweet 5"
    ],
    "thread": [
      "1/5 Thread opener hook with strong promise",
      "2/5 Core framework point with actionable advice",
      "3/5 Real-world example or key metric",
      "4/5 Critical pitfall to avoid",
      "5/5 Conclusion + CTA to bookmark/repost"
    ]
  },
  "instagram": {
    "caption": "Engaging Instagram caption with hook, emojis, and call to comment.",
    "carouselSlides": [
      { "slide": 1, "heading": "Cover Title", "body": "Catchy visual subtitle" },
      { "slide": 2, "heading": "The Problem", "body": "Why old methods fail" },
      { "slide": 3, "heading": "The Breakthrough", "body": "Core strategic framework" },
      { "slide": 4, "heading": "Implementation", "body": "Step-by-step checklist" },
      { "slide": 5, "heading": "Takeaway & CTA", "body": "Save this post for later" }
    ],
    "reelScript": "Hook: [First 3 seconds]\\nVisual: [On-screen text]\\nBody: [15-second concise breakdown]\\nOutro: [Follow for more]."
  },
  "youtube": {
    "titleOptions": [
      "High-CTR YouTube Title 1",
      "YouTube Title 2",
      "YouTube Title 3"
    ],
    "hook": "Opening 10-second retention script to prevent drop-off.",
    "description": "SEO-optimized YouTube video description with timestamps and links.",
    "chapters": [
      "0:00 - Introduction",
      "1:15 - The Core Problem",
      "3:45 - Step-by-Step Blueprint",
      "7:30 - Common Mistakes",
      "9:50 - Final Summary & Action"
    ]
  },
  "ctaVariants": [
    "Read the full comprehensive guide (Link in bio)",
    "Share this with someone building their next campaign",
    "Drop your biggest takeaway in the comments below",
    "Subscribe for weekly high-signal creative insights",
    "Try this framework on your next project today"
  ]
}`;

    try {
      const responseText = await aiOrchestrator.generateText(prompt, {
        temperature: 0.65,
        maxTokens: 2500,
        taskName: 'SocialContentPack',
      });

      const parsed = aiOrchestrator.extractJson(responseText);
      if (parsed && parsed.linkedin && parsed.twitter) {
        return parsed;
      }
    } catch (err) {
      console.warn('[SocialPackService] Fallback generated:', err.message);
    }

    const cleanTitle = articleTitle || topic || 'Creative Production';

    return {
      linkedin: {
        hooks: [
          `Most people get ${cleanTitle} completely wrong. Here's what actually works in 2026:`,
          `3 hard truths about ${cleanTitle} that took me years to realize:`,
          `How we scaled our approach to ${cleanTitle} with zero wasted effort:`,
          `Stop overcomplicating ${cleanTitle}. Use this simple framework instead:`,
          `Why the top 1% of creators treat ${cleanTitle} differently:`,
        ],
        fullPost: `Most teams spend 80% of their time on repetitive creation and only 20% on creative direction.\n\nHere is how to flip the equation with ${cleanTitle}:\n\n1. Establish a single source of truth (Creative Brief).\n2. Automate cross-channel formatting.\n3. Keep visual and editorial voices strictly aligned.\n\nThe result? 10x faster execution without sacrificing depth.\n\nWhat is your team's biggest bottleneck right now? Drop a comment below.`,
      },
      twitter: {
        standalonePosts: [
          `If you want to master ${cleanTitle}, focus on speed, structure, and consistency. Everything else is secondary.`,
          `The secret to ${cleanTitle} is not working longer hours—it's building better automated pipelines.`,
          `Never start creating without a structured brief. 5 minutes of planning saves 5 hours of revisions.`,
          `Your audience doesn't care about your effort; they care about clarity and actionable value.`,
          `Simplicity scales. Complexity breaks. Keep your content sharp.`,
        ],
        thread: [
          `1/5 How to master ${cleanTitle} in 2026 (without burning out): 🧵`,
          `2/5 Step 1: Start with deep research. Understand search intent and audience pain points before writing a single word.`,
          `3/5 Step 2: Build a pillar asset. A comprehensive guide provides the raw material for 10+ social pieces.`,
          `4/5 Step 3: Repurpose intelligently. Tailor formats natively for LinkedIn, X, and Instagram.`,
          `5/5 That's the playbook. If you found this valuable, repost the first tweet to share with your network! 🔁`,
        ],
      },
      instagram: {
        caption: `Ready to elevate your strategy on ${cleanTitle}? Here is the step-by-step breakdown you need to know today. 🚀\n\nSwipe through for the full framework ➡️\n\nSave this post so you don't lose it! 📌`,
        carouselSlides: [
          { slide: 1, heading: cleanTitle, body: 'The 2026 Execution Blueprint' },
          { slide: 2, heading: 'The Big Problem', body: 'Why traditional workflows are too slow' },
          { slide: 3, heading: 'The Solution', body: 'Unified creative pipelines' },
          { slide: 4, heading: 'Key Takeaways', body: '3 principles to apply immediately' },
          { slide: 5, heading: 'Next Steps', body: 'Follow @CreateForgeAI for more' },
        ],
        reelScript: `[Hook - 0:00] Stop struggling with ${cleanTitle}.\n[Body - 0:05] Here is the 3-step system top creators use to produce 10x more high-impact content.\n[CTA - 0:25] Check the link in bio for the complete template!`,
      },
      youtube: {
        titleOptions: [
          `How to Master ${cleanTitle} (Step-by-Step Tutorial)`,
          `${cleanTitle} Explained: The Complete 2026 Guide`,
          `Why Everything You Know About ${cleanTitle} Is Changing`,
        ],
        hook: `In the next 8 minutes, I'm going to show you the exact system we used to revolutionize our approach to ${cleanTitle}. Let's dive in.`,
        description: `Everything you need to know about ${cleanTitle}.\n\nTimestamps:\n0:00 - Introduction\n1:20 - The Core Framework\n4:00 - Step-by-Step Blueprint\n7:00 - Final Takeaways`,
        chapters: [
          '0:00 - Introduction',
          '1:20 - The Core Framework',
          '4:00 - Step-by-Step Blueprint',
          '7:00 - Final Takeaways',
        ],
      },
      ctaVariants: [
        'Read the full comprehensive guide at CreateForge AI.',
        'Save this post for your next project kickoff.',
        'Share this with your team to streamline your workflow.',
        'Subscribe for more high-signal creative studio insights.',
      ],
    };
  }

  /**
   * REGENERATE SINGLE PLATFORM SOCIAL
   * Produces fresh platform-native copy for LinkedIn, Twitter/X, Instagram, or YouTube with a targeted hook style.
   */
  async generateSinglePlatformSocial({
    platform = 'linkedin',
    hookStyle = 'Contrarian',
    topic,
    articleTitle,
    articleContent,
    targetAudience = 'Creators & Professionals',
    tone = 'Engaging & Authoritative',
    brandVoice = 'Visionary',
  }) {
    const cleanTitle = articleTitle || topic || 'Creative Strategy';
    const prompt = `You are CreateForge AI's Lead Social Growth Strategist.
Generate high-converting, platform-native content specifically for: "${platform.toUpperCase()}".
Hook Angle: "${hookStyle}" (e.g. Contrarian, Provocative Question, Actionable Breakdown, Story, Challenge)
Topic/Title: "${cleanTitle}"
Excerpt: "${(articleContent || '').substring(0, 1000)}"
Target Audience: "${targetAudience}"
Tone: "${tone}"
Brand Voice: "${brandVoice}"

Directives for ${platform}:
- Avoid generic marketing clichés.
- Sound human, high-signal, and native to the platform mechanics.
- Produce structured JSON for this platform only.

Respond strictly in JSON matching:
{
  "platform": "${platform}",
  "hookStyle": "${hookStyle}",
  "hooks": ["Angle 1", "Angle 2", "Angle 3"],
  "content": "Platform-native post text or script",
  "extras": ["Extra tip / hashtag / CTA"]
}`;

    try {
      const responseText = await aiOrchestrator.generateText(prompt, {
        temperature: 0.65,
        maxTokens: 1500,
        taskName: `SocialSingle_${platform}`,
      });
      const parsed = aiOrchestrator.extractJson(responseText);
      if (parsed && (parsed.content || parsed.hooks)) {
        return parsed;
      }
    } catch (err) {
      console.warn(`[SocialPackService] Single platform fallback (${platform}):`, err.message);
    }

    // Heuristic platform fallback
    return {
      platform,
      hookStyle,
      hooks: [
        `Why most approaches to ${cleanTitle} fail in production:`,
        `The single biggest insight about ${cleanTitle} you need to know today:`,
        `3 non-obvious principles for mastering ${cleanTitle}:`,
      ],
      content: `If you want to achieve exceptional results with ${cleanTitle}, stop relying on generic tactics.\n\nFocus on these 3 fundamentals:\n1. Strict workflow discipline\n2. Rapid contextual iteration\n3. High-signal execution\n\nSave this for your next creative sprint.`,
      extras: [`#${cleanTitle.replace(/\s+/g, '')}`, '#CreateForgeAI', '#Productivity'],
    };
  }
}

module.exports = new SocialPackService();
