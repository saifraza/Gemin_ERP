'use client';

import { useEffect, useState } from 'react';

export function useClientOnly<T>(
  clientOnlyHook: () => T,
  defaultValue: T
): T {
  const [value, setValue] = useState<T>(defaultValue);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const result = clientOnlyHook();
        setValue(result);
      } catch (error) {
        console.error('Error in client-only hook:', error);
      }
    }
  }, [isClient, clientOnlyHook]);

  return value;
}