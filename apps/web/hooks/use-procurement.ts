import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';

// Check if we're in the browser
const isBrowser = typeof window !== 'undefined';

// Types
interface MaterialIndent {
  id: string;
  indentNumber: string;
  companyId: string;
  factoryId: string;
  departmentId?: string;
  itemName: string;
  itemCode?: string;
  quantity: number;
  unit: string;
  requiredDate: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RFQ_CREATED' | 'PO_CREATED' | 'COMPLETED' | 'CANCELLED';
  description?: string;
  specifications?: string;
  requestedById: string;
  approvedById?: string;
  approvedDate?: string;
  rejectionReason?: string;
  factory: any;
  requestedBy: any;
  approvedBy?: any;
  rfqs?: any[];
  createdAt: string;
  updatedAt: string;
}

interface Vendor {
  id: string;
  code: string;
  name: string;
  companyId: string;
  category: string;
  email: string;
  phone: string;
  address: any;
  gstNumber?: string;
  panNumber?: string;
  bankDetails?: any;
  paymentTerms?: string;
  deliveryTerms?: string;
  rating: number;
  totalOrders: number;
  totalSpend: number;
  onTimeDelivery: number;
  qualityScore: number;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING_APPROVAL';
  certifications: string[];
  _count?: {
    quotations: number;
    purchaseOrders: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface RFQ {
  id: string;
  rfqNumber: string;
  companyId: string;
  title: string;
  indentId?: string;
  items: any;
  dueDate: string;
  deliveryDate?: string;
  terms?: string;
  instructions?: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  createdById: string;
  indent?: MaterialIndent;
  createdBy: any;
  vendors?: any[];
  quotations?: any[];
  _count?: {
    quotations: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  rfqId: string;
  vendorId: string;
  items: any;
  totalAmount: number;
  validUntil: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  warranty?: string;
  notes?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED_TO_PO';
  receivedDate: string;
  rfq: RFQ;
  vendor: Vendor;
  comparison?: any;
  purchaseOrder?: any;
  createdAt: string;
  updatedAt: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  companyId: string;
  vendorId: string;
  quotationId?: string;
  indentId?: string;
  items: any;
  totalAmount: number;
  paymentTerms?: string;
  deliveryTerms?: string;
  deliveryDate?: string;
  shippingAddress?: any;
  billingAddress?: any;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SENT' | 'ACKNOWLEDGED' | 'PARTIALLY_DELIVERED' | 'DELIVERED' | 'CANCELLED' | 'CLOSED';
  approvedById?: string;
  approvedDate?: string;
  createdById: string;
  vendor: Vendor;
  quotation?: Quotation;
  indent?: MaterialIndent;
  approvedBy?: any;
  createdBy: any;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Material Indents
export const useIndents = (params?: {
  status?: string;
  priority?: string;
  factoryId?: string;
  page?: number;
  limit?: number;
}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['indents', params],
    queryFn: async () => {
      if (!user?.token) throw new Error('No authentication token');
      
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.priority) queryParams.append('priority', params.priority);
      if (params?.factoryId) queryParams.append('factoryId', params.factoryId);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await fetch(`/api/procurement/indents?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch indents');
      return response.json() as Promise<PaginatedResponse<MaterialIndent>>;
    },
    enabled: !!user?.token,
  });
};

export const useIndent = (id: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['indent', id],
    queryFn: async () => {
      const response = await fetch(`/api/procurement/indents/${id}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch indent');
      return response.json() as Promise<MaterialIndent>;
    },
    enabled: !!user?.token && !!id,
  });
};

interface CreateIndentData {
  itemName: string;
  itemCode?: string;
  quantity: number;
  unit: string;
  factoryId: string;
  departmentId?: string;
  requiredDate: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  description?: string;
  specifications?: string;
}

export const useCreateIndent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateIndentData) => {
      const response = await fetch('/api/procurement/indents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to create indent');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indents'] });
    },
  });
};

// Vendors
export const useVendors = (params?: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['vendors', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await fetch(`/api/procurement/vendors?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch vendors');
      return response.json() as Promise<PaginatedResponse<Vendor>>;
    },
    enabled: !!user?.token,
  });
};

export const useVendor = (id: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      const response = await fetch(`/api/procurement/vendors/${id}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch vendor');
      return response.json() as Promise<Vendor>;
    },
    enabled: !!user?.token && !!id,
  });
};

// RFQs
export const useRFQs = (params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['rfqs', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await fetch(`/api/procurement/rfqs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch RFQs');
      return response.json() as Promise<PaginatedResponse<RFQ>>;
    },
    enabled: !!user?.token,
  });
};

export const useCreateRFQ = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      indentId?: string;
      items: any[];
      dueDate: string;
      deliveryDate?: string;
      terms?: string;
      instructions?: string;
      vendorIds: string[];
    }) => {
      const response = await fetch('/api/procurement/rfqs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to create RFQ');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['indents'] });
    },
  });
};

// Quotations
export const useQuotations = (params?: {
  rfqId?: string;
  vendorId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['quotations', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.rfqId) queryParams.append('rfqId', params.rfqId);
      if (params?.vendorId) queryParams.append('vendorId', params.vendorId);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await fetch(`/api/procurement/quotations?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch quotations');
      return response.json() as Promise<PaginatedResponse<Quotation>>;
    },
    enabled: !!user?.token,
  });
};

export const useCompareQuotations = () => {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      rfqId: string;
      weights?: {
        price: number;
        delivery: number;
        quality: number;
        vendor: number;
      };
    }) => {
      const response = await fetch('/api/procurement/quotations/compare', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to compare quotations');
      return response.json();
    },
  });
};

// Purchase Orders
export const usePurchaseOrders = (params?: {
  status?: string;
  vendorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['purchase-orders', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.vendorId) queryParams.append('vendorId', params.vendorId);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const response = await fetch(`/api/procurement/purchase-orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch purchase orders');
      return response.json() as Promise<PaginatedResponse<PurchaseOrder>>;
    },
    enabled: !!user?.token,
  });
};

export const useCreatePurchaseOrder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/procurement/purchase-orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to create purchase order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['indents'] });
    },
  });
};

// Dashboard Stats
export const useProcurementStats = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['procurement-stats'],
    queryFn: async () => {
      const response = await fetch('/api/procurement/stats/dashboard', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch procurement stats');
      return response.json();
    },
    enabled: !!user?.token,
  });
};

// Approvals
export const useApproveIndent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, approved, rejectionReason }: { id: string; approved: boolean; rejectionReason?: string }) => {
      const response = await fetch(`/api/procurement/indents/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved, rejectionReason }),
      });
      
      if (!response.ok) throw new Error('Failed to process approval');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indents'] });
    },
  });
};

export const useApprovePurchaseOrder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, approved, remarks }: { id: string; approved: boolean; remarks?: string }) => {
      const response = await fetch(`/api/procurement/purchase-orders/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved, remarks }),
      });
      
      if (!response.ok) throw new Error('Failed to process approval');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};