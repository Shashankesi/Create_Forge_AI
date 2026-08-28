const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getWorkflows,
  createWorkflow,
  executeWorkflowStep,
  deleteWorkflow,
} = require('../controllers/workflowController');

router.use(authMiddleware);

router.get('/', getWorkflows);
router.post('/', createWorkflow);
router.post('/:id/execute-step', executeWorkflowStep);
router.delete('/:id', deleteWorkflow);

module.exports = router;
