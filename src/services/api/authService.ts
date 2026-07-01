/**
 * Authentication Service — Frontend
 * Calls backend API with mock fallback if backend is unreachable.
 */

import { api, tokenManager } from './client';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  isVerified?: boolean;
  preferences?: {
    streams?: string[];
    locations?: string[];
    budget?: { min: number; max: number };
    interests?: string[];
    studyLevel?: string;
  };
  createdAt?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<any>('/auth/login', { email, password });
    const { user, tokens } = response.data;
    tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
    return { user: { ...user, id: user._id || user.id }, tokens };
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<any>('/auth/register', { name, email, password });
    const { user, tokens } = response.data;
    tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
    return { user: { ...user, id: user._id || user.id }, tokens };
  },

  async getCurrentUser(): Promise<User | null> {
    const token = tokenManager.getToken();
    if (!token) return null;
    try {
      const response = await api.get<any>('/auth/me');
      const user = response.data?.user || response.data;
      return { ...user, id: user._id || user.id };
    } catch {
      return null;
    }
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await api.patch<any>('/auth/me', updates);
    const user = response.data?.user || response.data;
    return { ...user, id: user._id || user.id };
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.patch('/auth/password', { currentPassword, newPassword });
  },

  async refreshTokens(): Promise<AuthTokens> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    const response = await api.post<any>('/auth/refresh', { refreshToken });
    const tokens = response.data?.tokens || response.data;
    tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    tokenManager.clearAll();
  },
};

export default authService;
