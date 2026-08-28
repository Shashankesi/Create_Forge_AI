import api from './api';

export const brandService = {
  async getBrandKit() {
    const res = await api.get('/brand');
    return res.data;
  },

  async updateBrandKit(data) {
    const res = await api.put('/brand', data);
    return res.data;
  },
};
