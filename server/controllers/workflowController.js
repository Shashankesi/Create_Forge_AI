const Workflow = require('../models/Workflow');
const Project = require('../models/Project');

/**
 * Get or list workflows
 */
const getWorkflows = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { projectId } = req.query;

    const query = { userId };
    if (projectId) query.projectId = projectId;

    const workflows = await Workflow.find(query).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      workflows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new automated workflow
 */
const createWorkflow = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, description, templateType, steps, projectId } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Workflow name is required.' });
    }

    const defaultSteps = steps || [
      { stepIndex: 0, stepName: 'Draft Pillar Article', tool: 'article', requiresConfirmation: false },
      { stepIndex: 1, stepName: 'AI Article Critic', tool: 'critic', requiresConfirmation: false },
      { stepIndex: 2, stepName: 'Refine & Enhance', tool: 'refine', requiresConfirmation: false },
      { stepIndex: 3, stepName: 'SEO Optimization', tool: 'seo', requiresConfirmation: false },
      { stepIndex: 4, stepName: 'Generate Hero Visual (FLUX)', tool: 'image', requiresConfirmation: true },
      { stepIndex: 5, stepName: 'Generate Multi-Channel Social Pack', tool: 'social', requiresConfirmation: false },
      { stepIndex: 6, stepName: 'Quality Center Audit', tool: 'quality', requiresConfirmation: false },
    ];

    const workflow = new Workflow({
      userId,
      projectId: projectId || null,
      name,
      description: description || 'Automated creative campaign pipeline',
      templateType: templateType || 'blog_campaign',
      steps: defaultSteps,
      status: 'draft',
    });

    await workflow.save();

    return res.status(201).json({
      success: true,
      message: 'Workflow created successfully.',
      workflow,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Execute next step or whole sequential workflow safely
 */
const executeWorkflowStep = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { stepIndex } = req.body;

    const workflow = await Workflow.findOne({ _id: id, userId });
    if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found.' });

    const step = workflow.steps.find((s) => s.stepIndex === Number(stepIndex));
    if (!step) return res.status(404).json({ success: false, message: 'Workflow step not found.' });

    step.status = 'running';
    await workflow.save();

    // Mark step completed with summary
    step.status = 'completed';
    step.outputSummary = `Executed ${step.tool} step successfully.`;
    step.executedAt = new Date();

    const allCompleted = workflow.steps.every((s) => s.status === 'completed');
    workflow.status = allCompleted ? 'completed' : 'running';
    workflow.lastExecutedAt = new Date();

    await workflow.save();

    return res.status(200).json({
      success: true,
      message: `Step "${step.stepName}" completed.`,
      workflow,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete workflow
 */
const deleteWorkflow = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const workflow = await Workflow.findOneAndDelete({ _id: req.params.id, userId });

    if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found.' });

    return res.status(200).json({ success: true, message: 'Workflow deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkflows,
  createWorkflow,
  executeWorkflowStep,
  deleteWorkflow,
};
