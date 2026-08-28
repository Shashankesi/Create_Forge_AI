const aiOrchestrator = require('./aiOrchestrator');
const Moodboard = require('../../models/Moodboard');
const Project = require('../../models/Project');

class CreativeDirectionService {
  /**
   * Synthesize full creative direction & moodboard theme for a project
   */
  async generateCreativeDirection({ projectContext, brandContext, goal }) {
    const systemPrompt = `You are CreateForge AI's Chief Creative Officer and Visual Director.
Analyze the project goals, audience, and brand to formulate an extraordinary, premium Creative Direction.

Output must include:
1. Color Palette (5 curated colors with hex, name, and role: Background, Primary Accent, Secondary Accent, Surface, Text)
2. Typography Direction (Heading font recommendation, Body font recommendation, and stylistic vibes)
3. Photography Style (Lighting, depth of field, color grading, shot composition)
4. Lighting Direction (Key light, rim light, atmosphere, shadows)
5. Composition Principles (Focal points, aspect ratios, negative space)
6. Graphic Style & 3D Direction (Textures, glassmorphism, isometric or hyper-realistic elements)
7. Curated Visual Keywords (8-10 high-precision aesthetic descriptors for FLUX prompts)
8. Sample Visual Prompts (3 ready-to-run FLUX prompts matching this exact direction)`;

    const userPrompt = `Project Context: ${projectContext ? JSON.stringify(projectContext) : 'Modern AI Creative Workspace launch'}
Brand Context: ${brandContext ? JSON.stringify(brandContext) : 'Dark mode, high-end electric indigo and purple glassmorphism'}
Goal: ${goal || 'Establish a signature high-tech creative visual identity'}`;

    const schemaDescription = `{
  "theme": {
    "mood": "Atmospheric, cinematic, and forward-looking",
    "colorPalette": [
      { "hex": "#0F172A", "name": "Deep Midnight Slate", "role": "Base Background" },
      { "hex": "#6366F1", "name": "Electric Indigo", "role": "Primary Glow" },
      { "hex": "#A855F7", "name": "Cosmic Violet", "role": "Secondary Accent" },
      { "hex": "#38BDF8", "name": "Cyber Cyan", "role": "Highlight" },
      { "hex": "#F8FAFC", "name": "Pure Starlight", "role": "High-Contrast Text" }
    ],
    "typography": {
      "heading": "Outfit / Plus Jakarta Sans",
      "body": "Inter",
      "vibes": "Clean, authoritative, ultra-modern tech"
    },
    "photographyStyle": "Cinematic volumetric studio lighting, 8k resolution, crisp focus, Hasselblad color science",
    "lighting": "Soft iridescent rim lighting with subtle cyan and purple atmospheric haze",
    "composition": "Golden ratio, generous negative space, dynamic perspective",
    "graphicStyle": "Frosted glassmorphism, subtle glowing laser grids, sleek holographic accents",
    "illustrationStyle": "3D photorealistic render with translucent resin and metallic textures",
    "threedDirection": "Floating refractive crystal shards with radiant fiber-optic filaments"
  },
  "visualKeywords": ["cinematic lighting", "photorealistic 8k", "glassmorphism", "iridescent glow", "holographic", "cybernetic precision", "hyper-detailed", "volumetric atmosphere"],
  "samplePrompts": [
    { "title": "Hero Visual", "prompt": "A floating iridescent AI core with glowing indigo circuitry inside frosted dark glass prism, cinematic volumetric lighting, 8k render, octane render, masterpiece" },
    { "title": "Feature Concept", "prompt": "Futuristic creator workspace with holographic interface projections floating over a minimalist matte dark desk, neon violet accents, ultra-sharp" }
  ]
}`;

    const result = await aiOrchestrator.generateStructuredJSON({
      prompt: userPrompt,
      systemInstruction: systemPrompt,
      schemaDescription,
    });

    return result.data;
  }

  /**
   * Generate FLUX Visual Prompt matching an active Moodboard's cards and color palette
   */
  async generateVisualMatchingMoodboard({ moodboardId, userId, promptIntent = '' }) {
    const moodboard = await Moodboard.findOne({ _id: moodboardId, userId });
    if (!moodboard) throw new Error('Moodboard not found');

    const preferredCards = moodboard.cards.filter((c) => c.isPreferred);
    const colors = moodboard.theme?.colorPalette?.map((c) => `${c.name} (${c.hex})`).join(', ') || '';
    const keywords = moodboard.cards
      .filter((c) => c.type === 'keyword')
      .map((c) => c.content)
      .join(', ');

    const systemPrompt = `You are CreateForge AI's Visual Prompt Engineer.
Create a rich, state-of-the-art FLUX image prompt that perfectly encapsulates the moodboard's colors, lighting, composition, and preferred styles.`;

    const userPrompt = `User Intent: "${promptIntent || 'Campaign hero visual matching moodboard'}"
Mood: ${moodboard.theme?.mood}
Color Palette: ${colors}
Lighting: ${moodboard.theme?.lighting}
Composition: ${moodboard.theme?.composition}
Photography Style: ${moodboard.theme?.photographyStyle}
Keywords: ${keywords}
Preferred Reference Notes: ${preferredCards.map((c) => c.content).join(' | ')}

Synthesize a single, ultra-detailed FLUX generation prompt.`;

    const response = await aiOrchestrator.generateText({
      prompt: userPrompt,
      systemInstruction: systemPrompt,
    });

    return {
      prompt: response.content.replace(/^["']|["']$/g, '').trim(),
      moodboardTitle: moodboard.title,
      suggestedAspectRatio: '16:9',
    };
  }
}

module.exports = new CreativeDirectionService();
