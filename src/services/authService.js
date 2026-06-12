import api from './api';

/**
 * Authentication API service
 */
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  addRecentFile: (data) => api.post('/auth/recent', data),
};
