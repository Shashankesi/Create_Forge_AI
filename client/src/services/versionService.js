import api from './api';

export const versionService = {
  async createVersion(payload) {
    const res = await api.post('/versions', payload);
    return res.data;
  },

  async getVersions(assetId) {
    const res = await api.get(`/versions/asset/${assetId}`);
    return res.data;
  },

  async renameVersion(id, name) {
    const res = await api.patch(`/versions/${id}/rename`, { name });
    return res.data;
  },

  async deleteVersion(id) {
    const res = await api.delete(`/versions/${id}`);
    return res.data;
  },
};
