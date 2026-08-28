const aiOrchestrator = require('./aiOrchestrator');
const BrandKit = require('../../models/BrandKit');

class MultimodalIntelligenceService {
  /**
   * IMAGE-TO-CAMPAIGN PIPELINE
   * Analyzes visual details and synthesizes an entire campaign from a single visual asset
   */
  async imageToCampaign({ imageDescription, imageUrl = '', visualKeywords = '', brandContext = null }) {
    const systemPrompt = `You are CreateForge AI's Multimodal Creative Director.
Analyze visual asset information and synthesize an entire marketing campaign around it.

You must return:
1. Deep Visual Analysis (Subject, Style, Composition, Lighting, Colors, Mood, Visual Hierarchy)
2. FLUX Reproduction Prompt (To generate cohesive companion visuals)
3. Catchy Campaign Headline
4. Product / Value Proposition Description
5. Multi-Channel Social Captions (LinkedIn, Instagram, Twitter/X)
6. High-Converting Advertisement Copy (Headline, Primary Text, CTA)
7. Brand Alignment Suggestions (Recommended color accents & tone)
8. Accessible SEO Alt-Text`;

    const userPrompt = `Visual Asset Description / Analysis:
"${imageDescription}"
${visualKeywords ? `Keywords: ${visualKeywords}` : ''}
${brandContext ? `Brand Context: ${JSON.stringify(brandContext)}` : ''}

Generate the complete campaign based on this visual asset.`;

    const schemaDescription = `{
  "visualAnalysis": {
    "subject": "Detailed subject breakdown",
    "style": "Visual style classification",
    "composition": "Framing and focal hierarchy",
    "lighting": "Lighting setup and color temperature",
    "colors": ["#hex1", "#hex2", "#hex3", "#hex4"],
    "mood": "Emotional and aesthetic tone"
  },
  "fluxReproductionPrompt": "Ultra-detailed FLUX prompt to reproduce or create sister visuals in this exact style",
  "headline": "High-impact campaign headline",
  "productDescription": "Compelling 2-3 paragraph product narrative inspired by the visual",
  "socialCaptions": {
    "linkedin": "Thought leadership caption with context and hashtags",
    "instagram": "Aesthetic, engaging caption with hook and emojis",
    "twitter": "Punchy 280-char announcement tweet"
  },
  "adCopy": {
    "headline": "Punchy Ad Headline",
    "primaryText": "Persuasive benefit-driven ad copy",
    "cta": "Get Started Today"
  },
  "brandSuggestions": {
    "voiceAlignment": "How to align copy tone with the visual vibe",
    "paletteMatches": ["#1E1B4B", "#6366F1", "#A855F7"]
  },
  "seoAltText": "Accurate, descriptive and keyword-rich alt text for accessibility and search indexing"
}`;

    const fallbackAnalysis = {
      visualAnalysis: {
        subject: 'Core subject visual breakdown',
        style: 'Modern Studio Photography',
        composition: 'Centered with clean visual hierarchy',
        lighting: 'High-contrast studio lighting',
        colors: ['#1E1B4B', '#6366F1', '#EC4899'],
        mood: 'Professional and visionary',
      },
      fluxReproductionPrompt: `Cinematic high-detail editorial photograph inspired by ${imageDescription || 'modern design'}, 8k resolution.`,
      headline: `The New Standard in Creative Intelligence`,
      productDescription: `Designed for modern teams who demand excellence, precision, and speed.`,
      socialCaptions: {
        linkedin: `Visual storytelling is evolving. Here is how modern creators craft cohesive brand identity.`,
        instagram: `Aesthetics meet functionality. Discover our latest campaign visual. 🚀`,
        twitter: `Design with purpose. Build with clarity. ⚡`,
      },
      adCopy: {
        headline: `Transform Your Workflow`,
        primaryText: `Accelerate your creative pipeline 10x with intelligent design tools.`,
        cta: `Get Started Now`,
      },
      brandSuggestions: {
        voiceAlignment: 'Confident, forward-looking, and polished',
        paletteMatches: ['#1E1B4B', '#6366F1', '#A855F7'],
      },
      seoAltText: `High-resolution studio asset representing modern creative workflows`,
    };

    const result = await aiOrchestrator.generateStructuredJSON({
      prompt: userPrompt,
      systemInstruction: systemPrompt,
      schemaDescription,
      fallback: fallbackAnalysis,
    });

    return result.data;
  }

