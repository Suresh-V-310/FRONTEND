import api from './api';

/**
 * Code snippets CRUD API service
 */
export const snippetService = {
  getAll: () => api.get('/snippets'),
  getOne: (id) => api.get(`/snippets/${id}`),
  create: (data) => api.post('/snippets', data),
  update: (id, data) => api.put(`/snippets/${id}`, data),
  delete: (id) => api.delete(`/snippets/${id}`),
};
