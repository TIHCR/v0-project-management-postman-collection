'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/components/providers/query-provider';
import { useAuthStore } from '@/store';
import { authService } from '@/services';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user data if we have a token but no user
    if (token && !isAuthenticated) {
      authService
        .getMe()
        .then((user) => {
          setUser(user);
        })
        .catch(() => {
          authService.logout();
          router.push('/login');
        });
    }
  }, [isAuthenticated, router, setUser]);

  return (
    <QueryProvider>
      {children}
      <Toaster position="top-right" richColors />
    </QueryProvider>
  );
}