  /**
   * ARTICLE-TO-VISUAL PLANNER
   * Reads an article and creates a synchronized visual storyboard plan with FLUX prompts
   */
  async articleToVisual({ articleTitle, articleContent, visualStyle = 'Cinematic High-Tech Studio', brandColors = [] }) {
    const systemPrompt = `You are CreateForge AI's Visual Content Director.
Read the article and engineer a synchronized Visual Plan:
- 1 Campaign Hero Visual (16:9)
- 3 Section-Specific Editorial Visuals (16:9 / 4:3)
- 1 Infographic / Diagram Concept Prompt (1:1)
- 1 Social Highlight Visual (4:5)`;

    const userPrompt = `Article Title: "${articleTitle}"
Visual Style Preferred: ${visualStyle}
${brandColors.length ? `Brand Colors: ${brandColors.join(', ')}` : ''}

Article Excerpt / Full Text:
${articleContent.slice(0, 4000)}

Synthesize the visual plan.`;

    const schemaDescription = `{
  "heroVisual": {
    "label": "Hero Image",
    "concept": "Core overarching metaphor",
    "prompt": "Detailed FLUX prompt for article hero header",
    "aspectRatio": "16:9"
  },
  "sectionVisuals": [
    {
      "sectionTitle": "Section 1 heading",
      "concept": "Visual metaphor for section 1",
      "prompt": "Detailed FLUX prompt for section 1",
      "aspectRatio": "16:9"
    },
    {
      "sectionTitle": "Section 2 heading",
      "concept": "Visual metaphor for section 2",
      "prompt": "Detailed FLUX prompt for section 2",
      "aspectRatio": "16:9"
    },
    {
      "sectionTitle": "Section 3 heading",
      "concept": "Visual metaphor for section 3",
      "prompt": "Detailed FLUX prompt for section 3",
      "aspectRatio": "16:9"
    }
  ],
  "infographicVisual": {
    "concept": "Data visualization / workflow concept",
    "prompt": "Detailed FLUX prompt for 3D diagram or visual chart",
    "aspectRatio": "1:1"
  },
  "socialVisual": {
    "concept": "Attention-grabbing feed image",
    "prompt": "Detailed FLUX prompt for social preview",
    "aspectRatio": "4:5"
  }
}`;

    const fallbackVisualPlan = {
      heroVisual: {
        label: 'Hero Image',
        concept: `Visual metaphor for ${articleTitle}`,
        prompt: `Cinematic editorial photograph representing ${articleTitle}, modern workspace, dramatic lighting, 8k resolution.`,
        aspectRatio: '16:9',
      },
      sectionVisuals: [
        {
          sectionTitle: 'Core Strategy',
          concept: 'Strategy and execution blueprint',
          prompt: `Minimalist 3D render of interconnected glowing geometric nodes, indigo and purple accents, high clarity.`,
          aspectRatio: '16:9',
        },
      ],
      infographicVisual: {
        concept: 'Step-by-step workflow architecture',
        prompt: 'Isometric 3D diagram showing seamless digital pipeline, glassmorphism elements, clean studio background.',
        aspectRatio: '1:1',
      },
      socialVisual: {
        concept: 'High-contrast headline thumbnail',
        prompt: `Striking typography-focused graphic visual for ${articleTitle}, vibrant gradient accents, clean dark theme.`,
        aspectRatio: '4:5',
      },
    };

    const result = await aiOrchestrator.generateStructuredJSON({
      prompt: userPrompt,
      systemInstruction: systemPrompt,
      schemaDescription,
      fallback: fallbackVisualPlan,
    });

    return result.data;
  }

