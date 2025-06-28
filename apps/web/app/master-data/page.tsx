'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2, Edit, Building2, Users, Factory } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function MasterDataPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [factories, setFactories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('companies');

  useEffect(() => {
    loadAllData();
  }, []);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load companies
      const companyRes = await fetch(`${API_URL}/api/companies`, {
        headers: getAuthHeaders()
      });
      if (companyRes.ok) {
        const companyData = await companyRes.json();
        setCompanies(companyData);
      }

      // Load users
      const userRes = await fetch(`${API_URL}/api/users`, {
        headers: getAuthHeaders()
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUsers(userData);
      }

      // Load factories
      const factoryRes = await fetch(`${API_URL}/api/factories`, {
        headers: getAuthHeaders()
      });
      if (factoryRes.ok) {
        const factoryData = await factoryRes.json();
        setFactories(factoryData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete company "${name}"? This will delete all associated data.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/companies/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        toast.success('Company deleted successfully');
        loadAllData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete company');
      }
    } catch (error) {
      toast.error('Error deleting company');
    }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        toast.success('User deleted successfully');
        loadAllData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  const deleteFactory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete factory "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/factories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        toast.success('Factory deleted successfully');
        loadAllData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete factory');
      }
    } catch (error) {
      toast.error('Error deleting factory');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading master data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Master Data Management</h1>
          <p className="text-gray-600">Manage all companies, users, and factories in the system</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              activeTab === 'companies' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Companies ({companies.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              activeTab === 'users' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border'
            }`}
          >
            <Users className="w-4 h-4" />
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('factories')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              activeTab === 'factories' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border'
            }`}
          >
            <Factory className="w-4 h-4" />
            Factories ({factories.length})
          </button>
        </div>

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Companies</h2>
            {companies.length === 0 ? (
              <p className="text-gray-500">No companies found</p>
            ) : (
              <div className="space-y-4">
                {companies.map((company) => (
                  <div key={company.id} className="border rounded p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <p className="text-sm text-gray-600">Code: {company.code}</p>
                      <p className="text-sm text-gray-600">Email: {company.email}</p>
                      <p className="text-sm text-gray-600">Phone: {company.phone}</p>
                      {company.gstNumber && (
                        <p className="text-sm text-gray-600">GST: {company.gstNumber}</p>
                      )}
                      <div className="mt-2 flex gap-4 text-sm">
                        <span className="text-blue-600">
                          {company._count?.users || 0} Users
                        </span>
                        <span className="text-green-600">
                          {company._count?.factories || 0} Factories
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.info('Edit functionality coming soon')}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteCompany(company.id, company.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            {users.length === 0 ? (
              <p className="text-gray-500">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Username</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">Access Level</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-2">{user.name}</td>
                        <td className="p-2">{user.username}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {user.role}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                            {user.accessLevel || 'FACTORY'}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast.info('Edit functionality coming soon')}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteUser(user.id, user.name)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Factories Tab */}
        {activeTab === 'factories' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Factories</h2>
            {factories.length === 0 ? (
              <p className="text-gray-500">No factories found</p>
            ) : (
              <div className="grid gap-4">
                {factories.map((factory) => (
                  <div key={factory.id} className="border rounded p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{factory.name}</h3>
                      <p className="text-sm text-gray-600">Code: {factory.code}</p>
                      <p className="text-sm text-gray-600">Type: {factory.type}</p>
                      <p className="text-sm text-gray-600">
                        Location: {factory.location?.city}, {factory.location?.state}
                      </p>
                      {factory.capacity && (
                        <div className="mt-2 text-sm text-gray-600">
                          Capacity: 
                          {factory.capacity.sugar && ` Sugar: ${factory.capacity.sugar} TCD,`}
                          {factory.capacity.ethanol && ` Ethanol: ${factory.capacity.ethanol} KLPD,`}
                          {factory.capacity.power && ` Power: ${factory.capacity.power} MW`}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.info('Edit functionality coming soon')}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteFactory(factory.id, factory.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Summary */}
        <Card className="mt-6 p-6 bg-blue-50">
          <h3 className="font-semibold mb-2">System Summary</h3>
          <p className="text-sm text-gray-700">
            You have {companies.length} {companies.length === 1 ? 'company' : 'companies'} with{' '}
            {users.length} {users.length === 1 ? 'user' : 'users'} and{' '}
            {factories.length} {factories.length === 1 ? 'factory' : 'factories'} in the system.
          </p>
          {companies.length > 1 && (
            <p className="text-sm text-orange-600 mt-2">
              ⚠️ You have multiple companies. For single-company operation, please delete the extra companies.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}