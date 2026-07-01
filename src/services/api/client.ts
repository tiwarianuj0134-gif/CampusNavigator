/**
 * Centralized API Client
 * Handles all HTTP requests with authentication, error handling, and retry logic
 */

import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { config } from '@/config/env';

// Types
export interface ApiError {
  message: string;
  code: string;
  status: number;
  errors?: { field: string; message: string }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Token management
const TOKEN_KEY = 'cn_token';
const REFRESH_TOKEN_KEY = 'cn_refresh_token';

export const tokenManager = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  removeRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),
  
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  
  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor with token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
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
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - Token refresh
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

      const refreshToken = tokenManager.getRefreshToken();
      
      if (!refreshToken) {
        tokenManager.clearAll();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${config.apiBaseUrl}/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
        tokenManager.setTokens(accessToken, newRefreshToken);
        
        processQueue(null, accessToken);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        tokenManager.clearAll();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize error
    const apiError: ApiError = {
      message: getErrorMessage(error),
      code: getErrorCode(error),
      status: error.response?.status || 500,
      errors: (error.response?.data as any)?.errors,
    };

    return Promise.reject(apiError);
  }
);

function getErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as any;
    if (data.message) return data.message;
    if (data.error) return data.error;
  }
  
  if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
  if (!error.response) return 'Network error. Please check your connection.';
  
  switch (error.response.status) {
    case 400: return 'Invalid request. Please check your input.';
    case 401: return 'Please log in to continue.';
    case 403: return 'You do not have permission to perform this action.';
    case 404: return 'The requested resource was not found.';
    case 422: return 'Validation error. Please check your input.';
    case 429: return 'Too many requests. Please wait a moment.';
    case 500: return 'Server error. Please try again later.';
    default: return 'An unexpected error occurred.';
  }
}

function getErrorCode(error: AxiosError): string {
  const data = error.response?.data as any;
  return data?.code || `HTTP_${error.response?.status || 'UNKNOWN'}`;
}

// Retry wrapper
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (!error.status || error.status >= 500)) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// API helper methods
export const api = {
  get: <T>(url: string, params?: Record<string, any>) =>
    apiClient.get<ApiResponse<T>>(url, { params }).then((res) => res.data),
    
  post: <T>(url: string, data?: any) =>
    apiClient.post<ApiResponse<T>>(url, data).then((res) => res.data),
    
  put: <T>(url: string, data?: any) =>
    apiClient.put<ApiResponse<T>>(url, data).then((res) => res.data),
    
  patch: <T>(url: string, data?: any) =>
    apiClient.patch<ApiResponse<T>>(url, data).then((res) => res.data),
    
  delete: <T>(url: string) =>
    apiClient.delete<ApiResponse<T>>(url).then((res) => res.data),
};

export default apiClient;
