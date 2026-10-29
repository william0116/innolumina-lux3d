import { AuthProvider } from '@/contexts/AuthContext';
import { OrderProvider } from '@/contexts/OrderContext';
import { Toaster } from 'sonner';
import type { ReactNode } from 'react';

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <OrderProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast: 'bg-card text-foreground border border-border shadow-lg rounded-xl',
              title: 'font-medium',
              description: 'text-muted-foreground text-xs',
              success: 'border-success/30',
              error: 'border-destructive/30',
            },
          }}
        />
      </OrderProvider>
    </AuthProvider>
  );
}
