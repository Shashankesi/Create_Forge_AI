import api from './api';

export const memoryService = {
  getMemory: async (projectId) => {
    const res = await api.get(`/memory/${projectId}`);
    return res.data;
  },
  updateMemory: async (projectId, data) => {
    const res = await api.put(`/memory/${projectId}`, data);
    return res.data;
  },
  recordDecision: async (projectId, data) => {
    const res = await api.post(`/memory/${projectId}/decision`, data);
    return res.data;
  },
  clearMemory: async (projectId) => {
    const res = await api.delete(`/memory/${projectId}`);
    return res.data;
  },
};
