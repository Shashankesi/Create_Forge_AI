import api from './api';

export const historyService = {
  async getHistory({ tool = 'all', search = '', page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams();
    if (tool && tool !== 'all') params.append('tool', tool);
    if (search) params.append('search', search);
    params.append('page', page);
    params.append('limit', limit);

    const res = await api.get(`/history?${params.toString()}`);
    return res.data;
  },

  async getToolHistory(tool) {
    const res = await api.get(`/history/${tool}`);
    return res.data;
  },

  async deleteHistoryItem(id) {
    const res = await api.delete(`/history/${id}`);
    return res.data;
  },

  async clearHistory() {
    const res = await api.delete('/history');
    return res.data;
  },
};
