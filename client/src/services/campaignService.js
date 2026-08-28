import api from './api';

export const campaignService = {
  generateCampaign: async (data) => {
    const res = await api.post('/campaigns/generate', data);
    return res.data;
  },
  getCampaigns: async (projectId) => {
    const params = projectId ? { projectId } : {};
    const res = await api.get('/campaigns', { params });
    return res.data;
  },
  getCampaignById: async (id) => {
    const res = await api.get(`/campaigns/${id}`);
    return res.data;
  },
  updateCampaign: async (id, data) => {
    const res = await api.put(`/campaigns/${id}`, data);
    return res.data;
  },
  deleteCampaign: async (id) => {
    const res = await api.delete(`/campaigns/${id}`);
    return res.data;
  },
  getProjectHealth: async (projectId) => {
    const res = await api.get(`/campaigns/health/${projectId}`);
    return res.data;
  },
  getNextAction: async (projectId) => {
    const res = await api.get(`/campaigns/next-action/${projectId}`);
    return res.data;
  },
  getLaunchReadiness: async (projectId) => {
    const res = await api.get(`/campaigns/launch-readiness/${projectId}`);
    return res.data;
  },
};
