const Project = require('../models/Project');
const { isDbConnected } = require('../config/db');

// In-memory fallback if DB is momentarily establishing
const getMemStore = () => {
  global.__createforgeProjects = global.__createforgeProjects || [];
  return global.__createforgeProjects;
};

/**
 * @route   GET /api/projects
 * @desc    Get all projects for the authenticated user
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { category, search } = req.query;

    let projects = [];
    if (isDbConnected()) {
      const query = { userId };
      if (category && category !== 'All') query.category = category;
      if (search && search.trim()) {
        query.$or = [
          { name: { $regex: search.trim(), $options: 'i' } },
          { description: { $regex: search.trim(), $options: 'i' } },
        ];
      }
      projects = await Project.find(query).sort({ updatedAt: -1 });
    } else {
      const store = getMemStore();
      projects = store.filter((p) => String(p.userId) === String(userId));
    }

    return res.status(200).json({
      success: true,
      data: {
        projects,
        count: projects.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
const createProject = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, description, category, color, tags } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a project name.',
      });
    }

    let project = null;
    if (isDbConnected()) {
      project = await Project.create({
        userId,
        name: name.trim(),
        description: description?.trim() || '',
        category: category || 'General',
        color: color || '#6366F1',
        tags: Array.isArray(tags) ? tags : [],
        items: [],
      });
    } else {
      project = {
        _id: 'proj_' + Date.now(),
        id: 'proj_' + Date.now(),
        userId,
        name: name.trim(),
        description: description?.trim() || '',
        category: category || 'General',
        color: color || '#6366F1',
        tags: Array.isArray(tags) ? tags : [],
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      getMemStore().unshift(project);
    }

    return res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID (strictly user-isolated)
 * @access  Private
 */
const getProjectById = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    let project = null;
    if (isDbConnected()) {
      project = await Project.findOne({ _id: id, userId });
    } else {
      project = getMemStore().find((p) => (p._id || p.id) === id && String(p.userId) === String(userId));
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project details
 * @access  Private
 */
const updateProject = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { name, description, category, color, tags, isFavorite } = req.body;

    let project = null;
    if (isDbConnected()) {
      project = await Project.findOne({ _id: id, userId });
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied.',
        });
      }

      if (name) project.name = name.trim();
      if (description !== undefined) project.description = description.trim();
      if (category) project.category = category;
      if (color) project.color = color;
      if (Array.isArray(tags)) project.tags = tags;
      if (isFavorite !== undefined) project.isFavorite = Boolean(isFavorite);

      await project.save();
    } else {
      const store = getMemStore();
      const idx = store.findIndex((p) => (p._id || p.id) === id && String(p.userId) === String(userId));
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied.',
        });
      }
      project = {
        ...store[idx],
        ...(name ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(category ? { category } : {}),
        ...(color ? { color } : {}),
        ...(isFavorite !== undefined ? { isFavorite: Boolean(isFavorite) } : {}),
        updatedAt: new Date(),
      };
      store[idx] = project;
    }

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/projects/:id/items
 * @desc    Add an asset/item to a project
 * @access  Private
 */
const addProjectItem = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { assetType, title, content, previewUrl, historyId } = req.body;

    if (!assetType || !title) {
      return res.status(400).json({
        success: false,
        message: 'Asset type and title are required.',
      });
    }

    const newItem = {
      assetType,
      title: title.trim(),
      content: content || null,
      previewUrl: previewUrl || null,
      historyId: historyId || null,
      createdAt: new Date(),
    };

    let project = null;
    if (isDbConnected()) {
      project = await Project.findOne({ _id: id, userId });
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied.',
        });
      }
      project.items.unshift(newItem);
      await project.save();
    } else {
      const store = getMemStore();
      const idx = store.findIndex((p) => (p._id || p.id) === id && String(p.userId) === String(userId));
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied.',
        });
      }
      store[idx].items.unshift(newItem);
      project = store[idx];
    }

    return res.status(200).json({
      success: true,
      message: 'Asset added to project.',
      data: {
        item: newItem,
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project (strictly user-isolated)
 * @access  Private
 */
const deleteProject = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    if (isDbConnected()) {
      const result = await Project.deleteOne({ _id: id, userId });
      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied.',
        });
      }
    } else {
      const store = getMemStore();
      const idx = store.findIndex((p) => (p._id || p.id) === id && String(p.userId) === String(userId));
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied.',
        });
      }
      store.splice(idx, 1);
    }

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects/:id/context
 * @desc    Get project-level creative context
 * @access  Private
 */
