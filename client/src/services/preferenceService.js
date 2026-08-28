import api from './api';

export const preferenceService = {
  getPreferences: async () => {
    const res = await api.get('/preferences');
    return res.data;
  },
  updatePreferences: async (data) => {
    const res = await api.put('/preferences', data);
    return res.data;
  },
  getProviderHealth: async () => {
    const res = await api.get('/preferences/health');
    return res.data;
  },
};
