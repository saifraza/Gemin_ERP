import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

interface Material {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  subCategory?: string;
  unit: string;
  alternateUnits?: Array<{
    unit: string;
    conversionFactor: number;
  }>;
  specifications?: Record<string, any>;
  hsnCode?: string;
  minStockLevel: number;
  maxStockLevel?: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  leadTimeDays: number;
  standardCost?: number;
  lastPurchasePrice?: number;
  averageCost?: number;
  type: string;
  isActive: boolean;
  isCritical: boolean;
  isHazardous: boolean;
  companyId?: string;
  company?: {
    id: string;
    name: string;
  };
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    username: string;
  };
  preferredVendors?: string[];
  warehouseLocations?: any;
  createdAt: string;
  updatedAt: string;
}

interface MaterialsResponse {
  materials: Material[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface MaterialsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  type?: string;
  companyId?: string;
  includeCommon?: boolean;
}

export const useMaterials = (params?: MaterialsParams) => {
  const { user } = useAuth();

  return useQuery<MaterialsResponse>({
    queryKey: ['materials', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.companyId) queryParams.append('companyId', params.companyId);
      if (params?.includeCommon !== undefined) queryParams.append('includeCommon', params.includeCommon.toString());

      const response = await fetch(`/api/materials?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch materials');
      }

      return response.json();
    },
    enabled: !!user?.token,
  });
};

export const useMaterial = (id: string) => {
  const { user } = useAuth();

  return useQuery<Material>({
    queryKey: ['material', id],
    queryFn: async () => {
      const response = await fetch(`/api/materials/${id}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch material');
      }

      return response.json();
    },
    enabled: !!user?.token && !!id,
  });
};

export const useCreateMaterial = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Material>) => {
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create material');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateMaterial = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Material> }) => {
      const response = await fetch(`/api/materials/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update material');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['material', data.id] });
      toast.success('Material updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteMaterial = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete material');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useBulkImportMaterials = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (materials: Partial<Material>[]) => {
      const response = await fetch('/api/materials/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ materials }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import materials');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success(`Imported ${data.success} materials successfully`);
      if (data.failed > 0) {
        toast.warning(`${data.failed} materials failed to import`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useMaterialCategories = () => {
  const { user } = useAuth();

  return useQuery<Array<{ category: string; count: number }>>({
    queryKey: ['material-categories'],
    queryFn: async () => {
      const response = await fetch('/api/materials/stats/categories', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch material categories');
      }

      return response.json();
    },
    enabled: !!user?.token,
  });
};