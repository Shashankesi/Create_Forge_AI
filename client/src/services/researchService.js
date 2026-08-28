import api from './api';

export const researchService = {
  async conductResearch(payload) {
    const res = await api.post('/research/conduct', payload);
    return res.data;
  },

  async getResearchItems(params = {}) {
    const res = await api.get('/research', { params });
    return res.data;
  },
};