  /**
   * ARTICLE-TO-VIDEO BLUEPRINT (PRODUCTION STORYBOARD)
   */
  async articleToVideoBlueprint({ articleTitle, articleContent, videoFormat = 'Short-Form (60s)' }) {
    const systemPrompt = `You are CreateForge AI's Video Production Director & Storyboard Architect.
Convert written content into a production-ready video blueprint and scene-by-scene storyboard.

Include:
- Viral Hook (First 3 seconds)
- Scene-by-Scene Breakdown (Scene #, Timecode, Visual Direction, Voiceover Script, On-Screen Text, B-Roll Suggestion)
- Call To Action (Ending sequence)
- YouTube / Social Title, Description, and Thumbnail Image Generation Prompt`;

    const userPrompt = `Article Title: "${articleTitle}"
Video Format: ${videoFormat}
Article Content:
${articleContent.slice(0, 3500)}

Generate the complete production storyboard.`;

    const schemaDescription = `{
  "title": "High-CTR Video Title",
  "description": "Engaging video description with chapters & hashtags",
  "hook": {
    "duration": "0:00 - 0:03",
    "voiceover": "Provocative opening line",
    "visualDirection": "Fast dynamic camera zoom on central subject",
    "onScreenText": "BOLD HOOK TEXT"
  },
  "scenes": [
    {
      "sceneNumber": 1,
      "timecode": "0:03 - 0:15",
      "voiceover": "Voiceover audio text for scene 1",
      "visualDirection": "Visual framing & action instructions",
      "onScreenText": "Key takeaway text overlay",
      "bRollSuggestions": "Specific B-roll clip search keywords"
    },
    {
      "sceneNumber": 2,
      "timecode": "0:15 - 0:35",
      "voiceover": "Voiceover audio text for scene 2",
      "visualDirection": "Visual framing & action instructions",
      "onScreenText": "Key takeaway text overlay",
      "bRollSuggestions": "Specific B-roll clip search keywords"
    },
    {
      "sceneNumber": 3,
      "timecode": "0:35 - 0:50",
      "voiceover": "Voiceover audio text for scene 3",
      "visualDirection": "Visual framing & action instructions",
      "onScreenText": "Key takeaway text overlay",
      "bRollSuggestions": "Specific B-roll clip search keywords"
    }
  ],
  "cta": {
    "duration": "0:50 - 1:00",
    "voiceover": "Closing strong action call",
    "visualDirection": "End screen animation with link and logo",
    "onScreenText": "TRY FOR FREE - LINK IN BIO"
  },
  "thumbnailPrompt": "Ultra-detailed FLUX prompt for YouTube / TikTok high-CTR thumbnail visual"
}`;

    const fallbackVideoBlueprint = {
      title: `How to Master ${articleTitle}`,
      description: `Complete breakdown of ${articleTitle}.\n\nTimestamps:\n0:00 - Hook\n0:15 - Core Breakdown\n0:45 - Key Takeaway`,
      hook: {
        duration: '0:00 - 0:03',
        voiceover: `Stop struggling with ${articleTitle}. Here is what you need to know.`,
        visualDirection: 'Dynamic zoom in on high-contrast workstation scene.',
        onScreenText: 'THE REAL SECRET',
      },
      scenes: [
        {
          sceneNumber: 1,
          timecode: '0:03 - 0:20',
          voiceover: 'Most creators overcomplicate their workflows instead of building focused systems.',
          visualDirection: 'Overhead view of creator mapping out creative strategies.',
          onScreenText: 'SIMPLIFY YOUR PROCESS',
          bRollSuggestions: 'creative workflow, modern studio, focus',
        },
      ],
      cta: {
        duration: '0:50 - 1:00',
        voiceover: 'Explore the full guide at CreateForge AI. Link in description!',
        visualDirection: 'Clean animated end-screen with product CTA.',
        onScreenText: 'START CREATING TODAY',
      },
      thumbnailPrompt: `Eye-catching YouTube thumbnail for ${articleTitle}, high contrast, bold expression, modern gradient lighting.`,
    };

    const result = await aiOrchestrator.generateStructuredJSON({
      prompt: userPrompt,
      systemInstruction: systemPrompt,
      schemaDescription,
      fallback: fallbackVideoBlueprint,
    });

    return result.data;
  }

