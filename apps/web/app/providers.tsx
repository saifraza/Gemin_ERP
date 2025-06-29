'use client';

import { ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Only import devtools in development
let ReactQueryDevtools: any = () => null;
if (process.env.NODE_ENV === 'development') {
  ReactQueryDevtools = require('@tanstack/react-query-devtools').ReactQueryDevtools;
}
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: ReactNode;
}

// Create a client outside of the component to prevent recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: Data is fresh for 1 minute
      staleTime: 60 * 1000,
      // Cache time: Keep in cache for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Refetch on window focus
      refetchOnWindowFocus: true,
    },
  },
});

export function Providers({ children }: ProvidersProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent hydration mismatch by ensuring client-only code runs after mount
  if (!isClient) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="top-right" />
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}