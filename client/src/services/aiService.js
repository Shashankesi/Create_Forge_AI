import api from './api';

export const aiService = {
  async generateArticle(payload) {
    const res = await api.post('/ai/article', payload);
    return res.data;
  },

  async generateArticleCoverImage(payload) {
    const res = await api.post('/ai/article-cover-image', payload);
    return res.data;
  },

  async generateTitles(payload) {
    const res = await api.post('/ai/titles', payload);
    return res.data;
  },

  async generateImage(payload) {
    const res = await api.post('/ai/image', payload);
    return res.data;
  },

  async removeBackground(formDataOrJson) {
    let headers = {};
    if (formDataOrJson instanceof FormData) {
      headers = { 'Content-Type': 'multipart/form-data' };
    }
    const res = await api.post('/ai/background-remove', formDataOrJson, { headers });
    return res.data;
  },
};
