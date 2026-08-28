import api from './api';

export const canvasService = {
  async getCanvas() {
    const res = await api.get('/canvas');
    return res.data;
  },

  async saveCanvas(data) {
    const res = await api.put('/canvas', data);
    return res.data;
  },
};
