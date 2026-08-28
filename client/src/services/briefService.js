import api from './api';

export const briefService = {
  async generateBrief(payload) {
    const res = await api.post('/briefs/generate', payload);
    return res.data;
  },

  async getBriefs(params = {}) {
    const res = await api.get('/briefs', { params });
    return res.data;
  },

  async getBriefById(id) {
    const res = await api.get(`/briefs/${id}`);
    return res.data;
  },
};