  /**
   * AI PRESENTATION BUILDER
   */
  async generatePresentation({ topic, context = '', targetSlides = 6 }) {
    const systemPrompt = `You are CreateForge AI's Executive Presentation Designer.
Synthesize a slide deck outline with crisp slide copy, speaker notes, and image generation prompts.`;

    const userPrompt = `Topic / Goal: "${topic}"
Additional Context / Source Content:
${context ? context.slice(0, 3000) : 'N/A'}
Number of Slides: ${targetSlides}

Generate the complete presentation outline.`;

    const schemaDescription = `{
  "deckTitle": "Presentation Deck Title",
  "subtitle": "Subtitle / Tagline",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Title Slide Heading",
      "bullets": ["Key bullet 1", "Key bullet 2"],
      "speakerNotes": "What the presenter should say for this slide",
      "visualSuggestion": "Recommended slide layout or graphic type",
      "imagePrompt": "FLUX prompt to generate a slide illustration or background"
    },
    {
      "slideNumber": 2,
      "title": "Problem Statement",
      "bullets": ["Pain point 1", "Pain point 2", "Market friction 3"],
      "speakerNotes": "Contextual narrative on the core challenge",
      "visualSuggestion": "Split layout with contrast",
      "imagePrompt": "FLUX prompt for visual"
    }
  ],
  "concludingCta": "Final next steps / action call for the audience"
}`;

    const fallbackDeck = {
      deckTitle: `${topic} Executive Briefing`,
      subtitle: 'Strategic Overview & Execution Roadmap',
      slides: [
        {
          slideNumber: 1,
          title: `Executive Overview: ${topic}`,
          bullets: ['Market context and core opportunity', 'Strategic execution framework', 'Key performance milestones'],
          speakerNotes: 'Welcome everyone. Today we are exploring our strategic roadmap and execution plan.',
          visualSuggestion: 'Minimalist hero slide with dark purple accents',
          imagePrompt: `Cinematic 3D presentation slide visual for ${topic}, elegant glassmorphic geometric shapes, studio lighting.`,
        },
      ],
      concludingCta: 'Next Steps: Implementation Kickoff & Milestones',
    };

    const result = await aiOrchestrator.generateStructuredJSON({
      prompt: userPrompt,
      systemInstruction: systemPrompt,
      schemaDescription,
      fallback: fallbackDeck,
    });

    return result.data;
  }
  /**
   * INGEST DOCUMENT (PDF, DOCX, TXT)
   * Extracts text, extracts key takeaways, audience, topic, and recommends next creative outputs
   */
  async ingestDocument({ fileName = 'Uploaded Document', fileType = 'txt', textContent = '', rawBuffer = null }) {
    let cleanText = textContent || '';
    if (rawBuffer && !cleanText) {
      cleanText = rawBuffer.toString('utf-8').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
    }

    cleanText = cleanText.slice(0, 8000).trim();
    if (!cleanText) {
      cleanText = 'Sample source content extracted from document for creative generation.';
    }

    const systemPrompt = `You are CreateForge AI's Source Ingestion & Content Intelligence Engine.
Analyze the provided document source text and extract:
1. Core Topic
2. Target Audience
3. Creator Intent (e.g. Educational, Promotional, Thought Leadership, Technical)
4. Executive Summary (2-3 paragraphs)
5. 5-7 Key Takeaways / Points
6. Suggested Title Ideas
7. Recommended Output Channels (Article, Titles, Image, Social, SEO)`;

    const userPrompt = `Document: "${fileName}" (${fileType})
Source Text:
"""
${cleanText}
"""

Analyze and structure this document source for creative content generation.`;

    const schemaDescription = `{
  "topic": "Concise primary topic",
  "audience": "Target reader persona",
  "intent": "Educational / Commercial / Thought Leadership / Technical",
  "summary": "2-3 paragraph executive summary of the document",
  "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
  "suggestedTitles": ["Title 1", "Title 2", "Title 3"],
  "recommendedOutputs": ["article", "titles", "image", "social", "seo"],
  "cleanWordCount": 120
}`;

    const fallbackDoc = {
      topic: fileName.replace(/\.[^/.]+$/, ''),
      audience: 'General Professional Audience',
      intent: 'Educational & Informative',
      summary: cleanText.slice(0, 400) + '...',
      keyPoints: [
        'Comprehensive overview of core concepts and best practices.',
        'Actionable strategies for implementation and optimization.',
        'Key insights into industry trends and workflows.',
      ],
      suggestedTitles: [
        `Comprehensive Guide: ${fileName.replace(/\.[^/.]+$/, '')}`,
        `Key Insights & Takeaways from ${fileName.replace(/\.[^/.]+$/, '')}`,
      ],
      recommendedOutputs: ['article', 'titles', 'social', 'seo'],
      cleanWordCount: cleanText.split(/\s+/).length,
    };

    const result = await aiOrchestrator.generateStructuredJSON({
      prompt: userPrompt,
      systemInstruction: systemPrompt,
      schemaDescription,
      fallback: fallbackDoc,
    });

    return {
      fileName,
      fileType,
      cleanText,
      analysis: result.data,
    };
  }

