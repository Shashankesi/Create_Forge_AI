import api from './api';

export const exportService = {
  async exportCampaign(projectId) {
    const res = await api.get(`/export/campaign/${projectId}`);
    return res.data;
  },

  async getProjectTimeline(projectId) {
    const res = await api.get(`/export/timeline/${projectId}`);
    return res.data;
  },
};
