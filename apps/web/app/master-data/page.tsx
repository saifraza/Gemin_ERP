'use client';

import { useState, useCallback, memo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Building2,
  Users,
  Factory,
  BarChart3
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

export default function OptimizedMasterDataPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'companies');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  const debounceTimer = useRef<NodeJS.Timeout>();
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  }, []);

  // Data fetching with infinite scroll
  const {
    data: companiesData,
    fetchNextPage: fetchNextCompanies,
    hasNextPage: hasMoreCompanies,
    isFetchingNextPage: isFetchingCompanies,
    refetch: refetchCompanies,
    isLoading: loadingCompanies,
  } = useCompanies({ search: debouncedSearch });

  const {
    data: usersData,
    fetchNextPage: fetchNextUsers,
    hasNextPage: hasMoreUsers,
    isFetchingNextPage: isFetchingUsers,
    refetch: refetchUsers,
    isLoading: loadingUsers,
  } = useUsers({ search: debouncedSearch });

  const {
    data: factoriesData,
    fetchNextPage: fetchNextFactories,
    hasNextPage: hasMoreFactories,
    isFetchingNextPage: isFetchingFactories,
    refetch: refetchFactories,
    isLoading: loadingFactories,
  } = useFactories({ search: debouncedSearch });

  // Flatten paginated data
  const companies = companiesData?.pages.flatMap(page => page.data) || [];
  const users = usersData?.pages.flatMap(page => page.data) || [];
  const factories = factoriesData?.pages.flatMap(page => page.data) || [];

  // Mutations
  const createCompany = useCreateCompany();
  const createUser = useCreateUser();
  const createFactory = useCreateFactory();
  const deleteCompany = useDeleteCompany();

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
      value: companiesData?.pages[0]?.total || 0,
      icon: <Building2 className="w-5 h-5" />,
      color: 'text-blue-600'
    },
    { 
      label: 'Total Users', 
      value: usersData?.pages[0]?.total || 0,
      icon: <Users className="w-5 h-5" />,
      color: 'text-green-600'
    },
    { 
      label: 'Business Units', 
      value: factoriesData?.pages[0]?.total || 0,
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

  return (
    <DashboardLayout>
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
            onClick={() => setActiveTab('companies')}
            icon={<Building2 className="w-4 h-4" />}
            label="Companies"
            count={companiesData?.pages[0]?.total}
          />
          <TabButton
            isActive={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            icon={<Users className="w-4 h-4" />}
            label="Users"
            count={usersData?.pages[0]?.total}
          />
          <TabButton
            isActive={activeTab === 'factories'}
            onClick={() => setActiveTab('factories')}
            icon={<Factory className="w-4 h-4" />}
            label="Business Units"
            count={factoriesData?.pages[0]?.total}
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
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add {activeTab === 'companies' ? 'Company' : activeTab === 'users' ? 'User' : 'Business'}
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <Card className="overflow-hidden">
          {activeTab === 'companies' && (
            <DataTable
              data={companies}
              columns={companyColumns}
              onLoadMore={() => fetchNextCompanies()}
              isLoading={isFetchingCompanies}
              hasMore={hasMoreCompanies}
            />
          )}
          
          {activeTab === 'users' && (
            <DataTable
              data={users}
              columns={userColumns}
              onLoadMore={() => fetchNextUsers()}
              isLoading={isFetchingUsers}
              hasMore={hasMoreUsers}
            />
          )}
          
          {activeTab === 'factories' && (
            <DataTable
              data={factories}
              columns={factoryColumns}
              onLoadMore={() => fetchNextFactories()}
              isLoading={isFetchingFactories}
              hasMore={hasMoreFactories}
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}