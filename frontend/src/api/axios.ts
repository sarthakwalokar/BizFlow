import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Resolves the backend API base URL.
 * Automatically ensures the '/api/v1' suffix is present regardless of whether
 * VITE_API_BASE_URL is passed with or without '/api/v1'.
 */
export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const cleaned = envUrl.trim().replace(/\/+$/, '');
    return cleaned.endsWith('/api/v1') ? cleaned : `${cleaned}/api/v1`;
  }

  // Production fallback when VITE_API_BASE_URL is not set at build time
  if (import.meta.env.PROD) {
    return 'https://bizflow-backend-8uow.onrender.com/api/v1';
  }

  // Local development default
  return 'http://localhost:8080/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

export const SWAGGER_DOCS_URL = `${API_BASE_URL.replace(/\/api\/v1\/?$/, '')}/swagger-ui/index.html`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('bizflow_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Uniform error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token on authentication expiration if needed
      // localStorage.removeItem('bizflow_token');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
