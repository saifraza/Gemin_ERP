'use client';

import { ReactNode, useEffect, useState } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent hydration mismatch by ensuring client-only code runs after mount
  if (!isClient) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return <>{children}</>;
}