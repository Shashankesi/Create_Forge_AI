import React, { createContext, useContext, useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProjectState] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await projectService.getProjects();
      if (res.success && res.data?.projects) {
        const list = res.data.projects;
        setProjects(list);

        // Retain or set active project
        if (list.length > 0) {
          const savedActiveId = localStorage.getItem('cf_active_project_id');
          const found = list.find((p) => (p._id || p.id) === savedActiveId);
          const selected = found || list[0];
          setActiveProjectState(selected);
          if (selected) {
            localStorage.setItem('cf_active_project_id', selected._id || selected.id);
          }
        } else {
          setActiveProjectState(null);
          localStorage.removeItem('cf_active_project_id');
        }
      }
    } catch (err) {
      console.warn('Failed to load projects:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    } else {
      setProjects([]);
      setActiveProjectState(null);
      localStorage.removeItem('cf_active_project_id');
    }
  }, [isAuthenticated]);

  const setActiveProject = (projectOrId) => {
    if (!projectOrId) {
      setActiveProjectState(null);
      localStorage.removeItem('cf_active_project_id');
      return;
    }

    if (typeof projectOrId === 'string') {
      const found = projects.find((p) => (p._id || p.id) === projectOrId);
      if (found) {
        setActiveProjectState(found);
        localStorage.setItem('cf_active_project_id', found._id || found.id);
        showToast(`Switched active workspace to "${found.name}"`, 'info');
      }
    } else {
      setActiveProjectState(projectOrId);
      localStorage.setItem('cf_active_project_id', projectOrId._id || projectOrId.id);
      showToast(`Switched active workspace to "${projectOrId.name}"`, 'info');
    }
  };

  const createQuickProject = async (name, category = 'General', color = '#6366F1') => {
    try {
      const res = await projectService.createProject({
        name: name.trim(),
        category,
        color,
      });

      if (res.success && res.data?.project) {
        const newProj = res.data.project;
        setProjects((prev) => [newProj, ...prev]);
        setActiveProject(newProj);
        showToast(`Created & switched to project "${newProj.name}"`, 'success');
        return newProj;
      }
    } catch (err) {
      showToast('Could not create project.', 'error');
    }
    return null;
  };

  const addAssetToActiveProject = async ({ assetType, title, content, previewUrl }) => {
    if (!activeProject) return;
    try {
      const projectId = activeProject._id || activeProject.id;
      const res = await projectService.addProjectItem(projectId, {
        assetType,
        title,
        content,
        previewUrl,
      });

      if (res.success && res.data?.project) {
        setActiveProjectState(res.data.project);
        setProjects((prev) =>
          prev.map((p) => ((p._id || p.id) === projectId ? res.data.project : p))
        );
        showToast(`Saved to project "${activeProject.name}"`, 'success');
      }
    } catch (err) {
      console.warn('Failed to add asset to active project:', err);
    }
  };

  const [useProjectContextToggle, setUseProjectContextToggle] = useState(true);

  const updateProjectCreativeContext = async (contextData) => {
    if (!activeProject) return null;
    const projectId = activeProject._id || activeProject.id;
    try {
      const res = await projectService.updateCreativeContext(projectId, contextData);
      if (res.success && res.data?.creativeContext) {
        const updated = {
          ...activeProject,
          creativeContext: res.data.creativeContext,
        };
        setActiveProjectState(updated);
        setProjects((prev) =>
          prev.map((p) => ((p._id || p.id) === projectId ? updated : p))
        );
        showToast('Project creative context updated.', 'success');
        return res.data.creativeContext;
      }
    } catch (err) {
      showToast('Could not update project context.', 'error');
    }
    return null;
  };

  const removeProjectItem = async (itemId) => {
    if (!activeProject) return;
    const projectId = activeProject._id || activeProject.id;
    try {
      const res = await projectService.deleteProjectItem(projectId, itemId);
      if (res.success) {
        const updated = {
          ...activeProject,
          items: (activeProject.items || []).filter((i) => (i._id || i.id) !== itemId),
        };
        setActiveProjectState(updated);
        setProjects((prev) =>
          prev.map((p) => ((p._id || p.id) === projectId ? updated : p))
        );
        showToast('Asset removed from project.', 'info');
      }
    } catch (err) {
      showToast('Could not remove asset.', 'error');
    }
  };

  const addProjectSource = async (sourceData) => {
    if (!activeProject) return;
    const projectId = activeProject._id || activeProject.id;
    try {
      const res = await projectService.addProjectSource(projectId, sourceData);
      if (res.success && res.data?.sources) {
        const updated = {
          ...activeProject,
          sources: res.data.sources,
        };
        setActiveProjectState(updated);
        setProjects((prev) =>
          prev.map((p) => ((p._id || p.id) === projectId ? updated : p))
        );
        showToast('Source attached to project.', 'success');
        return res.data.source;
      }
    } catch (err) {
      showToast('Could not attach source.', 'error');
    }
    return null;
  };

  const deleteProjectSource = async (sourceId) => {
    if (!activeProject) return;
    const projectId = activeProject._id || activeProject.id;
    try {
      const res = await projectService.deleteProjectSource(projectId, sourceId);
      if (res.success && res.data?.sources) {
        const updated = {
          ...activeProject,
          sources: res.data.sources,
        };
        setActiveProjectState(updated);
        setProjects((prev) =>
          prev.map((p) => ((p._id || p.id) === projectId ? updated : p))
        );
        showToast('Source deleted from project.', 'info');
      }
    } catch (err) {
      showToast('Could not delete source.', 'error');
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        currentProject: activeProject,
        activeProjectId: activeProject?._id || activeProject?.id || null,
        creativeContext: activeProject?.creativeContext || null,
        useProjectContext: useProjectContextToggle,
        setUseProjectContext: setUseProjectContextToggle,
        loading,
        setActiveProject,
        refreshProjects: fetchProjects,
        createQuickProject,
        addAssetToActiveProject,
        removeProjectItem,
        updateProjectCreativeContext,
        addProjectSource,
        deleteProjectSource,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
