import api from './api';

export const projectService = {
  async getProjects({ category, search } = {}) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);

    const res = await api.get(`/projects?${params.toString()}`);
    return res.data;
  },

  async getProjectById(id) {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },

  async createProject(data) {
    const res = await api.post('/projects', data);
    return res.data;
  },

  async updateProject(id, data) {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  },

  async addProjectItem(id, itemData) {
    const res = await api.post(`/projects/${id}/items`, itemData);
    return res.data;
  },

  async deleteProjectItem(projectId, itemId) {
    const res = await api.delete(`/projects/${projectId}/items/${itemId}`);
    return res.data;
  },

  async getCreativeContext(id) {
    const res = await api.get(`/projects/${id}/context`);
    return res.data;
  },

  async updateCreativeContext(id, contextData) {
    const res = await api.put(`/projects/${id}/context`, contextData);
    return res.data;
  },

  async addProjectSource(id, sourceData) {
    const res = await api.post(`/projects/${id}/sources`, sourceData);
    return res.data;
  },

  async deleteProjectSource(projectId, sourceId) {
    const res = await api.delete(`/projects/${projectId}/sources/${sourceId}`);
    return res.data;
  },

  async deleteProject(id) {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
};
