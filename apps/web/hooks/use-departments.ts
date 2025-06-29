import { useQuery } from '@tanstack/react-query';
import { useAuth } from './use-auth';

interface Department {
  id: string;
  name: string;
  code: string;
  factoryId?: string;
  companyId: string;
  parentId?: string;
}

export const useDepartments = (factoryId?: string) => {
  const { user } = useAuth();

  return useQuery<Department[]>({
    queryKey: ['departments', factoryId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (factoryId) params.append('factoryId', factoryId);

      const response = await fetch(`/api/departments?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }

      const data = await response.json();
      return data.departments || data || [];
    },
    enabled: !!user?.token,
  });
};

export const useDepartment = (id: string) => {
  const { user } = useAuth();

  return useQuery<Department>({
    queryKey: ['department', id],
    queryFn: async () => {
      const response = await fetch(`/api/departments/${id}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch department');
      }

      return response.json();
    },
    enabled: !!user?.token && !!id,
  });
};