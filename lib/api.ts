import axios from 'axios';

import { getToken, removeToken } from './auth';
import { startLoading, stopLoading } from './apiLoader';

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  startLoading();
  const token = getToken();

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => 
  {  stopLoading();
    return res
  },
  (error) => {
stopLoading();
    const status = error?.response?.status;

    const url =
      error?.config?.url || '';

    // ignore login/register errors
    const isAuthRoute =
      url.includes('/auth/login') ||
      url.includes('/auth/register');

    if (
      status === 401 &&
      !isAuthRoute
    ) {
      removeToken();

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);