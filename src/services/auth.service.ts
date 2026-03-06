import { apiClient } from '@/lib/api-client';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  async getMe(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {});
    } catch {
      // Ignore errors on logout
    }
  },
};
