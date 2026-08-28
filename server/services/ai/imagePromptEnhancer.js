const aiOrchestrator = require('./aiOrchestrator');

/**
 * Image Prompt Enhancer Service
 * Transforms simple user ideas into rich, structured prompts optimized for FLUX generation.
 */
class ImagePromptEnhancer {
  constructor() {
    this.presetModifiers = {
      // Photography Presets
      'portrait': 'professional 85mm portrait photography, shallow depth of field, natural skin texture, soft studio lighting, high resolution',
      'architecture': 'architectural photography, tilt-shift lens, structural symmetry, clean lines, golden hour illumination, ultra-detailed',
      'automotive': 'automotive commercial photography, dynamic low-angle 3/4 view, sleek metallic reflections, dramatic rim lighting, 8k',
      'product': 'commercial product studio shot, hero lighting, clean background, sharp focus on materials and texture, 4k advertising look',
      'food': 'editorial food photography, macro close-up, appetizing steam, warm ambient side-lighting, rustic table styling',
      'landscape': 'national geographic nature photography, wide-angle 24mm lens, atmospheric depth, rich vibrant natural tones',
      
      // Creative Presets
      '3d': 'Octane Render 3D artwork, raytracing, intricate textures, volumetric lighting, subsurface scattering, masterpiece',
      'anime': 'high-end anime key visual, Makoto Shinkai aesthetic, vibrant atmospheric lighting, painterly details, clean line art',
      'cyberpunk': 'cyberpunk aesthetic, neon-lit rainy streets, holographic reflections, moody high contrast, futuristic city depth',
      'concept-art': 'epic digital concept art, matte painting, cinematic composition, storytelling atmosphere, trending on ArtStation',
      'fantasy': 'high fantasy digital illustration, magical ethereal lighting, enchanted detailing, grand scale, mystical ambience',
      
      // Marketing Presets
      'website-hero': 'modern minimalist website hero visual, clean composition with negative space, sleek design aesthetic, soft gradients',
      'social-media': 'high-engagement social media visual, vibrant eye-catching colors, bold focal point, crisp lighting',
      'poster': 'cinematic promotional poster, iconic composition, bold color grading, strong visual hierarchy, 8k quality',
    };
  }

  async enhancePrompt({
    prompt: rawPrompt,
    style = 'Realistic',
    preset = null,
    lighting = '',
    camera = '',
    mood = '',
  }) {
    if (!rawPrompt || !rawPrompt.trim()) {
      const err = new Error('Please provide a prompt to enhance.');
      err.statusCode = 400;
      throw err;
    }

    const cleanPrompt = rawPrompt.trim();

    // Check if preset adds modifiers
    const presetKey = (preset || '').toLowerCase();
    const presetModifier = this.presetModifiers[presetKey] || '';

    const systemPrompt = `You are CreateForge AI Image Prompt Director.
Your task is to take a user prompt and expand it into a visually stunning, photorealistic/stylistic prompt for FLUX image synthesis without changing the user's intended subject.

Structure components:
- Subject: Core focus and action
- Environment: Setting, background, weather, atmosphere
- Lighting: Direction, tone (e.g. golden hour, volumetric, soft neon)
- Composition & Camera: Framing, lens perspective (e.g. 50mm f/1.8, wide shot, dynamic angle)
- Materials & Texture: Specific surface details
- Style & Mood: Overall aesthetic emotion

CRITICAL: Return a JSON object with:
1. "enhancedPrompt": Single cohesive prompt paragraph (60-90 words) optimized for FLUX.
2. "breakdown": An object detailing { "subject", "environment", "lighting", "composition", "mood" }
3. "styleKeywords": Array of 4-6 style tags.`;

    const schemaDescription = `{
  "enhancedPrompt": "String",
  "breakdown": {
    "subject": "String",
    "environment": "String",
    "lighting": "String",
    "composition": "String",
    "mood": "String"
  },
  "styleKeywords": ["photorealistic", "cinematic", "8k"]
}`;

    try {
      const result = await aiOrchestrator.generateStructuredJSON({
        prompt: `User Prompt: "${cleanPrompt}"
Style: "${style}"
${presetModifier ? `Preset Influence: "${presetModifier}"` : ''}
${lighting ? `Lighting Request: "${lighting}"` : ''}
${camera ? `Camera Request: "${camera}"` : ''}
${mood ? `Mood Request: "${mood}"` : ''}`,
        systemInstruction: systemPrompt,
        schemaDescription,
      });

      let finalEnhanced = result.data.enhancedPrompt;
      if (presetModifier && !finalEnhanced.toLowerCase().includes(presetKey)) {
        finalEnhanced += `, ${presetModifier}`;
      }

      return {
        success: true,
        originalPrompt: cleanPrompt,
        enhancedPrompt: finalEnhanced,
        breakdown: result.data.breakdown || {},
        styleKeywords: result.data.styleKeywords || [style],
      };
    } catch (err) {
      console.warn(`⚠️ [PromptEnhancer] Rule-based fallback: ${err.message}`);
      // High-quality programmatic enhancement fallback
      const enhancedFallback = `${cleanPrompt}, ${style} style${presetModifier ? `, ${presetModifier}` : ''}${lighting ? `, ${lighting} lighting` : ', soft cinematic lighting'}, 8k resolution, photorealistic, intricate textures, masterpiece.`;

      return {
        success: true,
        originalPrompt: cleanPrompt,
        enhancedPrompt: enhancedFallback,
        breakdown: {
          subject: cleanPrompt,
          environment: 'Detailed cinematic atmosphere',
          lighting: lighting || 'Cinematic ambient lighting',
          composition: 'Balanced focal perspective',
          mood: mood || 'Evocative and refined',
        },
        styleKeywords: [style, 'cinematic', 'high-detail', 'FLUX'],
      };
    }
  }
}

module.exports = new ImagePromptEnhancer();
