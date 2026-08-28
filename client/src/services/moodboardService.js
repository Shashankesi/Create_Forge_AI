import api from './api';

export const moodboardService = {
  getMoodboard: async (projectId) => {
    const res = await api.get(`/moodboard/project/${projectId}`);
    return res.data;
  },
  generateCreativeDirection: async (data) => {
    const res = await api.post('/moodboard/generate-direction', data);
    return res.data;
  },
  generateVisualMatchingMoodboard: async (moodboardId, intent) => {
    const res = await api.post(`/moodboard/${moodboardId}/generate-visual`, { intent });
    return res.data;
  },
  updateMoodboard: async (id, data) => {
    const res = await api.put(`/moodboard/${id}`, data);
    return res.data;
  },
  applyDirectionToProject: async (data) => {
    const res = await api.post('/moodboard/apply-direction', data);
    return res.data;
  },
};
