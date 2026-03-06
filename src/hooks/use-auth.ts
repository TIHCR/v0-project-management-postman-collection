'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services';
import { useAuthStore } from '@/store';
import type { LoginRequest, RegisterRequest } from '@/types';
import { toast } from 'sonner';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, login, logout, setUser } = useAuthStore();

  const { isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const userData = await authService.getMe();
      setUser(userData);
      return userData;
    },
    enabled: !!authService.getToken() && !user,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success('Welcome back!');
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });

  const handleLogout = () => {
    authService.logout();
    logout();
    queryClient.clear();
    router.push('/login');
    toast.success('Logged out successfully');
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoadingUser,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: handleLogout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
