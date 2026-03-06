'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services';
import { useAuthStore } from '@/store';
import type { LoginRequest, RegisterRequest } from '@/types';
import { toast } from 'sonner';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading, setUser, logout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      setUser(data.user);
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
      setUser(data.user);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });

  const handleLogout = async () => {
    await authService.logout();
    logout();
    queryClient.clear();
    router.push('/login');
    toast.success('Logged out successfully');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: handleLogout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
