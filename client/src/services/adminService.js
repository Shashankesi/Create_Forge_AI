import api from './api';

export const adminService = {
  async getAdminStats() {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  async getAdminUsers() {
    const res = await api.get('/admin/users');
    return res.data;
  },

  async getAdminUsage() {
    const res = await api.get('/admin/usage');
    return res.data;
  },
};
