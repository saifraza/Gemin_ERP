const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(response.status, error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ token: string; user: any }>(response);
  },

  async register(data: any) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ user: any }>(response);
  },

  // Companies
  async getCompanies() {
    const response = await fetch(`${API_URL}/api/companies`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(response);
  },

  async createCompany(data: any) {
    const response = await fetch(`${API_URL}/api/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(response);
  },

  // Users
  async getUsers() {
    const response = await fetch(`${API_URL}/api/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(response);
  },

  // Test endpoints
  async testConnection() {
    const response = await fetch(`${API_URL}/health`);
    return handleResponse<any>(response);
  },

  async testAuth() {
    const response = await fetch(`${API_URL}/api/auth/health`);
    return handleResponse<any>(response);
  },
};

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}