  /**
   * INGEST AUDIO TRANSCRIPTION
   * Converts speech transcript into structured summary, key points, and creative generation prompts
   */
  async ingestAudio({ audioTranscript = '', fileName = 'Audio Recording', durationSeconds = 0 }) {
    const cleanTranscript = (audioTranscript || '').slice(0, 8000).trim();

    const systemPrompt = `You are CreateForge AI's Audio Intelligence Engine.
Analyze speech audio transcripts and turn raw spoken ideas into polished creative assets.`;

    const userPrompt = `Audio File: "${fileName}"
Transcript:
"""
${cleanTranscript || 'Spoken brainstorm recording discussing new product ideas and strategic milestones.'}
"""

Extract topic, summary, speaker key points, quotes, and content ideas for Article, Titles, and Social media.`;

    const schemaDescription = `{
  "topic": "Core topic discussed in the audio",
  "audience": "Target audience for this topic",
  "intent": "Educational / Conversational / Strategic",
  "summary": "Polished executive summary of the spoken audio",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "memorableQuotes": ["Notable quote or statement"],
  "creativeHooks": {
    "articleHook": "Suggested angle for a full article",
    "socialHook": "Suggested LinkedIn / X hook post",
    "titleHook": "Suggested catchy headline"
  }
}`;

    const fallbackAudio = {
      topic: 'Audio Brainstorm & Key Insights',
      audience: 'Creators & Professionals',
      intent: 'Conversational & Strategic',
      summary: cleanTranscript.slice(0, 300) || 'Audio recording insights and strategic concepts.',
      keyPoints: [
        'Primary concept explored during discussion.',
        'Practical execution considerations and challenges.',
        'Next steps and recommended actions.',
      ],
      memorableQuotes: ['"Turning ideas into production-ready execution."'],
      creativeHooks: {
        articleHook: 'How to turn verbal brainstorms into published content.',
        socialHook: 'Just recorded a deep dive into our creative workflow. Here are the 3 big takeaways: 🧵👇',
        titleHook: 'Key Lessons from Our Latest Brainstorm Session',
      },
    };

    const result = await aiOrchestrator.generateStructuredJSON({
      prompt: userPrompt,
      systemInstruction: systemPrompt,
      schemaDescription,
      fallback: fallbackAudio,
    });

    return {
      fileName,
      transcript: cleanTranscript,
      analysis: result.data,
    };
  }

  /**
   * ANALYZE IMAGE TO FLUX PROMPT
   * Extracts visual elements and crafts an optimized FLUX generation prompt
   */
  async analyzeImageVisualPrompt({ imageDescription = '', detectedSubject = '', visualStyle = '' }) {
    const systemPrompt = `You are CreateForge AI's FLUX Visual Prompt Architect.
Convert image descriptions into masterfully detailed prompts for FLUX.
Include: Subject, Environment, Lighting, Composition, Camera/Lens, Materials, Mood, Perspective, and Color Palette.`;

    const userPrompt = `Input Visual Context: "${imageDescription || detectedSubject || 'Modern studio creative setup'}"
Style Direction: "${visualStyle || 'Cinematic Professional'}"

Generate a FLUX-optimized photography/visual prompt and companion metadata.`;

    const schemaDescription = `{
  "subject": "Core visual subject with fine details",
  "environment": "Setting and background ambiance",
  "lighting": "Volumetric / Studio / Golden Hour / Softbox lighting",
  "composition": "Rule of thirds / Centered / Wide-angle framing",
  "camera": "Hasselblad 80mm lens / 35mm film / Sony Alpha A7R V",
  "materials": "Textures, surfaces, reflections",
  "mood": "Emotional and aesthetic tone",
  "perspective": "Eye-level / Low angle / Bird's eye",
  "colorPalette": ["#1E1B4B", "#6366F1", "#EC4899"],
  "enhancedFluxPrompt": "Complete, seamless FLUX prompt combining all elements into photographic perfection",
  "qualityScoreEstimate": 92
}`;

    const fallbackPrompt = {
      subject: imageDescription || 'Modern technology workstation with glowing ambient lights',
      environment: 'Contemporary minimalist creative studio',
      lighting: 'Cinematic rim lighting with soft ambient lavender glow',
      composition: 'Balanced medium close-up shot with shallow depth of field',
      camera: 'Shot on 85mm f/1.4 lens, 8k resolution, photorealistic',
      materials: 'Brushed aluminum, matte obsidian glass, warm walnut wood',
      mood: 'Focused, visionary, and premium',
      perspective: 'Slight low-angle perspective',
      colorPalette: ['#0F172A', '#6366F1', '#EC4899', '#38BDF8'],
      enhancedFluxPrompt: `A cinematic masterpiece photograph of ${imageDescription || 'a modern creative workspace'}, featuring brushed metal surfaces, soft ambient purple-indigo studio lighting, shot on Hasselblad 80mm lens, ultra-detailed, photorealistic, 8k.`,
      qualityScoreEstimate: 90,
    };

    const result = await aiOrchestrator.generateStructuredJSON({
      prompt: userPrompt,
      systemInstruction: systemPrompt,
      schemaDescription,
      fallback: fallbackPrompt,
    });

    return result.data;
  }
}

module.exports = new MultimodalIntelligenceService();
