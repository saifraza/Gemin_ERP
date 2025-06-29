'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Hook to get all roles
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/rbac/roles`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch roles');
      return res.json();
    }
  });
};

// Hook to create role
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_URL}/api/rbac/roles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create role');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
};

// Hook to get modules
export const useModules = () => {
  return useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/rbac/modules`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch modules');
      return res.json();
    }
  });
};

// Hook to get user permissions
export const useUserPermissions = (userId?: string) => {
  const { user } = useAuthStore();
  const effectiveUserId = userId || user?.id;
  
  return useQuery({
    queryKey: ['userPermissions', effectiveUserId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/rbac/users/${effectiveUserId}/permissions`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch user permissions');
      return res.json();
    },
    enabled: !!effectiveUserId
  });
};

// Hook to assign role to user
export const useAssignUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_URL}/api/rbac/users/roles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to assign role');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userPermissions', variables.userId] });
      toast.success('Role assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
};

// Hook to grant/revoke permission
export const useGrantPermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_URL}/api/rbac/users/permissions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update permission');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userPermissions', variables.userId] });
      toast.success(variables.granted ? 'Permission granted' : 'Permission revoked');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
};

// Hook to check permission
export const useHasPermission = (permissionCode: string, scope?: string, scopeId?: string) => {
  const { user } = useAuthStore();
  const { data: permissions } = useUserPermissions();
  
  if (!user || !permissions) return false;
  
  return permissions.permissions?.some((p: any) => {
    if (p.code !== permissionCode) return false;
    
    // Check scope hierarchy
    if (p.scope === 'GLOBAL') return true;
    if (p.scope === scope && (!scopeId || p.scopeId === scopeId)) return true;
    
    // Check if user has permission at a higher scope
    const scopeHierarchy = ['GLOBAL', 'COMPANY', 'FACTORY', 'DIVISION', 'DEPARTMENT'];
    const userScopeIndex = scopeHierarchy.indexOf(p.scope);
    const requestedScopeIndex = scopeHierarchy.indexOf(scope || 'GLOBAL');
    
    return userScopeIndex < requestedScopeIndex;
  }) || false;
};

// Permission component wrapper
export const Can = ({ 
  permission, 
  scope, 
  scopeId, 
  children,
  fallback = null 
}: {
  permission: string;
  scope?: string;
  scopeId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const hasPermission = useHasPermission(permission, scope, scopeId);
  
  return hasPermission ? <>{children}</> : <>{fallback}</>;
};