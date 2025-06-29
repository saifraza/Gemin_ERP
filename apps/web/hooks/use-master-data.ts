import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// Interfaces
export interface Company {
  id: string;
  name: string;
  code: string;
  email: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  panNumber?: string;
  _count?: {
    users: number;
    factories: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  company?: Company;
}

export interface Factory {
  id: string;
  name: string;
  code: string;
  type: string;
  location?: {
    city: string;
    state: string;
    address: string;
  };
  capacity?: any;
}

// Pagination params
interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API functions
const fetchCompanies = async (params: PaginationParams) => {
  const queryParams = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 20),
    ...(params.search && { search: params.search }),
    ...(params.sortBy && { sortBy: params.sortBy }),
    ...(params.sortOrder && { sortOrder: params.sortOrder }),
  });

  const res = await fetch(`${API_URL}/api/companies?${queryParams}`, {
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) throw new Error('Failed to fetch companies');
  const data = await res.json();
  
  // If API returns paginated format, return as-is
  // Otherwise, convert to expected format
  if (data.data && data.pagination) {
    return data;
  }
  
  // Legacy format - convert to paginated format
  return {
    data: Array.isArray(data) ? data : [],
    pagination: {
      page: params.page || 1,
      limit: params.limit || 20,
      total: Array.isArray(data) ? data.length : 0,
      totalPages: 1,
      hasMore: false,
      nextPage: null,
    }
  };
};

const fetchUsers = async (params: PaginationParams) => {
  const queryParams = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 20),
    ...(params.search && { search: params.search }),
    ...(params.sortBy && { sortBy: params.sortBy }),
    ...(params.sortOrder && { sortOrder: params.sortOrder }),
  });

  const res = await fetch(`${API_URL}/api/users?${queryParams}`, {
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  
  // If API returns paginated format, return as-is
  // Otherwise, convert to expected format
  if (data.data && data.pagination) {
    return data;
  }
  
  // Legacy format - convert to paginated format
  return {
    data: Array.isArray(data) ? data : [],
    pagination: {
      page: params.page || 1,
      limit: params.limit || 20,
      total: Array.isArray(data) ? data.length : 0,
      totalPages: 1,
      hasMore: false,
      nextPage: null,
    }
  };
};

const fetchFactories = async (params: PaginationParams) => {
  const queryParams = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || 20),
    ...(params.search && { search: params.search }),
    ...(params.sortBy && { sortBy: params.sortBy }),
    ...(params.sortOrder && { sortOrder: params.sortOrder }),
  });

  const res = await fetch(`${API_URL}/api/factories?${queryParams}`, {
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) throw new Error('Failed to fetch factories');
  const data = await res.json();
  
  // If API returns paginated format, return as-is
  // Otherwise, convert to expected format
  if (data.data && data.pagination) {
    return data;
  }
  
  // Legacy format - convert to paginated format
  return {
    data: Array.isArray(data) ? data : [],
    pagination: {
      page: params.page || 1,
      limit: params.limit || 20,
      total: Array.isArray(data) ? data.length : 0,
      totalPages: 1,
      hasMore: false,
      nextPage: null,
    }
  };
};

// Hooks
export const useCompanies = (params: PaginationParams = {}, options?: any) => {
  return useInfiniteQuery({
    queryKey: ['companies', params],
    queryFn: ({ pageParam }) => fetchCompanies({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      // Assuming API returns { data: [], hasMore: boolean, nextPage: number }
      return lastPage.pagination?.hasMore ? lastPage.pagination?.nextPage : undefined;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
};

export const useUsers = (params: PaginationParams = {}, options?: any) => {
  return useInfiniteQuery({
    queryKey: ['users', params],
    queryFn: ({ pageParam }) => fetchUsers({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      return lastPage.pagination?.hasMore ? lastPage.pagination?.nextPage : undefined;
    },
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });
};

export const useFactories = (params: PaginationParams = {}, options?: any) => {
  return useInfiniteQuery({
    queryKey: ['factories', params],
    queryFn: ({ pageParam }) => fetchFactories({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      return lastPage.pagination?.hasMore ? lastPage.pagination?.nextPage : undefined;
    },
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });
};

// Mutations
export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Company>) => {
      const res = await fetch(`${API_URL}/api/companies`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create company');
      }
      const responseData = await res.json();
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/api/companies/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete company');
      }
      const data = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Similar mutations for users and factories...
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create user');
      }
      const responseData = await res.json();
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useCreateFactory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_URL}/api/factories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create business unit');
      }
      const responseData = await res.json();
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factories'] });
      toast.success('Business unit created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};