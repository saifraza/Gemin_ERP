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
  Shield
} from 'lucide-react';
import {
  useCompanies,
  useUsers,
  useFactories,
  useCreateCompany,
  useCreateUser,
  useCreateFactory,
  useDeleteCompany,
} from '@/hooks/use-master-data';
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

function MasterDataContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || 'companies');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Create modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState<any>({});

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

  // Data fetching with infinite scroll - only fetch active tab data
  const {
    data: companiesData,
    fetchNextPage: fetchNextCompanies,
    hasNextPage: hasMoreCompanies,
    isFetchingNextPage: isFetchingCompanies,
    refetch: refetchCompanies,
    isLoading: loadingCompanies,
  } = useCompanies({ search: debouncedSearch }, { enabled: activeTab === 'companies' });

  const {
    data: usersData,
    fetchNextPage: fetchNextUsers,
    hasNextPage: hasMoreUsers,
    isFetchingNextPage: isFetchingUsers,
    refetch: refetchUsers,
    isLoading: loadingUsers,
  } = useUsers({ search: debouncedSearch }, { enabled: activeTab === 'users' });

  const {
    data: factoriesData,
    fetchNextPage: fetchNextFactories,
    hasNextPage: hasMoreFactories,
    isFetchingNextPage: isFetchingFactories,
    refetch: refetchFactories,
    isLoading: loadingFactories,
  } = useFactories({ search: debouncedSearch }, { enabled: activeTab === 'factories' });

  // Flatten paginated data
  const companies = companiesData?.pages.flatMap((page: any) => page.data) || [];
  const users = usersData?.pages.flatMap((page: any) => page.data) || [];
  const factories = factoriesData?.pages.flatMap((page: any) => page.data) || [];

  // Mutations
  const createCompany = useCreateCompany();
  const createUser = useCreateUser();
  const createFactory = useCreateFactory();
  const deleteCompany = useDeleteCompany();
  
  // Handle create
  const handleCreate = async () => {
    try {
      if (activeTab === 'companies') {
        await createCompany.mutateAsync(createFormData);
      } else if (activeTab === 'users') {
        await createUser.mutateAsync(createFormData);
      } else if (activeTab === 'factories') {
        // Generate business code
        const code = `BU${Date.now().toString(36).toUpperCase()}`;
        await createFactory.mutateAsync({ ...createFormData, code });
      }
      setShowCreateModal(false);
      setCreateFormData({});
    } catch (error) {
      console.error('Error creating entity:', error);
    }
  };
  
  // Auto-generate business code
  const generateBusinessCode = () => {
    return `BU${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

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
                else refetchFactories();
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add {activeTab === 'companies' ? 'Company' : activeTab === 'users' ? 'User' : activeTab === 'factories' ? 'Business' : 'New'}
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
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-gray-500 mb-2">Divisions Management</div>
                <p className="text-sm text-gray-400">Coming soon</p>
              </div>
            </div>
          )}
          
          {activeTab === 'access' && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-gray-500 mb-2">Access Control</div>
                <p className="text-sm text-gray-400">Coming soon</p>
              </div>
            </div>
          )}
        </Card>
        
        {/* Create Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Create New {activeTab === 'companies' ? 'Company' : activeTab === 'users' ? 'User' : 'Business Unit'}
              </DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new {activeTab === 'companies' ? 'company' : activeTab === 'users' ? 'user' : 'business unit'}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
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
                      <Label htmlFor="code">Company Code</Label>
                      <Input
                        id="code"
                        value={createFormData.code || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, code: e.target.value })}
                        placeholder="Enter company code"
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
                      <Label htmlFor="code">Business Code</Label>
                      <div className="flex gap-2">
                        <Input
                          id="code"
                          value={createFormData.code || generateBusinessCode()}
                          onChange={(e) => setCreateFormData({ ...createFormData, code: e.target.value })}
                          placeholder="Auto-generated"
                          readOnly
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCreateFormData({ ...createFormData, code: generateBusinessCode() })}
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
                            }
                          }}
                        >
                          Copy from Company
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dynamic fields based on business type */}
                  {createFormData.type === 'Manufacturing' && (
                    <div>
                      <Label htmlFor="capacity">Production Capacity (units/month)</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={createFormData.capacity || ''}
                        onChange={(e) => setCreateFormData({ ...createFormData, capacity: e.target.value })}
                        placeholder="Enter production capacity"
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
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createCompany.isPending || createUser.isPending || createFactory.isPending}>
                {(createCompany.isPending || createUser.isPending || createFactory.isPending) ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
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