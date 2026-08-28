import api from './api';

export const commentService = {
  getComments: async (assetType, assetId) => {
    const res = await api.get('/comments', { params: { assetType, assetId } });
    return res.data;
  },
  addComment: async (data) => {
    const res = await api.post('/comments', data);
    return res.data;
  },
  replyComment: async (commentId, content) => {
    const res = await api.post(`/comments/${commentId}/reply`, { content });
    return res.data;
  },
  toggleResolve: async (commentId) => {
    const res = await api.put(`/comments/${commentId}/resolve`);
    return res.data;
  },
  deleteComment: async (commentId) => {
    const res = await api.delete(`/comments/${commentId}`);
    return res.data;
  },
};
