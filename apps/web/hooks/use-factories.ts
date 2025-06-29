import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';

interface Factory {
  id: string;
  name: string;
  code: string;
  divisionId: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
  division?: {
    id: string;
    name: string;
  };
}

export const useFactories = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['factories'],
    queryFn: async () => {
      const response = await fetch('/api/factories', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch factories');
      return response.json() as Promise<Factory[]>;
    },
    enabled: !!user?.token,
  });
};