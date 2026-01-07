import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse, RefreshTokenRequest } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5115/api';

// Helper to check if we're on the login page
const isOnLoginPage = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname === '/login' || window.location.pathname === '/register';
};

// Helper to redirect to login (only if not already there)
const redirectToLogin = () => {
  if (typeof window !== 'undefined' && !isOnLoginPage()) {
    window.location.href = '/login';
  }
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }
};

export const getAccessToken = (): string | null => {
  if (!accessToken && typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
};

export const getRefreshToken = (): string | null => {
  if (!refreshToken && typeof window !== 'undefined') {
    refreshToken = localStorage.getItem('refreshToken');
  }
  return refreshToken;
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// Check if we have a token (for enabling queries)
export const hasToken = (): boolean => {
  return !!getAccessToken();
};

// Request interceptor: Add access token to headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 errors and refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh = getRefreshToken();
      if (!refresh) {
        clearTokens();
        redirectToLogin();
        return Promise.reject(error);
      }

      try {
        // API returns ApiResponse<AuthResponse>
        interface ApiResponseWrapper<T> { success: boolean; message: string; data: T; }
        const response = await axios.post<ApiResponseWrapper<AuthResponse>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: refresh } as RefreshTokenRequest
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        setTokens(newAccessToken, newRefreshToken);

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        clearTokens();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
