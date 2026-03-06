import { Toaster } from 'sonner';
import { QueryProvider } from '@/components/providers/query-provider';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </QueryProvider>
  );
}
