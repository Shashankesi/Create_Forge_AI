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

  async analyzeTitle(payload) {
    const res = await api.post('/ai/title-analyze', payload);
    return res.data;
  },

  async compareTitles(payload) {
    const res = await api.post('/ai/title-compare', payload);
    return res.data;
  },

  async generateImage(payload) {
    const res = await api.post('/ai/image', payload);
    return res.data;
  },

  async enhanceImagePrompt(payload) {
    const res = await api.post('/ai/prompt-enhance', payload);
    return res.data;
  },

  async generateImageVariations(payload) {
    const res = await api.post('/ai/image-variations', payload);
    return res.data;
  },

  async analyzeImage(formDataOrJson) {
    let headers = {};
    if (formDataOrJson instanceof FormData) {
      headers = { 'Content-Type': 'multipart/form-data' };
    }
    const res = await api.post('/ai/image-analyze', formDataOrJson, { headers });
    return res.data;
  },

  async evaluateImageQuality(payload) {
    const res = await api.post('/ai/image-quality', payload);
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

  async repurposeContent(payload) {
    const res = await api.post('/ai/repurpose', payload);
    return res.data;
  },

  async generateContentPack(payload) {
    const res = await api.post('/ai/content-pack', payload);
    return res.data;
  },

  async generateSocialPack(payload) {
    const res = await api.post('/ai/social-pack', payload);
    return res.data;
  },

  async evaluateBrandConsistency(payload) {
    const res = await api.post('/ai/brand-consistency', payload);
    return res.data;
  },

  async transformInlineText(payload) {
    const res = await api.post('/ai/inline-transform', payload);
    return res.data;
  },

  async generateArticleOutline(payload) {
    const res = await api.post('/ai/article-outline', payload);
    return res.data;
  },

  async improveWeakestArea(payload) {
    const res = await api.post('/ai/article-improve-weakest', payload);
    return res.data;
  },

  async improveArticleSection(payload) {
    const res = await api.post('/ai/article-improve-section', payload);
    return res.data;
  },

  async humanizeArticle(payload) {
    const res = await api.post('/ai/article-humanize', payload);
    return res.data;
  },

  async detectWeakSections(payload) {
    const res = await api.post('/ai/article-weak-sections', payload);
    return res.data;
  },

  async generateSinglePlatformSocial(payload) {
    const res = await api.post('/ai/social-single-platform', payload);
    return res.data;
  },

  async generateTitleVariations(payload) {
    const res = await api.post('/ai/title-variations', payload);
    return res.data;
  },

  async generateTitlesFromArticle(payload) {
    const res = await api.post('/ai/titles-from-article', payload);
    return res.data;
  },

  async askAssistant(payload) {
    const res = await api.post('/ai/assistant', payload);
    return res.data;
  },
};
