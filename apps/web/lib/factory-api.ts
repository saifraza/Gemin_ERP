import { useAuthStore } from '@/stores/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class FactoryApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'FactoryApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new FactoryApiError(response.status, error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// Get auth headers with factory context
function getAuthHeaders(factoryId?: string): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  
  // Add factory context if provided
  if (factoryId) {
    headers['X-Factory-Id'] = factoryId;
  }
  
  return headers;
}

// Factory-aware API client
export const factoryApi = {
  // Get data with factory context
  async get<T>(endpoint: string, factoryId?: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        ...getAuthHeaders(factoryId),
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<T>(response);
  },

  // Post data with factory context
  async post<T>(endpoint: string, data: any, factoryId?: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(factoryId),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  // Put data with factory context
  async put<T>(endpoint: string, data: any, factoryId?: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(factoryId),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  // Delete with factory context
  async delete<T>(endpoint: string, factoryId?: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(factoryId),
    });
    return handleResponse<T>(response);
  },
};

// React hook for factory-aware API calls
export function useFactoryApi() {
  const currentFactory = useAuthStore((state) => state.currentFactory);
  
  return {
    get: <T>(endpoint: string) => factoryApi.get<T>(endpoint, currentFactory),
    post: <T>(endpoint: string, data: any) => factoryApi.post<T>(endpoint, data, currentFactory),
    put: <T>(endpoint: string, data: any) => factoryApi.put<T>(endpoint, data, currentFactory),
    delete: <T>(endpoint: string) => factoryApi.delete<T>(endpoint, currentFactory),
  };
}