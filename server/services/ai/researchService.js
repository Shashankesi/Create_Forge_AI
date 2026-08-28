const aiOrchestrator = require('./aiOrchestrator');

/**
 * Research Studio Intelligence Engine
 * Performs deep topic analysis, search intent mapping, questions people ask, and content gaps.
 */
class ResearchService {
  async conductResearch({ topic, targetAudience = 'General Audience', industry = 'General' }) {
    const prompt = `You are the lead intelligence researcher for CreateForge AI Studio.
Analyze the following topic thoroughly for content strategy and execution:

Topic: "${topic}"
Target Audience: "${targetAudience}"
Industry / Domain: "${industry}"

Provide a structured, deep-dive research intelligence dossier.
Respond strictly in valid JSON format matching this schema:
{
  "topic": "${topic}",
  "searchIntent": "Informational / Commercial / Navigational",
  "keyPoints": [
    "Crucial insight or factual foundation 1",
    "Crucial insight 2",
    "Crucial insight 3",
    "Crucial insight 4"
  ],
  "questionsPeopleAsk": [
    "Direct question real users ask on Google/Reddit",
    "Second common question",
    "Third common question",
    "Fourth common question"
  ],
  "audiencePainPoints": [
    "Core problem or frustration faced by target audience",
    "Second specific obstacle",
    "Third obstacle"
  ],
  "contentGaps": [
    "What existing online articles miss or explain poorly",
    "Second underexplored opportunity"
  ],
  "suggestedSources": [
    { "title": "Authoritative research domain or report name", "description": "Why this perspective is essential" },
    { "title": "Industry benchmark or case study", "description": "Key relevance" }
  ],
  "faqIdeas": [
    { "question": "High-impact FAQ question", "answer": "Concise, definitive answer" },
    { "question": "Second FAQ question", "answer": "Clear actionable answer" }
  ],
  "competitorAngle": "How generic competitors cover this topic versus how to differentiate with higher authority."
}`;

    try {
      const responseText = await aiOrchestrator.generateText(prompt, {
        temperature: 0.5,
        maxTokens: 1800,
        taskName: 'ResearchStudio',
      });

      const parsed = aiOrchestrator.extractJson(responseText);
      if (parsed && parsed.keyPoints) {
        return parsed;
      }
    } catch (err) {
      console.warn('[ResearchService] Fallback heuristic triggered:', err.message);
    }

    // High-quality heuristic fallback
    return {
      topic,
      searchIntent: 'Informational & Problem-Solving',
      keyPoints: [
        `Fundamental principles and modern developments shaping ${topic}.`,
        `Direct operational impact on ${targetAudience}.`,
        `Emerging 2026 methodologies and best practices.`,
        `Quantitative metrics to measure success and avoid common pitfalls.`,
      ],
      questionsPeopleAsk: [
        `What is the most effective way to implement ${topic}?`,
        `How does ${topic} compare to traditional alternatives?`,
        `What are the common mistakes when adopting ${topic}?`,
        `How much time does it take to see results with ${topic}?`,
      ],
      audiencePainPoints: [
        `Lack of clear, structured guidance tailored to ${targetAudience}.`,
        `Overwhelming jargon without actionable implementation steps.`,
        `Difficulty measuring return on investment.`,
      ],
      contentGaps: [
        `Most articles provide surface-level definitions without concrete workflows.`,
        `Lack of real-world tactical case studies and quantifiable takeaways.`,
      ],
      suggestedSources: [
        { title: 'Industry Benchmark Reports', description: 'Data-driven trends and adoption rates' },
        { title: 'Practitioner Case Studies', description: 'Real-world lessons from leading teams' },
      ],
      faqIdeas: [
        {
          question: `Why is ${topic} crucial right now?`,
          answer: `${topic} drives efficiency, competitive advantage, and higher quality execution for ${targetAudience}.`,
        },
        {
          question: `Where should beginners start?`,
          answer: `Focus on establishing strong baseline fundamentals before layering complex optimizations.`,
        },
      ],
      competitorAngle: `Competitors focus on basic definitions; differentiate by offering step-by-step frameworks and actionable templates.`,
    };
  }
}

module.exports = new ResearchService();
