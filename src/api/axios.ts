import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('API Request:', {
      method: config.method,
      url: `${config.baseURL}${config.url}`,
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Auto-refresh on 401
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },

  async (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      response: error.response?.data,
    });

    const originalRequest = error.config;

    // Network Error
    if (!error.response) {
      console.error(
        'NETWORK ERROR - Backend may be unreachable:',
        `${API_URL}${originalRequest?.url || ''}`,
      );

      return Promise.reject(error);
    }

    // Don't refresh the login request itself
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');

        window.location.href = '/login';

        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise = axios
          .post(`${API_URL}/auth/refresh`, {
            refreshToken,
          })
          .then((res) => {
            const newToken = res.data.token;

            localStorage.setItem('token', newToken);

            return newToken;
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      try {
        const newToken = await refreshPromise;

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');

        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export { API_URL };