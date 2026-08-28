import api from './api';

export const workflowService = {
  getWorkflows: async (projectId) => {
    const params = projectId ? { projectId } : {};
    const res = await api.get('/workflows', { params });
    return res.data;
  },
  createWorkflow: async (data) => {
    const res = await api.post('/workflows', data);
    return res.data;
  },
  executeStep: async (workflowId, stepIndex) => {
    const res = await api.post(`/workflows/${workflowId}/execute-step`, { stepIndex });
    return res.data;
  },
  deleteWorkflow: async (id) => {
    const res = await api.delete(`/workflows/${id}`);
    return res.data;
  },
};
