import { useEffect, useState, useCallback } from 'react';

// Temporary implementation that doesn't use WebSocket
// This prevents errors while we set up the backend
export function useWebSocket() {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate connection for now
    const timer = setTimeout(() => {
      setIsConnected(false); // Keep disconnected for now
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const subscribe = useCallback((event: string, handler: (data: any) => void) => {
    // Return empty unsubscribe function
    return () => {};
  }, []);

  return { socket, isConnected, subscribe };
}