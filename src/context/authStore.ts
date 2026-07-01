/**
 * Authentication Store
 * Uses real backend API with mock fallback when backend is unavailable
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api, tokenManager } from '@/services/api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt?: string;
  preferences?: {
    stream?: string;
    location?: string;
    interests?: string[];
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

// Mock fallback — only used if backend is unreachable
const mockLogin = async (email: string, _password: string): Promise<{ user: User; token: string; refreshToken: string }> => {
  await new Promise(r => setTimeout(r, 600));
  const isAdmin = email.includes('admin');
  return {
    user: {
      id: 'mock_' + Date.now(),
      name: isAdmin ? 'Admin User' : email.split('@')[0],
      email,
      role: isAdmin ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    },
    token: 'mock_jwt_' + Date.now(),
    refreshToken: 'mock_refresh_' + Date.now(),
  };
};

const mockRegister = async (name: string, email: string, _password: string): Promise<{ user: User; token: string; refreshToken: string }> => {
  await new Promise(r => setTimeout(r, 600));
  return {
    user: {
      id: 'mock_' + Date.now(),
      name,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
    },
    token: 'mock_jwt_' + Date.now(),
    refreshToken: 'mock_refresh_' + Date.now(),
  };
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // Try real backend first
          let user: User;
          let token: string;
          let refreshToken: string;

          try {
            const response = await api.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>('/auth/login', { email, password });
            user = { ...response.data.user, id: (response.data.user as any)._id || response.data.user.id };
            token = response.data.tokens.accessToken;
            refreshToken = response.data.tokens.refreshToken;
          } catch (apiError: any) {
            // If network error (backend down), use mock
            if (apiError.message?.includes('Network') || apiError.code === 'ECONNREFUSED' || apiError.status >= 500) {
              const mock = await mockLogin(email, password);
              user = mock.user;
              token = mock.token;
              refreshToken = mock.refreshToken;
            } else {
              throw apiError;
            }
          }

          tokenManager.setToken(token);
          tokenManager.setRefreshToken(refreshToken);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login failed',
          });
          throw error;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          let user: User;
          let token: string;
          let refreshToken: string;

          try {
            const response = await api.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>('/auth/register', { name, email, password });
            user = { ...response.data.user, id: (response.data.user as any)._id || response.data.user.id };
            token = response.data.tokens.accessToken;
            refreshToken = response.data.tokens.refreshToken;
          } catch (apiError: any) {
            if (apiError.message?.includes('Network') || apiError.code === 'ECONNREFUSED' || apiError.status >= 500) {
              const mock = await mockRegister(name, email, password);
              user = mock.user;
              token = mock.token;
              refreshToken = mock.refreshToken;
            } else {
              throw apiError;
            }
          }

          tokenManager.setToken(token);
          tokenManager.setRefreshToken(refreshToken);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Registration failed',
          });
          throw error;
        }
      },

      logout: () => {
        // Fire and forget logout to backend
        api.post('/auth/logout').catch(() => {});
        tokenManager.clearAll();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      checkAuth: async () => {
        const token = tokenManager.getToken();
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          // Validate token with backend
          const response = await api.get<{ user: User }>('/auth/me');
          const user = { ...response.data.user, id: (response.data.user as any)._id || response.data.user.id };
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          // If backend down, check if we have persisted user data
          const currentUser = get().user;
          if (currentUser) {
            set({ isAuthenticated: true, isLoading: false });
          } else {
            tokenManager.clearAll();
            set({ isAuthenticated: false, user: null, isLoading: false });
          }
        }
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      clearError: () => set({ error: null }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'cn_auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
