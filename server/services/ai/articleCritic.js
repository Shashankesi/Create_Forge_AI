const aiOrchestrator = require('./aiOrchestrator');

/**
 * Article Critic Service 2.0
 * Evaluates generated or edited articles with strict semantic relevance,
 * topic alignment, factual groundedness, and entity hallucination checks.
 */
class ArticleCritic {
  async evaluateArticle({ title, content, topic, targetAudience = 'General', purpose = 'Educational' }) {
    const prompt = `Evaluate this article thoroughly and provide an objective scoring breakdown with strict focus on semantic topic alignment.

Article Title: "${title}"
Intended Topic: "${topic}"
Target Audience: "${targetAudience}"
Purpose: "${purpose}"

Content to evaluate (first 5000 chars):
${content.substring(0, 5000)}

EVALUATION CRITERIA:
1. Topic Relevance: Does the article strictly discuss "${topic}" without drifting to unrelated topics (like AI, SaaS, or software architecture when not requested)?
2. Factual Groundedness: Are claims realistic without fabricated organizations (e.g. "Arctile") or fake customer surveys?
3. Clarity, Structure, Depth, Readability, Specificity, and Audience Fit.

Return a JSON object with:
1. "topicRelevance": Integer between 0 and 100 (100 = perfectly focused on "${topic}")
2. "factualGroundedness": Integer between 0 and 100 (100 = zero fabricated entities or fake statistics)
3. "clarity": Integer between 60 and 99
4. "structure": Integer between 60 and 99
5. "depth": Integer between 60 and 99
6. "readability": Integer between 60 and 99
7. "specificity": Integer between 60 and 99
8. "seo": Integer between 60 and 99
9. "overallScore": Integer between 60 and 99
10. "isTopicAligned": Boolean (true if strictly about "${topic}", false if contaminated or drifted)
11. "detectedHallucinations": Array of strings (e.g. ["Arctile", "unrelated tech jargon"] or empty [])
12. "strengths": Array of 2-3 key strengths
13. "weaknesses": Array of 2-3 specific areas that need refinement
14. "refinementPlan": A short instruction on how to polish weak spots`;

    const schemaDescription = `{
  "topicRelevance": 95,
  "factualGroundedness": 95,
  "clarity": 94,
  "structure": 95,
  "depth": 90,
  "readability": 93,
  "specificity": 88,
  "seo": 91,
  "overallScore": 92,
  "isTopicAligned": true,
  "detectedHallucinations": [],
  "strengths": ["Directly addresses the subject", "Actionable takeaways"],
  "weaknesses": ["Could expand on practical steps"],
  "refinementPlan": "Refine examples to be even more concrete."
}`;

    try {
      const response = await aiOrchestrator.generateStructuredJSON({
        prompt,
        systemInstruction: 'You are CreateForge AI Quality Evaluator, a rigorous editorial critic with strict topic grounding standards.',
        schemaDescription,
      });

      return {
        ...response.data,
        metadata: {
          criticProvider: response.provider,
          criticModel: response.model,
          evaluatedAt: new Date().toISOString(),
        },
      };
    } catch (err) {
      console.warn(`⚠️ [ArticleCritic] Evaluation fallback due to: ${err.message}`);
      // Deterministic heuristic fallback if AI critic call fails
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const headingCount = (content.match(/^#{1,4}\s/gm) || []).length;
      const baseScore = Math.min(94, Math.max(78, 80 + Math.floor(wordCount / 150) + headingCount * 2));

      // Check topic keyword presence
      const topicWords = (topic || '').toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const contentLower = content.toLowerCase();
      const matchedWords = topicWords.filter((w) => contentLower.includes(w));
      const topicRelevance = topicWords.length === 0 ? 95 : Math.round((matchedWords.length / topicWords.length) * 100);

      // Check for hallucinated entities
      const hasHallucinatedEntity = /\b(arctile|our community has reported|we observed)\b/i.test(content);

      return {
        topicRelevance: hasHallucinatedEntity ? 45 : Math.max(70, topicRelevance),
        factualGroundedness: hasHallucinatedEntity ? 50 : 92,
        clarity: Math.min(96, baseScore + 2),
        structure: Math.min(98, baseScore + 3),
        depth: Math.min(94, baseScore - 1),
        readability: Math.min(95, baseScore + 1),
        seo: Math.min(92, baseScore),
        specificity: Math.min(90, baseScore - 2),
        overallScore: baseScore,
        isTopicAligned: !hasHallucinatedEntity && (topicRelevance >= 50 || topicWords.length === 0),
        detectedHallucinations: hasHallucinatedEntity ? ['Arctile / Fabricated Authority'] : [],
        strengths: ['Well-structured outline', 'Direct focus on core theme'],
        weaknesses: ['Can include additional real-world scenarios'],
        refinementPlan: 'Continue developing detailed examples in subsections.',
        metadata: {
          criticProvider: 'heuristic-engine',
          evaluatedAt: new Date().toISOString(),
        },
      };
    }
  }
}

module.exports = new ArticleCritic();
