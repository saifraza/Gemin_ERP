'use client';

import { Suspense, useState, useCallback, memo, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Building2,
  Users,
  Factory,
  BarChart3,
  Network,
  Shield,
  FileSpreadsheet,
  X
} from 'lucide-react';
import {
  useCompanies,
  useUsers,
  useFactories,
  useCreateCompany,
  useCreateUser,
  useCreateFactory,
  useDeleteCompany,
  useDivisions,
  useCreateDivision,
} from '@/hooks/use-master-data';
import { usePrefetchMasterData } from '@/hooks/use-prefetch-data';
import { useRoles, useModules, useUserPermissions, useAssignUserRole, useCreateRole } from '@/hooks/use-rbac';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Memoized tab component for better performance
const TabButton = memo(({ 
  isActive, 
  onClick, 
  icon, 
  label, 
  count 
}: { 
  isActive: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
  count?: number;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
      isActive
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    {icon}
    {label}
    {count !== undefined && (
      <Badge variant="secondary" className="ml-1">
        {count}
      </Badge>
    )}
  </button>
));

TabButton.displayName = 'TabButton';

// Business types
const businessTypes = [
  'Sugar Manufacturing',
  'Integrated Sugar Complex',
  'Distillery',
  'Co-generation Plant',
  'Manufacturing',
  'Retail',
  'Services',
  'Technology',
  'Healthcare',
  'Construction',
  'Energy',
  'Logistics',
  'Finance',
  'Real Estate',
  'Agriculture',
  'Mining',
  'Telecommunications',
  'Media',
  'Education',
  'Hospitality',
  'Transportation',
  'Utilities',
  'Pharmaceutical',
  'Automotive'
];

// Indian states
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Division types by business unit type
const divisionTypesByBusiness: Record<string, Array<{value: string; label: string; code: string}>> = {
  'SUGAR_ONLY': [
    { value: 'MILLING', label: 'Milling', code: 'MIL' },
    { value: 'BOILING', label: 'Boiling House', code: 'BOI' },
    { value: 'PACKING', label: 'Packing & Storage', code: 'PCK' },
    { value: 'QUALITY', label: 'Quality Control', code: 'QC' },
    { value: 'MAINTENANCE', label: 'Maintenance', code: 'MNT' }
  ],
  'DISTILLERY': [
    { value: 'CORN_STORAGE', label: 'Corn Storage', code: 'CST' },
    { value: 'MILLING', label: 'Milling', code: 'MIL' },
    { value: 'FERMENTATION', label: 'Fermentation', code: 'FRM' },
    { value: 'DISTILLATION', label: 'Distillation', code: 'DST' },
    { value: 'EVAPORATION', label: 'Evaporation', code: 'EVP' },
    { value: 'DDGS', label: 'DDGS Processing', code: 'DDG' },
    { value: 'QUALITY', label: 'Quality Control', code: 'QC' }
  ],
  'COGEN': [
    { value: 'BOILER', label: 'Boiler House', code: 'BLR' },
    { value: 'TURBINE', label: 'Turbine House', code: 'TRB' },
    { value: 'ELECTRICAL', label: 'Electrical', code: 'ELC' },
    { value: 'WATER_TREATMENT', label: 'Water Treatment', code: 'WTP' },
    { value: 'ASH_HANDLING', label: 'Ash Handling', code: 'ASH' }
  ],
  'INTEGRATED': [
    // Sugar divisions
    { value: 'SUGAR_MILLING', label: 'Sugar - Milling', code: 'S-MIL' },
    { value: 'SUGAR_BOILING', label: 'Sugar - Boiling House', code: 'S-BOI' },
    { value: 'SUGAR_PACKING', label: 'Sugar - Packing', code: 'S-PCK' },
    // Ethanol divisions
    { value: 'ETH_FERMENTATION', label: 'Ethanol - Fermentation', code: 'E-FRM' },
    { value: 'ETH_DISTILLATION', label: 'Ethanol - Distillation', code: 'E-DST' },
    // Power divisions
    { value: 'POWER_GENERATION', label: 'Power - Generation', code: 'P-GEN' },
    // Common
    { value: 'COMMON', label: 'Common Services', code: 'CMN' }
  ]
};

function MasterDataContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || 'companies');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Create modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState<any>({
    location: {
      address: '',
      city: '',
      state: ''
    }
  });
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<'single' | 'bulk'>('single');
  const [bulkData, setBulkData] = useState<any[]>([]);
  
  // Prefetch master data to ensure data is ready
  usePrefetchMasterData();

  // Update activeTab when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    router.push(`/master-data?tab=${tab}`);
  }, [router]);

  // Debounce search input
  const debounceTimer = useRef<NodeJS.Timeout>();
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  }, []);

  // Smart data fetching - prefetch required data
  const [dataFetched, setDataFetched] = useState({
    companies: false,
    users: false,
    factories: false
  });

  // Always fetch companies data as it's needed for dropdowns
  const {
    data: companiesData,
    fetchNextPage: fetchNextCompanies,
    hasNextPage: hasMoreCompanies,
    isFetchingNextPage: isFetchingCompanies,
    refetch: refetchCompanies,
    isLoading: loadingCompanies,
  } = useCompanies({ search: debouncedSearch }, { 
    enabled: true, // Always enabled for dropdown dependencies
    onSuccess: () => setDataFetched(prev => ({ ...prev, companies: true }))
  });

  const {
    data: usersData,
    fetchNextPage: fetchNextUsers,
    hasNextPage: hasMoreUsers,
    isFetchingNextPage: isFetchingUsers,
    refetch: refetchUsers,
    isLoading: loadingUsers,
  } = useUsers({ search: debouncedSearch }, { 
    enabled: activeTab === 'users' || !dataFetched.users,
    onSuccess: () => setDataFetched(prev => ({ ...prev, users: true }))
  });

  const {
    data: factoriesData,
    fetchNextPage: fetchNextFactories,
    hasNextPage: hasMoreFactories,
    isFetchingNextPage: isFetchingFactories,
    refetch: refetchFactories,
    isLoading: loadingFactories,
  } = useFactories({ search: debouncedSearch }, { 
    enabled: activeTab === 'factories' || activeTab === 'divisions' || !dataFetched.factories,
    onSuccess: () => setDataFetched(prev => ({ ...prev, factories: true }))
  });

  // Flatten paginated data
  const companies = companiesData?.pages.flatMap((page: any) => page.data) || [];
  const users = usersData?.pages.flatMap((page: any) => page.data) || [];
  const factories = factoriesData?.pages.flatMap((page: any) => page.data) || [];

  // Mutations
  const createCompany = useCreateCompany();
  const createUser = useCreateUser();
  const createFactory = useCreateFactory();
  const createDivision = useCreateDivision();
  const deleteCompany = useDeleteCompany();
  
  // Division data
  const { data: divisions } = useDivisions(selectedBusinessUnit || undefined);
  
  // Handle bulk create
  const handleBulkCreate = async () => {
    try {
      const validRows = bulkData.filter(row => {
        if (activeTab === 'companies') {
          return row.name && row.email;
        } else if (activeTab === 'users') {
          return row.name && row.username && row.email && row.password && row.companyId;
        } else if (activeTab === 'factories') {
          return row.name && row.type && row.companyId;
        }
        return false;
      });

      if (validRows.length === 0) {
        toast.error('Please fill in all required fields for at least one row');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        try {
          // Generate unique code for each item
          const codeType = activeTab === 'factories' ? 'business' : activeTab === 'companies' ? 'company' : 'user';
          const code = await generateCode(codeType);
          
          if (activeTab === 'companies') {
            await createCompany.mutateAsync({ ...row, code });
          } else if (activeTab === 'users') {
            await createUser.mutateAsync(row);
          } else if (activeTab === 'factories') {
            // Process factory data same as single create
            let factoryType = 'INTEGRATED';
            switch (row.type) {
              case 'Sugar Manufacturing':
                factoryType = 'SUGAR_ONLY';
                break;
              case 'Integrated Sugar Complex':
                factoryType = 'INTEGRATED';
                break;
              case 'Distillery':
                factoryType = 'DISTILLERY';
                break;
              case 'Co-generation Plant':
                factoryType = 'COGEN';
                break;
            }
            
            const location = {
              address: row.location?.address || '',
              city: row.location?.city || '',
              state: row.location?.state || '',
              country: 'India',
              postalCode: ''
            };
            
            const factoryData = {
              name: row.name,
              code: code,
              type: factoryType,
              companyId: row.companyId,
              location: location,
              capacity: { sugar: 0, ethanol: 0, power: 0, feed: 0 }
            };
            
            await createFactory.mutateAsync(factoryData);
          }
          successCount++;
        } catch (error) {
          errorCount++;
          console.error('Error creating row:', error);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} ${activeTab}`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to create ${errorCount} ${activeTab}`);
      }

      if (successCount > 0) {
        setShowCreateModal(false);
        setBulkData([]);
      }
    } catch (error) {
      console.error('Error in bulk create:', error);
      toast.error('An error occurred during bulk creation');
    }
  };

  // Handle create
  const handleCreate = async () => {
    if (createMode === 'bulk') {
      return handleBulkCreate();
    }

    try {
      if (activeTab === 'companies') {
        // Validate required fields
        if (!createFormData.name) {
          toast.error('Please fill in all required fields');
          return;
        }
        // Generate code if not provided
        let code = createFormData.code;
        if (!code) {
          code = await generateCode('company');
        }
        await createCompany.mutateAsync({ ...createFormData, code });
      } else if (activeTab === 'users') {
        // Validate required fields
        if (!createFormData.name || !createFormData.username || !createFormData.email || !createFormData.password) {
          toast.error('Please fill in all required fields');
          return;
        }
        await createUser.mutateAsync(createFormData);
      } else if (activeTab === 'factories') {
        // Ensure required fields are provided
        if (!createFormData.name || !createFormData.type || !createFormData.companyId) {
          toast.error('Please fill in all required fields');
          return;
        }
        
        // Generate code if not provided
        let code = createFormData.code;
        if (!code) {
          code = await generateCode('business');
        }
        
        // Map business type to factory type
        let factoryType = 'INTEGRATED';
        switch (createFormData.type) {
          case 'Sugar Manufacturing':
            factoryType = 'SUGAR_ONLY';
            break;
          case 'Integrated Sugar Complex':
            factoryType = 'INTEGRATED';
            break;
          case 'Distillery':
            factoryType = 'DISTILLERY';
            break;
          case 'Co-generation Plant':
            factoryType = 'COGEN';
            break;
          default:
            factoryType = 'INTEGRATED';
        }
        
        // Prepare capacity based on type
        let capacity: any = { sugar: 0, ethanol: 0, power: 0, feed: 0 };
        
        if (createFormData.capacity) {
          const capacityStr = createFormData.capacity.toString();
          const value = parseInt(capacityStr.replace(/[^0-9]/g, ''), 10) || 0;
          
          if (createFormData.type === 'Sugar Manufacturing' || createFormData.type === 'Integrated Sugar Complex') {
            capacity.sugar = value; // TCD
          } else if (createFormData.type === 'Distillery') {
            capacity.ethanol = value; // KLPD
          } else if (createFormData.type === 'Co-generation Plant') {
            capacity.power = value; // MW
          } else {
            // For other types, just use default values
            // The capacity string is stored in the capacity field on the form
          }
        }
        
        // Ensure location has all required fields
        const location = {
          address: createFormData.location?.address || '',
          city: createFormData.location?.city || '',
          state: createFormData.location?.state || '',
          country: 'India', // Default to India
          postalCode: '' // Optional
        };
        
        const factoryData = {
          name: createFormData.name,
          code: code,
          type: factoryType,
          companyId: createFormData.companyId,
          location: location,
          capacity: capacity
        };
        
        await createFactory.mutateAsync(factoryData);
      } else if (activeTab === 'divisions') {
        // Ensure required fields are provided
        if (!createFormData.name || !createFormData.factoryId) {
          toast.error('Please fill in all required fields');
          return;
        }
        
        // Generate code if not provided
        let code = createFormData.code;
        if (!code) {
          // Use a custom code generation for divisions
          const divPrefix = 'DIV';
          const timestamp = Date.now().toString().slice(-4);
          code = `${divPrefix}${timestamp}`;
        }
        
        // Map division code to appropriate type
        let divType = 'COMMON';
        if (code.startsWith('MIL') || code.startsWith('S-MIL')) divType = 'SUGAR';
        else if (code.startsWith('BOI') || code.startsWith('S-BOI')) divType = 'SUGAR';
        else if (code.startsWith('PCK') || code.startsWith('S-PCK')) divType = 'SUGAR';
        else if (code.startsWith('FRM') || code.startsWith('E-FRM')) divType = 'ETHANOL';
        else if (code.startsWith('DST') || code.startsWith('E-DST')) divType = 'ETHANOL';
        else if (code.startsWith('CST') || code.startsWith('EVP') || code.startsWith('DDG')) divType = 'ETHANOL';
        else if (code.startsWith('BLR') || code.startsWith('TRB') || code.startsWith('P-GEN')) divType = 'POWER';
        else if (code.startsWith('ELC') || code.startsWith('WTP') || code.startsWith('ASH')) divType = 'POWER';
        
        const divisionData = {
          name: createFormData.name,
          code: code,
          type: divType,
          factoryId: createFormData.factoryId,
          isActive: createFormData.isActive !== false
        };
        
        await createDivision.mutateAsync(divisionData);
      }
      setShowCreateModal(false);
      setCreateFormData({
        location: {
          address: '',
          city: '',
          state: ''
        }
      });
    } catch (error) {
      console.error('Error creating entity:', error);
    }
  };
  
  // Generate sequential codes for master data
  const generateCode = async (type: 'company' | 'user' | 'business') => {
    try {
      let prefix = '';
      let data: any[] = [];
      
      switch (type) {
        case 'company':
          prefix = 'COMP';
          data = companies;
          break;
        case 'user':
          prefix = 'USR';
          data = users;
          break;
        case 'business':
          prefix = 'BU';
          data = factories;
          break;
      }
      
      // Find the highest number in existing codes
      let maxNumber = 0;
      data.forEach((item: any) => {
        if (item.code && item.code.startsWith(prefix)) {
          const numPart = item.code.replace(prefix, '').replace(/\D/g, '');
          const num = parseInt(numPart, 10);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      });
      
      // Generate new code with padded number
      const newNumber = maxNumber + 1;
      return `${prefix}${String(newNumber).padStart(4, '0')}`;
    } catch (error) {
      // Fallback to timestamp-based code if there's an error
      return `${type.toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
    }
  };

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    try {
      toast.info('Refreshing all data...');
      await Promise.all([
        refetchCompanies(),
        refetchUsers(), 
        refetchFactories()
      ]);
      toast.success('All data refreshed');
    } catch (error) {
      toast.error('Failed to refresh some data');
    }
  }, [refetchCompanies, refetchUsers, refetchFactories]);

  // Export functionality
  const handleExport = useCallback(async () => {
    try {
      const endpoint = activeTab === 'companies' ? 'companies' : 
                      activeTab === 'users' ? 'users' : 'factories';
      
      const response = await fetch(`/api/${endpoint}/export`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${endpoint}-${new Date().toISOString()}.csv`;
      a.click();
      
      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Export failed');
    }
  }, [activeTab]);

  // Column definitions
  const companyColumns = [
    { key: 'name', label: 'Company Name', width: '25%' },
    { key: 'code', label: 'Code', width: '15%' },
    { key: 'email', label: 'Email', width: '25%' },
    { 
      key: 'stats', 
      label: 'Stats', 
      width: '20%',
      render: (company: any) => (
        <div className="flex gap-3 text-sm">
          <span className="text-blue-600">{company._count?.users || 0} Users</span>
          <span className="text-green-600">{company._count?.factories || 0} Units</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '15%',
      render: (company: any) => (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => deleteCompany.mutate(company.id)}
        >
          Delete
        </Button>
      )
    }
  ];

  const userColumns = [
    { key: 'name', label: 'Name', width: '20%' },
    { key: 'username', label: 'Username', width: '15%' },
    { key: 'email', label: 'Email', width: '25%' },
    { key: 'role', label: 'Role', width: '15%' },
    { 
      key: 'company', 
      label: 'Company', 
      width: '15%',
      render: (user: any) => user.company?.name || '-'
    },
    {
      key: 'status',
      label: 'Status',
      width: '10%',
      render: (user: any) => (
        <Badge variant={user.isActive ? 'default' : 'secondary'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  const factoryColumns = [
    { key: 'name', label: 'Business Unit', width: '25%' },
    { key: 'code', label: 'Code', width: '15%' },
    { key: 'type', label: 'Type', width: '20%' },
    { 
      key: 'location', 
      label: 'Location', 
      width: '25%',
      render: (factory: any) => `${factory.location?.city || ''}, ${factory.location?.state || ''}`
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '15%',
      render: (factory: any) => (
        <Button size="sm" variant="outline">Edit</Button>
      )
    }
  ];

  // Stats cards
  const stats = [
    { 
      label: 'Total Companies', 
      value: (companiesData?.pages?.[0] as any)?.pagination?.total || 0,
      icon: <Building2 className="w-5 h-5" />,
      color: 'text-blue-600'
    },
    { 
      label: 'Total Users', 
      value: (usersData?.pages?.[0] as any)?.pagination?.total || 0,
      icon: <Users className="w-5 h-5" />,
      color: 'text-green-600'
    },
    { 
      label: 'Business Units', 
      value: (factoriesData?.pages?.[0] as any)?.pagination?.total || 0,
      icon: <Factory className="w-5 h-5" />,
      color: 'text-purple-600'
    },
    { 
      label: 'Data Quality', 
      value: '98%',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-orange-600'
    },
  ];

  // Prepare AI assistant data
  const aiAssistantData = {
    activeTab,
    searchQuery: debouncedSearch,
    stats: {
      companies: (companiesData?.pages?.[0] as any)?.pagination?.total || 0,
      users: (usersData?.pages?.[0] as any)?.pagination?.total || 0,
      businessUnits: (factoriesData?.pages?.[0] as any)?.pagination?.total || 0,
    },
    currentData: activeTab === 'companies' ? companies.slice(0, 10) : // Send only first 10 records to optimize tokens
                 activeTab === 'users' ? users.slice(0, 10) :
                 activeTab === 'factories' ? factories.slice(0, 10) : [],
    dataColumns: activeTab === 'companies' ? companyColumns :
                 activeTab === 'users' ? userColumns :
                 activeTab === 'factories' ? factoryColumns : [],
  };

  return (
    <DashboardLayout aiAssistantData={aiAssistantData}>
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Master Data Management</h1>
          <p className="text-gray-600 mt-1">Centralized data management with real-time sync</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color}`}>{stat.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <TabButton
            isActive={activeTab === 'companies'}
            onClick={() => handleTabChange('companies')}
            icon={<Building2 className="w-4 h-4" />}
            label="Companies"
            count={(companiesData?.pages?.[0] as any)?.pagination?.total}
          />
          <TabButton
            isActive={activeTab === 'users'}
            onClick={() => handleTabChange('users')}
            icon={<Users className="w-4 h-4" />}
            label="Users"
            count={(usersData?.pages?.[0] as any)?.pagination?.total}
          />
          <TabButton
            isActive={activeTab === 'factories'}
            onClick={() => handleTabChange('factories')}
            icon={<Factory className="w-4 h-4" />}
            label="Business Units"
            count={(factoriesData?.pages?.[0] as any)?.pagination?.total}
          />
          <TabButton
            isActive={activeTab === 'divisions'}
            onClick={() => handleTabChange('divisions')}
            icon={<Network className="w-4 h-4" />}
            label="Divisions"
            count={(factories.reduce((acc: number, f: any) => acc + (f._count?.divisions || 0), 0))}
          />
          <TabButton
            isActive={activeTab === 'access'}
            onClick={() => handleTabChange('access')}
            icon={<Shield className="w-4 h-4" />}
            label="Access Control"
          />
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-[300px]"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (activeTab === 'companies') refetchCompanies();
                else if (activeTab === 'users') refetchUsers();
                else if (activeTab === 'factories') refetchFactories();
                else if (activeTab === 'divisions') refreshAllData();
                else refreshAllData();
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {activeTab !== 'divisions' && activeTab !== 'access' && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setCreateMode('bulk');
                  setBulkData(Array(5).fill(null).map(() => ({
                    name: '',
                    code: '',
                    email: '',
                    ...(activeTab === 'users' && { username: '', password: '', role: 'OPERATOR' }),
                    ...(activeTab === 'factories' && { type: 'INTEGRATED', companyId: '', location: { city: '', state: '', address: '' } }),
                  })));
                  setShowCreateModal(true);
                }}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
            )}
            <Button onClick={() => {
              setCreateMode('single');
              setShowCreateModal(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add {activeTab === 'companies' ? 'Company' : activeTab === 'users' ? 'User' : activeTab === 'factories' ? 'Business' : activeTab === 'divisions' ? 'Division' : 'New'}
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <Card className="overflow-hidden">
          {activeTab === 'companies' && (
            <div>
              {loadingCompanies && companies.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading companies...</div>
                </div>
              ) : (
                <DataTable
                  key={`companies-table-${companies.length}`}
                  data={companies}
                  columns={companyColumns}
                  onLoadMore={() => fetchNextCompanies()}
                  isLoading={isFetchingCompanies}
                  hasMore={hasMoreCompanies}
                />
              )}
            </div>
          )}
          
          {activeTab === 'users' && (
            <div>
              {loadingUsers && users.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading users...</div>
                </div>
              ) : (
                <DataTable
                  key={`users-table-${users.length}`}
                  data={users}
                  columns={userColumns}
                  onLoadMore={() => fetchNextUsers()}
                  isLoading={isFetchingUsers}
                  hasMore={hasMoreUsers}
                />
              )}
            </div>
          )}
          
          {activeTab === 'factories' && (
            <div>
              {loadingFactories && factories.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading business units...</div>
                </div>
              ) : (
                <DataTable
                  key={`factories-table-${factories.length}`}
                  data={factories}
                  columns={factoryColumns}
                  onLoadMore={() => fetchNextFactories()}
                  isLoading={isFetchingFactories}
                  hasMore={hasMoreFactories}
                />
              )}
            </div>
          )}
          
          {activeTab === 'divisions' && (
            <div className="p-6">
              {factories.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-gray-500 mb-2">No Business Units Found</div>
                    <p className="text-sm text-gray-400">Create a business unit first to add divisions</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="mb-4">
                    <Label htmlFor="businessUnit">Select Business Unit</Label>
                    <Select 
                      value={selectedBusinessUnit || ''} 
                      onValueChange={(value) => setSelectedBusinessUnit(value)}
                    >
                      <SelectTrigger className="w-full md:w-1/3">
                        <SelectValue placeholder="Select a business unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {factories.map((factory: any) => (
                          <SelectItem key={factory.id} value={factory.id}>
                            {factory.name} ({factory.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedBusinessUnit && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Divisions</h3>
                          {(() => {
                            const factory = factories.find((f: any) => f.id === selectedBusinessUnit);
                            const typeLabel = factory?.type === 'SUGAR_ONLY' ? 'Sugar Plant' :
                                            factory?.type === 'DISTILLERY' ? 'Ethanol Plant' :
                                            factory?.type === 'COGEN' ? 'Power Plant' :
                                            'Integrated Complex';
                            return (
                              <p className="text-sm text-gray-600 mt-1">
                                {factory?.name} - {typeLabel}
                              </p>
                            );
                          })()}
                        </div>
                        <Button onClick={() => {
                          setCreateFormData({ factoryId: selectedBusinessUnit });
                          setShowCreateModal(true);
                        }}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Division
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(() => {
                          const factory = factories.find((f: any) => f.id === selectedBusinessUnit);
                          const divisionTypes = divisionTypesByBusiness[factory?.type] || divisionTypesByBusiness['INTEGRATED'];
                          
                          return divisionTypes.map((divType) => {
                            const hasDivision = factory?.divisions?.some((d: any) => d.code === divType.code);
                            
                            return (
                              <Card key={divType.value} className={`p-4 ${hasDivision ? 'border-green-500' : 'border-gray-200'}`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-lg">{divType.label}</h4>
                                    <p className="text-sm text-gray-500">Code: {divType.code}</p>
                                  </div>
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    hasDivision ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    {hasDivision ? '✓' : '+'}
                                  </div>
                                </div>
                                {hasDivision ? (
                                  <div className="mt-3">
                                    <Badge variant="default">Active</Badge>
                                  </div>
                                ) : (
                                  <div className="mt-3">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        setCreateFormData({ 
                                          factoryId: selectedBusinessUnit,
                                          name: divType.label,
                                          code: divType.code
                                        });
                                        setShowCreateModal(true);
                                      }}
                                    >
                                      Create
                                    </Button>
                                  </div>
                                )}
                              </Card>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'access' && <AccessControlTab />}
        </Card>
        
        {/* Create Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className={createMode === 'bulk' ? "max-w-6xl" : "max-w-2xl"}>
            <DialogHeader>
              <DialogTitle>
                Create New {activeTab === 'companies' ? 'Company' : activeTab === 'users' ? 'User' : activeTab === 'factories' ? 'Business Unit' : 'Division'}
              </DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new {activeTab === 'companies' ? 'company' : activeTab === 'users' ? 'user' : activeTab === 'factories' ? 'business unit' : 'division'}.
              </DialogDescription>
            </DialogHeader>
            
            {/* Mode Selection */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={createMode === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCreateMode('single')}
              >
                Single Entry
              </Button>
              <Button
                variant={createMode === 'bulk' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setCreateMode('bulk');
                  // Initialize bulk data with empty rows (without code field)
                  if (bulkData.length === 0) {
                    setBulkData(Array(3).fill(null).map(() => ({
                      name: '',
                      email: '',
                      ...(activeTab === 'users' && { username: '', password: '', role: 'OPERATOR' }),
                      ...(activeTab === 'factories' && { type: 'INTEGRATED', companyId: '', location: { city: '', state: '', address: '' } }),
                    })));
                  }
                }}
              >
                Bulk Import
              </Button>
            </div>
            
            <div className={createMode === 'single' ? "grid gap-4 py-4" : "overflow-auto max-h-[500px]"}>
              {/* Single Entry Forms */}
              {createMode === 'single' ? (
                <>
              {/* Company Form */}
              {activeTab === 'companies' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Company Name</Label>
                      <Input
                        id="name"
                        value={createFormData.name || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">Company Code (Optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="code"
                          value={createFormData.code || ''}
                          onChange={(e) => setCreateFormData({ ...createFormData, code: e.target.value })}
                          placeholder="Leave empty to auto-generate"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            const newCode = await generateCode('company');
                            setCreateFormData({ ...createFormData, code: newCode });
                          }}
                        >
                          Generate
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={createFormData.email || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                        placeholder="company@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={createFormData.phone || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={createFormData.address || ''}
                      onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                      placeholder="Enter company address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        value={createFormData.gstNumber || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, gstNumber: e.target.value })}
                        placeholder="Enter GST number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="panNumber">PAN Number</Label>
                      <Input
                        id="panNumber"
                        value={createFormData.panNumber || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, panNumber: e.target.value })}
                        placeholder="Enter PAN number"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {/* User Form */}
              {activeTab === 'users' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={createFormData.name || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={createFormData.username || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, username: e.target.value })}
                        placeholder="Enter username"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={createFormData.email || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={createFormData.password || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                        placeholder="Enter password"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={createFormData.role || ''} onValueChange={(value) => setCreateFormData({ ...createFormData, role: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="OPERATOR">Operator</SelectItem>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="companyId">Company</Label>
                      <Select value={createFormData.companyId || ''} onValueChange={(value) => setCreateFormData({ ...createFormData, companyId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company: any) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
              
              {/* Business Unit Form */}
              {activeTab === 'factories' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Business Unit Name</Label>
                      <Input
                        id="name"
                        value={createFormData.name || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                        placeholder="Enter business unit name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">Business Code (Optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="code"
                          value={createFormData.code || ''}
                          onChange={(e) => setCreateFormData({ ...createFormData, code: e.target.value })}
                          placeholder="Leave empty to auto-generate"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            const newCode = await generateCode('business');
                            setCreateFormData({ ...createFormData, code: newCode });
                          }}
                        >
                          Generate
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Business Type</Label>
                      <Select value={createFormData.type || ''} onValueChange={(value) => setCreateFormData({ ...createFormData, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="companyId">Company</Label>
                      <Select value={createFormData.companyId || ''} onValueChange={(value) => setCreateFormData({ ...createFormData, companyId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company: any) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Location Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={createFormData.location?.city || ''}
                          onChange={(e) => setCreateFormData({ 
                            ...createFormData, 
                            location: { ...createFormData.location, city: e.target.value }
                          })}
                          placeholder="Enter city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Select 
                          value={createFormData.location?.state || ''} 
                          onValueChange={(value) => setCreateFormData({ 
                            ...createFormData, 
                            location: { ...createFormData.location, state: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {indianStates.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <div className="flex gap-2">
                        <Input
                          id="address"
                          value={createFormData.location?.address || ''}
                          onChange={(e) => setCreateFormData({ 
                            ...createFormData, 
                            location: { ...createFormData.location, address: e.target.value }
                          })}
                          placeholder="Enter address"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const selectedCompany = companies.find((c: any) => c.id === createFormData.companyId);
                            if (selectedCompany?.address) {
                              setCreateFormData({ 
                                ...createFormData, 
                                location: { 
                                  ...createFormData.location, 
                                  address: selectedCompany.address 
                                }
                              });
                              toast.success('Address copied from company');
                            } else {
                              toast.error('Please select a company first');
                            }
                          }}
                        >
                          Copy from Company
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dynamic fields based on business type */}
                  {(createFormData.type === 'Sugar Manufacturing' || createFormData.type === 'Integrated Sugar Complex') && (
                    <div>
                      <Label htmlFor="capacity">Sugar Crushing Capacity</Label>
                      <Input
                        id="capacity"
                        type="text"
                        value={createFormData.capacity || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, capacity: e.target.value })}
                        placeholder="e.g., 8000 TCD"
                      />
                    </div>
                  )}
                  {createFormData.type === 'Distillery' && (
                    <div>
                      <Label htmlFor="capacity">Ethanol Production Capacity</Label>
                      <Input
                        id="capacity"
                        type="text"
                        value={createFormData.capacity || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, capacity: e.target.value })}
                        placeholder="e.g., 100 KLPD"
                      />
                    </div>
                  )}
                  {createFormData.type === 'Co-generation Plant' && (
                    <div>
                      <Label htmlFor="capacity">Power Generation Capacity</Label>
                      <Input
                        id="capacity"
                        type="text"
                        value={createFormData.capacity || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, capacity: e.target.value })}
                        placeholder="e.g., 30 MW"
                      />
                    </div>
                  )}
                  {createFormData.type === 'Manufacturing' && (
                    <div>
                      <Label htmlFor="capacity">Production Capacity</Label>
                      <Input
                        id="capacity"
                        type="text"
                        value={createFormData.capacity || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, capacity: e.target.value })}
                        placeholder="e.g., 5000 units/month"
                      />
                    </div>
                  )}
                  {createFormData.type === 'Retail' && (
                    <div>
                      <Label htmlFor="storeSize">Store Size (sq ft)</Label>
                      <Input
                        id="storeSize"
                        type="number"
                        value={createFormData.storeSize || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, storeSize: e.target.value })}
                        placeholder="Enter store size"
                      />
                    </div>
                  )}
                  {createFormData.type === 'Services' && (
                    <div>
                      <Label htmlFor="serviceTypes">Service Types</Label>
                      <Input
                        id="serviceTypes"
                        value={createFormData.serviceTypes || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, serviceTypes: e.target.value })}
                        placeholder="Enter service types (comma separated)"
                      />
                    </div>
                  )}
                </>
              )}
              
              {/* Division Form */}
              {activeTab === 'divisions' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="divisionName">Division Name</Label>
                      <Input
                        id="divisionName"
                        value={createFormData.name || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                        placeholder="Enter division name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="divisionCode">Division Code (Optional)</Label>
                      <Input
                        id="divisionCode"
                        value={createFormData.code || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, code: e.target.value })}
                        placeholder="Leave empty to auto-generate"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="divisionType">Division Type</Label>
                      <Select 
                        value={createFormData.code || ''} 
                        onValueChange={(code) => {
                          const factory = factories.find((f: any) => f.id === createFormData.factoryId);
                          const divTypes = divisionTypesByBusiness[factory?.type] || divisionTypesByBusiness['INTEGRATED'];
                          const division = divTypes.find(d => d.code === code);
                          if (division) {
                            setCreateFormData({ 
                              ...createFormData, 
                              type: 'COMMON', // We'll map this to proper enum later
                              name: division.label,
                              code: division.code
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select division type" />
                        </SelectTrigger>
                        <SelectContent>
                          {(() => {
                            const factory = factories.find((f: any) => f.id === createFormData.factoryId);
                            const divTypes = divisionTypesByBusiness[factory?.type] || divisionTypesByBusiness['INTEGRATED'];
                            return divTypes.map((type) => (
                              <SelectItem key={type.code} value={type.code}>
                                {type.label}
                              </SelectItem>
                            ));
                          })()}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="businessUnit">Business Unit</Label>
                      <Select 
                        value={createFormData.factoryId || ''} 
                        onValueChange={(value) => setCreateFormData({ ...createFormData, factoryId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {factories.map((factory: any) => (
                            <SelectItem key={factory.id} value={factory.id}>
                              {factory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="isActive">Status</Label>
                    <Select 
                      value={createFormData.isActive !== false ? 'true' : 'false'} 
                      onValueChange={(value) => setCreateFormData({ ...createFormData, isActive: value === 'true' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
                </>
              ) : (
                /* Bulk Entry Forms */
                <div className="w-full">
                  {activeTab === 'companies' && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-2 py-2 text-left font-medium">#</th>
                            <th className="px-2 py-2 text-left font-medium">Company Name*</th>
                            <th className="px-2 py-2 text-left font-medium">Email*</th>
                            <th className="px-2 py-2 text-left font-medium">Phone</th>
                            <th className="px-2 py-2 text-left font-medium">GST Number</th>
                            <th className="px-2 py-2 text-left font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkData.map((row, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="px-2 py-1">{index + 1}</td>
                              <td className="px-2 py-1">
                                <Input
                                  value={row.name || ''}
                                  onChange={(e) => {
                                    const newData = [...bulkData];
                                    newData[index] = { ...newData[index], name: e.target.value };
                                    setBulkData(newData);
                                  }}
                                  placeholder="Company name"
                                  className="h-8"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <Input
                                  value={row.email || ''}
                                  onChange={(e) => {
                                    const newData = [...bulkData];
                                    newData[index] = { ...newData[index], email: e.target.value };
                                    setBulkData(newData);
                                  }}
                                  placeholder="Email"
                                  type="email"
                                  className="h-8"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <Input
                                  value={row.phone || ''}
                                  onChange={(e) => {
                                    const newData = [...bulkData];
                                    newData[index] = { ...newData[index], phone: e.target.value };
                                    setBulkData(newData);
                                  }}
                                  placeholder="Phone"
                                  className="h-8"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <Input
                                  value={row.gstNumber || ''}
                                  onChange={(e) => {
                                    const newData = [...bulkData];
                                    newData[index] = { ...newData[index], gstNumber: e.target.value };
                                    setBulkData(newData);
                                  }}
                                  placeholder="GST"
                                  className="h-8"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const newData = bulkData.filter((_, i) => i !== index);
                                    setBulkData(newData);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="p-2 bg-gray-50 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setBulkData([...bulkData, { name: '', email: '' }]);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Row
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'users' && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-2 py-2 text-left font-medium">#</th>
                            <th className="px-2 py-2 text-left font-medium">Full Name*</th>
                            <th className="px-2 py-2 text-left font-medium">Username*</th>
                            <th className="px-2 py-2 text-left font-medium">Email*</th>
                            <th className="px-2 py-2 text-left font-medium">Password*</th>
                            <th className="px-2 py-2 text-left font-medium">Role*</th>
                            <th className="px-2 py-2 text-left font-medium">Company*</th>
                            <th className="px-2 py-2 text-left font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkData.map((row, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="px-2 py-1">{index + 1}</td>
                              <td className="px-2 py-1">
                                <Input
                                  value={row.name || ''}
                                  onChange={(e) => {
                                    const newData = [...bulkData];
                                    newData[index] = { ...newData[index], name: e.target.value };
                                    setBulkData(newData);
                                  }}
                                  placeholder="Full name"
                                  className="h-8"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <Input
                                  value={row.username || ''}
                                  onChange={(e) => {
                                    const newData = [...bulkData];
                                    newData[index] = { ...newData[index], username: e.target.value };
                                    setBulkData(newData);
                                  }}
                                  placeholder="Username"
                                  className="h-8"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <Input
                                  value={row.email || ''}
                                  onChange={(e) => {
                                    const newData = [...bulkData];
                                    newData[index] = { ...newData[index], email: e.target.value };
                                    setBulkData(newData);
                                  }}
                                  placeholder="Email"
                                  type="email"
                                  className="h-8"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <Input
                                  value={row.password || ''}
                                  onChange={(e) => {
                                    const newData = [...bulkData];
                                    newData[index] = { ...newData[index], password: e.target.value };
                                    setBulkData(newData);
                                  }}
                                  placeholder="Password"
                                  type="password"
                                  className="h-8"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <Select
                                  value={row.role || 'OPERATOR'}
                                  onValueChange={(value) => {
                                    const newData = [...bulkData];
                                    newData[index] = { ...newData[index], role: value };
                                    setBulkData(newData);
                                  }}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="MANAGER">Manager</SelectItem>
                                    <SelectItem value="OPERATOR">Operator</SelectItem>
                                    <SelectItem value="VIEWER">Viewer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-2 py-1">
                                <Select
                                  value={row.companyId || ''}
                                  onValueChange={(value) => {
                                    const newData = [...bulkData];
                                    newData[index] = { ...newData[index], companyId: value };
                                    setBulkData(newData);
                                  }}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {companies.map((company: any) => (
                                      <SelectItem key={company.id} value={company.id}>
                                        {company.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-2 py-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const newData = bulkData.filter((_, i) => i !== index);
                                    setBulkData(newData);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="p-2 bg-gray-50 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setBulkData([...bulkData, { name: '', username: '', email: '', password: '', role: 'OPERATOR' }]);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Row
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'factories' && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-2 py-2 text-left font-medium">#</th>
                            <th className="px-2 py-2 text-left font-medium">Business Unit Name*</th>
                            <th className="px-2 py-2 text-left font-medium">Type*</th>
                            <th className="px-2 py-2 text-left font-medium">Company*</th>
                            <th className="px-2 py-2 text-left font-medium">City</th>
                            <th className="px-2 py-2 text-left font-medium">State</th>
                            <th className="px-2 py-2 text-left font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkData.map((row, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="px-2 py-1">{index + 1}</td>
                              <td className="px-2 py-1">
                                <Input
                                  value={row.name || ''}
                                  onChange={(e) => {
                                    const newData = [...bulkData];
                                    newData[index] = { ...newData[index], name: e.target.value };
                                    setBulkData(newData);
                                  }}
                                  placeholder="Business unit name"
                                  className="h-8"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <Select
                                  value={row.type || 'INTEGRATED'}
                                  onValueChange={(value) => {
                                    const newData = [...bulkData];
                                    newData[index] = { ...newData[index], type: value };
                                    setBulkData(newData);
                                  }}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {businessTypes.slice(0, 4).map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-2 py-1">
                                <Select
                                  value={row.companyId || ''}
                                  onValueChange={(value) => {
                                    const newData = [...bulkData];
                                    newData[index] = { ...newData[index], companyId: value };
                                    setBulkData(newData);
                                  }}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {companies.map((company: any) => (
                                      <SelectItem key={company.id} value={company.id}>
                                        {company.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-2 py-1">
                                <Input
                                  value={row.location?.city || ''}
                                  onChange={(e) => {
                                    const newData = [...bulkData];
                                    newData[index] = { 
                                      ...newData[index], 
                                      location: { ...newData[index].location, city: e.target.value }
                                    };
                                    setBulkData(newData);
                                  }}
                                  placeholder="City"
                                  className="h-8"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <Select
                                  value={row.location?.state || ''}
                                  onValueChange={(value) => {
                                    const newData = [...bulkData];
                                    newData[index] = { 
                                      ...newData[index], 
                                      location: { ...newData[index].location, state: value }
                                    };
                                    setBulkData(newData);
                                  }}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="State" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {indianStates.map((state) => (
                                      <SelectItem key={state} value={state}>
                                        {state}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-2 py-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const newData = bulkData.filter((_, i) => i !== index);
                                    setBulkData(newData);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="p-2 bg-gray-50 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setBulkData([...bulkData, { 
                              name: '', 
                              type: 'INTEGRATED', 
                              companyId: '',
                              location: { city: '', state: '', address: '' }
                            }]);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Row
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowCreateModal(false);
                setCreateFormData({
                  location: {
                    address: '',
                    city: '',
                    state: ''
                  }
                });
                setBulkData([]);
                setCreateMode('single');
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createCompany.isPending || createUser.isPending || createFactory.isPending || createDivision.isPending}>
                {(createCompany.isPending || createUser.isPending || createFactory.isPending || createDivision.isPending) ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

// Access Control Tab Component
function AccessControlTab() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [roleTab, setRoleTab] = useState<'roles' | 'permissions'>('roles');
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedScope, setSelectedScope] = useState<string>('GLOBAL');
  const [selectedScopeId, setSelectedScopeId] = useState<string>('');
  const [createRoleData, setCreateRoleData] = useState({
    name: '',
    description: '',
    level: 50,
    parentId: ''
  });
  
  // Fetch data
  const { data: roles, isLoading: loadingRoles } = useRoles();
  const { data: modules, isLoading: loadingModules } = useModules();
  const { data: users } = useUsers({ search: '' });
  const { data: userPermissions } = useUserPermissions(selectedUser || undefined);
  const { data: companies } = useCompanies({ search: '' });
  const { data: factories } = useFactories({ search: '' });
  const { data: divisions } = useDivisions({ search: '' });
  
  // Mutations
  const assignRole = useAssignUserRole();
  const createRole = useCreateRole();
  
  const allUsers = users?.pages?.flatMap((page: any) => page.data) || [];
  const allCompanies = companies?.pages?.flatMap((page: any) => page.data) || [];
  const allFactories = factories?.pages?.flatMap((page: any) => page.data) || [];
  const allDivisions = divisions?.pages?.flatMap((page: any) => page.data) || [];

  return (
    <div className="p-6">
      {/* Sub tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          className={`pb-2 px-1 border-b-2 transition-colors ${
            roleTab === 'roles' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setRoleTab('roles')}
        >
          Roles & Hierarchy
        </button>
        <button
          className={`pb-2 px-1 border-b-2 transition-colors ${
            roleTab === 'permissions' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setRoleTab('permissions')}
        >
          User Permissions
        </button>
      </div>

      {roleTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles List */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Role Hierarchy</h3>
            {loadingRoles ? (
              <div className="text-center py-8 text-gray-500">Loading roles...</div>
            ) : (
              <div className="space-y-4">
                {roles?.map((role: any) => (
                  <Card key={role.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-lg">{role.name}</h4>
                        <p className="text-sm text-gray-600">{role.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline">Level: {role.level}</Badge>
                          {role.parent && (
                            <span className="text-sm text-gray-500">
                              Reports to: {role.parent.name}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {role._count.userRoles} users
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Manage Permissions ({role._count.permissions})
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Create Role */}
          <div>
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setShowCreateRoleModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Role
                </Button>
                <Button className="w-full" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Manage Modules
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {roleTab === 'permissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Select User</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {allUsers.map((user: any) => (
                <Card
                  key={user.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedUser === user.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedUser(user.id)}
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <Badge variant="outline" className="mt-1">{user.role}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* User Permissions */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">User Permissions</h3>
                  {userPermissions && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        User: <strong>{userPermissions.user.name}</strong>
                      </p>
                      <div className="flex gap-2 mt-2">
                        {userPermissions.user.roles.map((role: any) => (
                          <Badge key={role.id} variant="default">
                            {role.name} ({role.scope})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Assign Role */}
                <Card className="p-4 mb-4">
                  <h4 className="font-medium mb-3">Assign Role</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles?.map((role: any) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={selectedScope} onValueChange={setSelectedScope}>
                        <SelectTrigger>
                          <SelectValue placeholder="Scope" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GLOBAL">Global</SelectItem>
                          <SelectItem value="COMPANY">Company</SelectItem>
                          <SelectItem value="FACTORY">Factory</SelectItem>
                          <SelectItem value="DIVISION">Division</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedScope !== 'GLOBAL' && (
                      <Select value={selectedScopeId} onValueChange={setSelectedScopeId}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${selectedScope.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedScope === 'COMPANY' && allCompanies.map((company: any) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                          {selectedScope === 'FACTORY' && allFactories.map((factory: any) => (
                            <SelectItem key={factory.id} value={factory.id}>
                              {factory.name}
                            </SelectItem>
                          ))}
                          {selectedScope === 'DIVISION' && allDivisions.map((division: any) => (
                            <SelectItem key={division.id} value={division.id}>
                              {division.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    <Button 
                      className="w-full"
                      onClick={() => {
                        if (selectedRole && selectedUser) {
                          assignRole.mutate({
                            userId: selectedUser,
                            roleId: selectedRole,
                            scope: selectedScope,
                            scopeId: selectedScope !== 'GLOBAL' ? selectedScopeId : undefined
                          });
                        }
                      }}
                      disabled={!selectedRole || !selectedUser || assignRole.isPending}
                    >
                      {assignRole.isPending ? 'Assigning...' : 'Assign Role'}
                    </Button>
                  </div>
                </Card>

                {/* Permissions List */}
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Current Permissions</h4>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {userPermissions?.permissions?.map((perm: any) => (
                      <div key={perm.code} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{perm.name}</p>
                          <p className="text-sm text-gray-600">
                            {perm.module.name} {perm.subModule && `> ${perm.subModule.name}`}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {perm.action}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {perm.scope} {perm.scopeId && `(${perm.scopeId})`}
                            </Badge>
                            {perm.fromRole && (
                              <Badge variant="default" className="text-xs">
                                From: {perm.fromRole}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {perm.isOverride && (
                          <Button size="sm" variant="ghost" className="text-red-600">
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Select a user to view permissions
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Create Role Modal */}
      <Dialog open={showCreateRoleModal} onOpenChange={setShowCreateRoleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions and hierarchy
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={createRoleData.name}
                onChange={(e) => setCreateRoleData({...createRoleData, name: e.target.value})}
                placeholder="e.g., Plant Manager"
              />
            </div>
            
            <div>
              <Label htmlFor="role-description">Description</Label>
              <Input
                id="role-description"
                value={createRoleData.description}
                onChange={(e) => setCreateRoleData({...createRoleData, description: e.target.value})}
                placeholder="Brief description of the role"
              />
            </div>
            
            <div>
              <Label htmlFor="role-level">Hierarchy Level (0-100)</Label>
              <Input
                id="role-level"
                type="number"
                min="0"
                max="100"
                value={createRoleData.level}
                onChange={(e) => setCreateRoleData({...createRoleData, level: parseInt(e.target.value) || 0})}
              />
              <p className="text-sm text-gray-600 mt-1">
                Higher numbers indicate higher authority (MD=100, Operator=50)
              </p>
            </div>
            
            <div>
              <Label htmlFor="parent-role">Parent Role (Optional)</Label>
              <Select value={createRoleData.parentId} onValueChange={(value) => setCreateRoleData({...createRoleData, parentId: value})}>
                <SelectTrigger id="parent-role">
                  <SelectValue placeholder="Select parent role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {roles?.map((role: any) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name} (Level {role.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateRoleModal(false);
              setCreateRoleData({ name: '', description: '', level: 50, parentId: '' });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                createRole.mutate({
                  ...createRoleData,
                  parentId: createRoleData.parentId || undefined
                }, {
                  onSuccess: () => {
                    setShowCreateRoleModal(false);
                    setCreateRoleData({ name: '', description: '', level: 50, parentId: '' });
                  }
                });
              }}
              disabled={!createRoleData.name || createRole.isPending}
            >
              {createRole.isPending ? 'Creating...' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OptimizedMasterDataPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </DashboardLayout>
    }>
      <MasterDataContent />
    </Suspense>
  );
}