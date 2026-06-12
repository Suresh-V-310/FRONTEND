import api from '../../../shared/services/api.js';

export const compilerService = {
  runCode: (data) => api.post('/compiler/run', data, { timeout: 60000 }),
  getLanguages: () => api.get('/compiler/languages'),
  getDefaultCode: (language) => api.get(`/compiler/default/${language}`),
};
