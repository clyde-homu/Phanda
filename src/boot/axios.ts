import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.104:9500/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  // Request interceptor to add auth token
  api.interceptors.request.use(
    config => {
      const accessToken = localStorage.getItem('phanda-access-token');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  );

  // Response interceptor to handle token refresh
  api.interceptors.response.use(
    response => {
      return response;
    },
    async error => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem('phanda-refresh-token');
        if (refreshToken) {
          try {
            const response = await api.post('/auth/refresh', {
              refreshToken: refreshToken,
            });

            if (response.data.success) {
              const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
              localStorage.setItem('phanda-access-token', accessToken);
              localStorage.setItem('phanda-refresh-token', newRefreshToken);

              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('phanda-access-token');
            localStorage.removeItem('phanda-refresh-token');
            localStorage.removeItem('phanda-user');
            window.location.href = '/';
            return Promise.reject(
              refreshError instanceof Error ? refreshError : new Error(String(refreshError))
            );
          }
        } else {
          // No refresh token, redirect to login
          localStorage.removeItem('phanda-access-token');
          localStorage.removeItem('phanda-refresh-token');
          localStorage.removeItem('phanda-user');
          window.location.href = '/';
          return Promise.reject(new Error('No refresh token available'));
        }
      }

      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  );
});

export { api };
