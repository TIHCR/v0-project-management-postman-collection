'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/components/providers/query-provider';
import { useAuthStore } from '@/store';
import { authService } from '@/services';
import { Loader2 } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, setUser, logout } = useAuthStore();

  useEffect(() => {
    // Check authentication by calling /auth/me
    authService
      .getMe()
      .then((user) => {
        setUser(user);
      })
      .catch(() => {
        logout();
        router.push('/login');
      });
  }, [router, setUser, logout]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <QueryProvider>
      {children}
      <Toaster position="top-right" richColors />
    </QueryProvider>
  );
}
