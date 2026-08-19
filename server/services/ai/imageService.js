const imageGenerationService = require('../imageGenerationService');
const promptUnderstandingService = require('./promptUnderstandingService');

/**
 * Image Service for CreateForge AI
 * Bridges AI routes and article cover generation to the dedicated Pollinations FLUX engine.
 */
class ImageService {
  /**
   * Generates real AI visuals using the dedicated Pollinations FLUX service
   */
  async generateImage(params) {
    return await imageGenerationService.generateImage({
      prompt: params.prompt,
      style: params.style,
      aspectRatio: params.aspectRatio,
      advancedOptions: {
        additionalInstructions: params.additionalInstructions,
        seed: params.seed,
        negativePrompt: params.negativePrompt,
        lighting: params.lighting,
        composition: params.composition,
        quality: params.quality,
        ...(params.advancedOptions || {}),
      },
    });
  }

  /**
   * Synthesize a cover image prompt from an article's title, topic, and summary
   */
  async generateArticleCoverImage({ title, topic, summary, style = 'Cinematic' }) {
    const normalizedTopic = promptUnderstandingService.normalize(topic || title).normalizedTopic;

    let visualDescription = `A cinematic editorial magazine hero visual representing ${normalizedTopic}. Professional composition capturing the essence of ${title}. High visual fidelity, evocative lighting, artistic atmosphere, no readable text, no watermark, no logos`;

    if (summary) {
      visualDescription += `. Theme context: ${summary.substring(0, 140)}`;
    }

    return await imageGenerationService.generateImage({
      prompt: visualDescription,
      style,
      aspectRatio: '16:9',
      advancedOptions: {
        additionalInstructions: 'Editorial hero banner, wide landscape composition, magazine quality',
      },
    });
  }
}

module.exports = new ImageService();
