import { Toaster } from 'sonner';
import { QueryProvider } from '@/components/providers/query-provider';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <div className="fixed inset-0 flex">
        {children}
      </div>
      <Toaster position="top-right" richColors />
    </QueryProvider>
  );
}