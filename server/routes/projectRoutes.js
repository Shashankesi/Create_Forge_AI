const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  addProjectItem,
  deleteProjectItem,
  deleteProject,
  getCreativeContext,
  updateCreativeContext,
  addSource,
  deleteSource,
} = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.get('/:id/context', getCreativeContext);
router.put('/:id/context', updateCreativeContext);
router.post('/:id/items', addProjectItem);
router.delete('/:id/items/:itemId', deleteProjectItem);
router.post('/:id/sources', addSource);
router.delete('/:id/sources/:sourceId', deleteSource);
router.delete('/:id', deleteProject);

module.exports = router;
