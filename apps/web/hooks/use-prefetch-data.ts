'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') {
    return {
      'Content-Type': 'application/json',
    };
  }
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Safe wrapper for React Query hooks during SSR
function useQueryClientSafe() {
  try {
    return useQueryClient();
  } catch {
    return null;
  }
}

export const usePrefetchMasterData = () => {
  const queryClient = useQueryClientSafe();

  useEffect(() => {
    // Only run on client side and if queryClient is available
    if (typeof window === 'undefined' || !queryClient) return;

    // Prefetch companies data for dropdowns
    queryClient.prefetchInfiniteQuery({
      queryKey: ['companies', { search: '' }],
      queryFn: async () => {
        const res = await fetch(`${API_URL}/api/companies?page=1&limit=20`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to fetch companies');
        const data = await res.json();
        return {
          data: Array.isArray(data) ? data : [],
          pagination: {
            page: 1,
            limit: 20,
            total: Array.isArray(data) ? data.length : 0,
            totalPages: 1,
            hasMore: false,
            nextPage: null,
          }
        };
      },
      initialPageParam: 1,
      getNextPageParam: () => undefined,
    });

    // Prefetch initial users data
    queryClient.prefetchInfiniteQuery({
      queryKey: ['users', { search: '' }],
      queryFn: async () => {
        const res = await fetch(`${API_URL}/api/users?page=1&limit=20`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        return {
          data: Array.isArray(data) ? data : [],
          pagination: {
            page: 1,
            limit: 20,
            total: Array.isArray(data) ? data.length : 0,
            totalPages: 1,
            hasMore: false,
            nextPage: null,
          }
        };
      },
      initialPageParam: 1,
      getNextPageParam: () => undefined,
    });

    // Prefetch initial factories data
    queryClient.prefetchInfiniteQuery({
      queryKey: ['factories', { search: '' }],
      queryFn: async () => {
        const res = await fetch(`${API_URL}/api/factories?page=1&limit=20`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to fetch factories');
        const data = await res.json();
        return {
          data: Array.isArray(data) ? data : [],
          pagination: {
            page: 1,
            limit: 20,
            total: Array.isArray(data) ? data.length : 0,
            totalPages: 1,
            hasMore: false,
            nextPage: null,
          }
        };
      },
      initialPageParam: 1,
      getNextPageParam: () => undefined,
    });
  }, [queryClient]);
};

// Hook to get summary data for dashboard
export const useMasterDataSummary = () => {
  const [counts, setCounts] = useState({
    companiesCount: 0,
    usersCount: 0,
    factoriesCount: 0,
  });
  
  const queryClient = useQueryClientSafe();

  useEffect(() => {
    if (typeof window === 'undefined' || !queryClient) return;

    const updateCounts = () => {
      try {
        const companiesData = queryClient.getQueryData(['companies', { search: '' }]) as any;
        const usersData = queryClient.getQueryData(['users', { search: '' }]) as any;
        const factoriesData = queryClient.getQueryData(['factories', { search: '' }]) as any;

        setCounts({
          companiesCount: companiesData?.pages?.[0]?.pagination?.total || 0,
          usersCount: usersData?.pages?.[0]?.pagination?.total || 0,
          factoriesCount: factoriesData?.pages?.[0]?.pagination?.total || 0,
        });
      } catch (error) {
        console.error('Error updating counts:', error);
      }
    };

    // Update counts immediately
    updateCounts();

    // Subscribe to query changes
    const unsubscribeCompanies = queryClient.getQueryCache().subscribe(() => updateCounts());
    
    return () => {
      unsubscribeCompanies();
    };
  }, [queryClient]);

  return counts;
};