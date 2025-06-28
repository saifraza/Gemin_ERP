import { useState, useCallback } from 'react';

export function useMCP() {
  const [loading, setLoading] = useState(false);

  const askAI = useCallback(async (prompt: string, options?: any) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/mcp/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, ...options }),
      });
      
      if (!response.ok) throw new Error('Failed to get AI response');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('MCP Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { askAI, loading };
}