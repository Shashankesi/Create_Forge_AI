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

    const cleanTitle = articleTitle || topic || 'Core Content';

    return {
      linkedin: {
        hooks: [
          `Most people overlook the real fundamentals of ${cleanTitle}. Here's what actually makes the difference:`,
          `3 perspectives on ${cleanTitle} that shift how you think about it:`,
          `Here's how a clearer approach to ${cleanTitle} changes real outcomes:`,
          `Stop overcomplicating ${cleanTitle}. The core principles are simpler than you think:`,
          `The most important question about ${cleanTitle} that rarely gets asked:`,
        ],
        fullPost: `${cleanTitle} is one of those topics where the gap between surface understanding and genuine insight is significant.\n\nMost conversations stay at the surface. Here's what actually matters:\n\n1. Start with first principles — not assumptions.\n2. Focus on what measurably changes outcomes.\n3. Build on evidence rather than convention.\n\nThe result? A clearer, more grounded approach that actually works in practice.\n\nWhat's your biggest question or challenge related to ${cleanTitle}? Drop it in the comments below.`,
      },
      twitter: {
        standalonePosts: [
          `To really understand ${cleanTitle}, focus on the principles behind the patterns — not just the surface observations.`,
          `The most overlooked aspect of ${cleanTitle}: the difference between activity and genuine progress.`,
          `Start with what you know for certain about ${cleanTitle}, then build outward from there.`,
          `Your instincts about ${cleanTitle} are worth testing. Most conventional wisdom hasn't been seriously challenged.`,
          `Depth matters in ${cleanTitle}. Surface engagement rarely leads to meaningful understanding.`,
        ],
        thread: [
          `1/5 A clear-headed look at ${cleanTitle} — the thread: 🧵`,
          `2/5 First: understand what the conversation is actually about. Most people talk past each other on ${cleanTitle} because they're starting from different assumptions.`,
          `3/5 Second: identify the real stakes. Why does ${cleanTitle} matter? Who does it affect and how?`,
          `4/5 Third: look at what actually works vs. what sounds good in theory. Evidence beats intuition.`,
          `5/5 That's the framework. If this helped you think more clearly about ${cleanTitle}, share it with someone who needs it. 🔁`,
        ],
      },
      instagram: {
        caption: `Let's talk about ${cleanTitle} — because the conversation is more important than most people realize. 💡\n\nSwipe through for the breakdown ➡️\n\nSave this for when you need it. 📌`,
        carouselSlides: [
          { slide: 1, heading: cleanTitle, body: 'A clearer, more grounded perspective' },
          { slide: 2, heading: 'The Real Question', body: `What does ${cleanTitle} actually mean in practice?` },
          { slide: 3, heading: 'What Actually Matters', body: 'Focus on evidence, not assumptions' },
          { slide: 4, heading: 'Key Takeaways', body: 'Principles you can apply immediately' },
          { slide: 5, heading: 'Your Turn', body: 'How does this change how you think about it?' },
        ],
        reelScript: `[Hook - 0:00] Here's what most people get wrong about ${cleanTitle}.\n[Body - 0:05] The real issue isn't what you think. Here are the 3 core things that actually drive outcomes.\n[CTA - 0:25] Check the link in bio for the full breakdown!`,
      },
      youtube: {
        titleOptions: [
          `${cleanTitle}: What You Need to Know`,
          `A Deeper Look at ${cleanTitle} (Complete Breakdown)`,
          `Rethinking ${cleanTitle}: Core Principles Explained`,
        ],
        hook: `In the next few minutes, we're going to cut through the noise on ${cleanTitle} and focus on what actually matters. Let's get into it.`,
        description: `A thorough breakdown of ${cleanTitle}.\n\nTimestamps:\n0:00 - Introduction\n1:20 - The Core Framework\n4:00 - What Actually Works\n7:00 - Key Takeaways and Next Steps`,
        chapters: [
          '0:00 - Introduction',
          '1:20 - The Core Framework',
          '4:00 - What Actually Works',
          '7:00 - Key Takeaways and Next Steps',
        ],
      },
      ctaVariants: [
        `Read the full breakdown on ${cleanTitle} at CreateForge AI.`,
        'Save this for your next planning session.',
        'Share this with someone thinking about the same questions.',
        'Subscribe for more high-signal content on topics that matter.',
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
