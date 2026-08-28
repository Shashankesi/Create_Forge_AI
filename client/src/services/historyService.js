import api from './api';

export const historyService = {
  async getHistory({ tool = 'all', search = '', favorites = false, page = 1, limit = 50 } = {}) {
    const params = new URLSearchParams();
    if (tool && tool !== 'all' && tool !== 'favorites') params.append('tool', tool);
    if (search) params.append('search', search);
    if (favorites || tool === 'favorites') params.append('favorites', 'true');
    params.append('page', page);
    params.append('limit', limit);

    const res = await api.get(`/history?${params.toString()}`);
    return res.data;
  },

  async getToolHistory(tool) {
    const res = await api.get(`/history/${tool}`);
    return res.data;
  },

  async toggleFavorite(id) {
    const res = await api.patch(`/history/${id}/favorite`);
    return res.data;
  },

  async getUserStats() {
    const res = await api.get('/history/stats');
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
