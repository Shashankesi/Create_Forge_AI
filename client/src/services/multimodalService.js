import api from './api';

export const multimodalService = {
  imageToCampaign: async (data) => {
    const res = await api.post('/multimodal/image-to-campaign', data);
    return res.data;
  },
  articleToVisual: async (data) => {
    const res = await api.post('/multimodal/article-to-visual', data);
    return res.data;
  },
  articleToVideoBlueprint: async (data) => {
    const res = await api.post('/multimodal/video-blueprint', data);
    return res.data;
  },
  generatePresentation: async (data) => {
    const res = await api.post('/multimodal/presentation', data);
    return res.data;
  },
  analyzeContentGaps: async (data) => {
    const res = await api.post('/multimodal/content-gap', data);
    return res.data;
  },
  checkNaturalness: async (data) => {
    const res = await api.post('/multimodal/naturalness-check', data);
    return res.data;
  },
  generateHeadlineLab: async (data) => {
    const res = await api.post('/multimodal/headline-lab', data);
    return res.data;
  },
  optimizeCta: async (data) => {
    const res = await api.post('/multimodal/cta-optimizer', data);
    return res.data;
  },
  runAbComparison: async (data) => {
    const res = await api.post('/multimodal/ab-test', data);
    return res.data;
  },
  ingestDocument: async (formDataOrData) => {
    let headers = {};
    if (formDataOrData instanceof FormData) {
      headers = { 'Content-Type': 'multipart/form-data' };
    }
    const res = await api.post('/multimodal/ingest-document', formDataOrData, { headers });
    return res.data;
  },
  ingestAudio: async (formDataOrData) => {
    let headers = {};
    if (formDataOrData instanceof FormData) {
      headers = { 'Content-Type': 'multipart/form-data' };
    }
    const res = await api.post('/multimodal/ingest-audio', formDataOrData, { headers });
    return res.data;
  },
  generateImagePrompt: async (data) => {
    const res = await api.post('/multimodal/image-prompt', data);
    return res.data;
  },
};
