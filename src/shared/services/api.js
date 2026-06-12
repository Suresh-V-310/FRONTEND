import axios from 'axios';
import { API_URL } from '../config/app.js';
import { getToken, removeToken } from '../utils/storage.js';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) removeToken();
    return Promise.reject(error);
  }
);

export default api;
