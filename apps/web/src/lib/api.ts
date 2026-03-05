import axios from 'axios';
import { logger } from './logger';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('deepdev_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register');
    if (
      error.response?.status === 401 &&
      !isAuthRequest &&
      typeof window !== 'undefined'
    ) {
      localStorage.removeItem('deepdev_token');
      window.location.href = '/login';
    }
    if (error.response?.status && error.response.status >= 500) {
      logger.error(`API ${error.config?.method ?? '?'} ${error.config?.url ?? '?'} failed`, {
        status: error.response.status,
        message: error.response?.data?.message,
      });
    }
    return Promise.reject(error);
  },
);
