const CreativeMemory = require('../../models/CreativeMemory');

class CreativeMemoryService {
  /**
   * Get or initialize memory for a project
   */
  async getOrCreateMemory(projectId, userId) {
    let memory = await CreativeMemory.findOne({ projectId, userId });
    if (!memory) {
      memory = new CreativeMemory({
        projectId,
        userId,
        importantTerminology: [],
        preferredVisualDirections: [],
        avoidedVisualDirections: [],
        approvedConcepts: [],
        rejectedConcepts: [],
        decisionsHistory: [],
      });
      await memory.save();
    }
    return memory;
  }

  /**
   * Record approved or rejected asset decision to influence future AI generations
   */
  async recordDecision(projectId, userId, { type, title, status, feedback = '', summary = '', keywords = [] }) {
    const memory = await this.getOrCreateMemory(projectId, userId);

    if (status === 'approved' || status === 'favorite') {
      // Add to approved concepts
      memory.approvedConcepts.unshift({
        conceptId: 'c_' + Date.now(),
        title,
        type,
        summary,
        approvedAt: new Date(),
      });

      // If it's visual, record preferred direction
      if (type === 'image' && (summary || keywords.length)) {
        memory.preferredVisualDirections.unshift({
          style: summary || title,
          keywords,
          reason: 'User approved asset',
          addedAt: new Date(),
        });
      }

      memory.decisionsHistory.unshift({
        decision: `Approved ${type}: "${title}"`,
        rationale: summary || 'High alignment with project vision',
        timestamp: new Date(),
      });
    } else if (status === 'rejected') {
      memory.rejectedConcepts.unshift({
        conceptId: 'c_' + Date.now(),
        title,
        type,
        feedback,
        rejectedAt: new Date(),
      });

      // If it's visual, record avoided direction so future prompts bypass it
      if (type === 'image' && (feedback || title)) {
        memory.avoidedVisualDirections.unshift({
          style: feedback || title,
          keywords,
          reason: feedback || 'User rejected style',
          rejectedAt: new Date(),
        });
      }

      memory.decisionsHistory.unshift({
        decision: `Rejected ${type}: "${title}"`,
        rationale: feedback || 'Did not meet aesthetic or tone criteria',
        timestamp: new Date(),
      });
    }

    // Keep arrays bounded to recent 50 entries
    if (memory.approvedConcepts.length > 50) memory.approvedConcepts = memory.approvedConcepts.slice(0, 50);
    if (memory.rejectedConcepts.length > 50) memory.rejectedConcepts = memory.rejectedConcepts.slice(0, 50);
    if (memory.preferredVisualDirections.length > 30) memory.preferredVisualDirections = memory.preferredVisualDirections.slice(0, 30);
    if (memory.avoidedVisualDirections.length > 30) memory.avoidedVisualDirections = memory.avoidedVisualDirections.slice(0, 30);
    if (memory.decisionsHistory.length > 50) memory.decisionsHistory = memory.decisionsHistory.slice(0, 50);

    await memory.save();
    return memory;
  }

  /**
   * Update structured memory terms, objective, audience
   */
  async updateMemory(projectId, userId, updates) {
    const memory = await this.getOrCreateMemory(projectId, userId);

    if (updates.objective !== undefined) memory.objective = updates.objective;
    if (updates.audience !== undefined) memory.audience = updates.audience;
    if (updates.brandVoice !== undefined) memory.brandVoice = updates.brandVoice;
    if (updates.importantTerminology) memory.importantTerminology = updates.importantTerminology;
    if (updates.preferredVisualDirections) memory.preferredVisualDirections = updates.preferredVisualDirections;
    if (updates.avoidedVisualDirections) memory.avoidedVisualDirections = updates.avoidedVisualDirections;
    if (updates.campaignStage) memory.campaignStage = updates.campaignStage;

    await memory.save();
    return memory;
  }

  /**
   * Clear project memory
   */
  async clearMemory(projectId, userId) {
    const memory = await this.getOrCreateMemory(projectId, userId);
    memory.importantTerminology = [];
    memory.preferredVisualDirections = [];
    memory.avoidedVisualDirections = [];
    memory.approvedConcepts = [];
    memory.rejectedConcepts = [];
    memory.decisionsHistory = [];
    await memory.save();
    return memory;
  }
}

module.exports = new CreativeMemoryService();
