const aiOrchestrator = require('./aiOrchestrator');

/**
 * Article Refiner Service
 * Takes a draft article and critic weaknesses/plan, polishing the content into a high-tier final result.
 */
class ArticleRefiner {
  async refineArticle({ title, draftContent, weaknesses = [], refinementPlan = '', tone = 'Professional' }) {
    if (!draftContent || draftContent.trim().length === 0) {
      return draftContent;
    }

    const prompt = `Refine and polish this draft article based on editorial feedback.

Article Title: "${title}"
Tone: "${tone}"

Feedback to Address:
Weaknesses Identified: ${weaknesses.join('; ')}
Refinement Plan: ${refinementPlan}

Draft Content:
${draftContent}

CRITICAL EDITORIAL GUIDELINES:
1. Eliminate any cliché openings like "In today's fast-paced world..." or "Whether you're a beginner or expert...". Start directly with substance.
2. Tighten phrasing, eliminate fluff, and enhance clarity and depth.
3. Keep the Markdown formatting (headings, bullet points, code or quotes if applicable).
4. Preserve the overall length and core substance while significantly elevating prose quality.
5. Respond ONLY with the refined article Markdown (no preamble, no conversational intro).`;

    try {
      const result = await aiOrchestrator.generateText({
        prompt,
        systemInstruction: 'You are CreateForge AI Lead Editor, an elite content refiner.',
        temperature: 0.5,
      });

      let refined = result.content.trim();
      // Strip any accidental markdown wrap
      if (refined.startsWith('```markdown')) {
        refined = refined.replace(/^```markdown\s*/i, '').replace(/\s*```$/, '');
      } else if (refined.startsWith('```')) {
        refined = refined.replace(/^```\s*/i, '').replace(/\s*```$/, '');
      }

      return refined;
    } catch (err) {
      console.warn(`⚠️ [ArticleRefiner] Refinement skipped (${err.message}). Returning original draft.`);
      return draftContent;
    }
  }
}

module.exports = new ArticleRefiner();