const getCreativeContext = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    let project = null;
    if (isDbConnected()) {
      project = await Project.findOne({ _id: id, userId });
    } else {
      project = getMemStore().find((p) => (p._id || p.id) === id && String(p.userId) === String(userId));
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        creativeContext: project.creativeContext || {
          topic: '',
          audience: '',
          objective: '',
          tone: 'Professional',
          keywords: [],
          brandVoice: '',
          visualDirection: '',
          contentType: 'Article',
          language: 'en',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/projects/:id/context
 * @desc    Update project-level creative context
 * @access  Private
 */
const updateCreativeContext = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const payload = req.body.creativeContext && typeof req.body.creativeContext === 'object'
      ? req.body.creativeContext
      : req.body;
    const {
      topic,
      audience,
      objective,
      tone,
      keywords,
      brandVoice,
      visualDirection,
      contentType,
      language,
    } = payload;

    let project = null;
    if (isDbConnected()) {
      project = await Project.findOne({ _id: id, userId });
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied.',
        });
      }

      project.creativeContext = {
        topic: topic !== undefined ? String(topic) : (project.creativeContext?.topic || ''),
        audience: audience !== undefined ? String(audience) : (project.creativeContext?.audience || ''),
        objective: objective !== undefined ? String(objective) : (project.creativeContext?.objective || ''),
        tone: tone !== undefined ? String(tone) : (project.creativeContext?.tone || 'Professional'),
        keywords: Array.isArray(keywords) ? keywords : (project.creativeContext?.keywords || []),
        brandVoice: brandVoice !== undefined ? String(brandVoice) : (project.creativeContext?.brandVoice || ''),
        visualDirection: visualDirection !== undefined ? String(visualDirection) : (project.creativeContext?.visualDirection || ''),
        contentType: contentType !== undefined ? String(contentType) : (project.creativeContext?.contentType || 'Article'),
        language: language !== undefined ? String(language) : (project.creativeContext?.language || 'en'),
        lastUpdated: new Date(),
      };

      await project.save();
    } else {
      const store = getMemStore();
      const idx = store.findIndex((p) => (p._id || p.id) === id && String(p.userId) === String(userId));
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied.',
        });
      }
      const existing = store[idx].creativeContext || {};
      store[idx].creativeContext = {
        ...existing,
        ...(topic !== undefined ? { topic } : {}),
        ...(audience !== undefined ? { audience } : {}),
        ...(objective !== undefined ? { objective } : {}),
        ...(tone !== undefined ? { tone } : {}),
        ...(keywords !== undefined ? { keywords } : {}),
        ...(brandVoice !== undefined ? { brandVoice } : {}),
        ...(visualDirection !== undefined ? { visualDirection } : {}),
        ...(contentType !== undefined ? { contentType } : {}),
        ...(language !== undefined ? { language } : {}),
        lastUpdated: new Date(),
      };
      project = store[idx];
    }

    return res.status(200).json({
      success: true,
      message: 'Project creative context updated successfully.',
      data: {
        creativeContext: project.creativeContext,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/projects/:id/sources
 * @desc    Add a document/media source to the project
 * @access  Private
 */
const addSource = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { name, fileType, textContent, metadata } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Source name is required.',
      });
    }

    const newSource = {
      name: name.trim(),
      fileType: fileType || 'txt',
      textContent: textContent || '',
      metadata: metadata || {},
      createdAt: new Date(),
    };

    let project = null;
    if (isDbConnected()) {
      project = await Project.findOne({ _id: id, userId });
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied.',
        });
      }
      project.sources = project.sources || [];
      project.sources.unshift(newSource);
      await project.save();
    } else {
      const store = getMemStore();
      const idx = store.findIndex((p) => (p._id || p.id) === id && String(p.userId) === String(userId));
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied.',
        });
      }
      store[idx].sources = store[idx].sources || [];
      store[idx].sources.unshift(newSource);
      project = store[idx];
    }

    return res.status(201).json({
      success: true,
      message: 'Source attached to project.',
      data: {
        source: newSource,
        sources: project.sources,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/projects/:id/sources/:sourceId
 * @desc    Delete a source from a project
 * @access  Private
 */
const deleteSource = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id, sourceId } = req.params;

    let project = null;
    if (isDbConnected()) {
      project = await Project.findOne({ _id: id, userId });
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied.',
        });
      }
      project.sources = (project.sources || []).filter((s) => String(s._id || s.id) !== String(sourceId));
      await project.save();
    } else {
      const store = getMemStore();
      const idx = store.findIndex((p) => (p._id || p.id) === id && String(p.userId) === String(userId));
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied.',
        });
      }
      store[idx].sources = (store[idx].sources || []).filter((s) => String(s._id || s.id) !== String(sourceId));
      project = store[idx];
    }

    return res.status(200).json({
      success: true,
      message: 'Source deleted successfully.',
      data: {
        sources: project.sources || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/projects/:id/items/:itemId
 * @desc    Delete an asset item from a project
 * @access  Private
 */
const deleteProjectItem = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id, itemId } = req.params;

    let project = null;
    if (isDbConnected()) {
      project = await Project.findOne({ _id: id, userId });
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied.',
        });
      }
      project.items = (project.items || []).filter((item) => String(item._id || item.id) !== String(itemId));
      await project.save();
    } else {
      const store = getMemStore();
      const idx = store.findIndex((p) => (p._id || p.id) === id && String(p.userId) === String(userId));
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'Project not found or access denied.',
        });
      }
      store[idx].items = (store[idx].items || []).filter((item) => String(item._id || item.id) !== String(itemId));
      project = store[idx];
    }

    return res.status(200).json({
      success: true,
      message: 'Asset removed from project.',
      data: {
        items: project.items || [],
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
