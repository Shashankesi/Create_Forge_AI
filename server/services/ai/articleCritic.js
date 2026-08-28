const aiOrchestrator = require('./aiOrchestrator');

/**
 * Article Critic Service
 * Analyzes generated or edited articles and provides objective, structured quality evaluations.
 */
class ArticleCritic {
  async evaluateArticle({ title, content, topic, targetAudience = 'General', purpose = 'Educational' }) {
    const prompt = `Evaluate this article thoroughly and provide an objective scoring breakdown.

Article Title: "${title}"
Intended Topic: "${topic}"
Target Audience: "${targetAudience}"
Purpose: "${purpose}"

Content to evaluate:
${content.substring(0, 5000)}

Please analyze and return a JSON object with:
1. "overallScore": Integer between 60 and 99
2. "clarity": Integer between 60 and 99 (Clarity of arguments, language precision)
3. "structure": Integer between 60 and 99 (Logical progression, heading flow, intro/conclusion)
4. "depth": Integer between 60 and 99 (Thoroughness, substance, insights)
5. "readability": Integer between 60 and 99 (Sentence rhythm, engagement, accessibility)
6. "seo": Integer between 60 and 99 (Header relevance, semantic term coverage)
7. "specificity": Integer between 60 and 99 (Concrete examples, domain accuracy vs fluff)
8. "strengths": Array of 2-3 key strengths
9. "weaknesses": Array of 2-3 specific areas that need refinement
10. "refinementPlan": A short instruction on how to polish weak spots`;

    const schemaDescription = `{
  "overallScore": 92,
  "clarity": 94,
  "structure": 95,
  "depth": 90,
  "readability": 93,
  "seo": 91,
  "specificity": 88,
  "strengths": ["Clear introduction", "Actionable takeaways"],
  "weaknesses": ["Section 3 could use concrete statistics or examples"],
  "refinementPlan": "Enrich section 3 with specific real-world examples and tighten closing thoughts."
}`;

    try {
      const response = await aiOrchestrator.generateStructuredJSON({
        prompt,
        systemInstruction: 'You are CreateForge AI Quality Evaluator, a rigorous editorial critic.',
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

      return {
        overallScore: baseScore,
        clarity: Math.min(96, baseScore + 2),
        structure: Math.min(98, baseScore + 3),
        depth: Math.min(94, baseScore - 1),
        readability: Math.min(95, baseScore + 1),
        seo: Math.min(92, baseScore),
        specificity: Math.min(90, baseScore - 2),
        strengths: ['Well-structured outline', 'Clear tone and flow'],
        weaknesses: ['Can be further personalized with domain-specific case studies'],
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
