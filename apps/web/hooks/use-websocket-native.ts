import { useEffect, useState, useCallback, useRef } from 'react';

export function useWebSocket() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const listeners = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
    const token = localStorage.getItem('auth_token'); // Get auth token if needed
    
    const websocket = new WebSocket(`${wsUrl}/ws${token ? `?token=${token}` : ''}`);

    websocket.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    websocket.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const eventListeners = listeners.current.get(data.type);
        if (eventListeners) {
          eventListeners.forEach(listener => listener(data.data));
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const subscribe = useCallback((event: string, handler: (data: any) => void) => {
    if (!listeners.current.has(event)) {
      listeners.current.set(event, new Set());
    }
    listeners.current.get(event)!.add(handler);

    return () => {
      const eventListeners = listeners.current.get(event);
      if (eventListeners) {
        eventListeners.delete(handler);
        if (eventListeners.size === 0) {
          listeners.current.delete(event);
        }
      }
    };
  }, []);

  return { socket: ws, isConnected, subscribe };
}