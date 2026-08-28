import api from './api';

export const searchService = {
  globalSearch: async (query) => {
    const res = await api.get('/search', { params: { query } });
    return res.data;
  },
};
