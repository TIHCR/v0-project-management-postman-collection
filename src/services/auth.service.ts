import { apiClient } from '@/lib/api-client';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  async getMe(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  logout(): void {
    localStorage.removeItem('auth_token');
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
