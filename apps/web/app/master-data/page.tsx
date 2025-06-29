'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2, Edit, Building2, Users, Factory, Plus, X, Copy } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Business types with their specific fields
const businessTypes = [
  { value: 'MANUFACTURING', label: 'Manufacturing', hasCapacity: true },
  { value: 'RETAIL', label: 'Retail', hasStoreSize: true },
  { value: 'SERVICES', label: 'Services', hasServiceTypes: true },
  { value: 'TECHNOLOGY', label: 'Technology', hasTechStack: true },
  { value: 'HEALTHCARE', label: 'Healthcare', hasBeds: true },
  { value: 'EDUCATION', label: 'Education', hasStudentCapacity: true },
  { value: 'HOSPITALITY', label: 'Hospitality', hasRooms: true },
  { value: 'CONSTRUCTION', label: 'Construction', hasProjectTypes: true },
  { value: 'LOGISTICS', label: 'Logistics', hasFleetSize: true },
  { value: 'FINANCE', label: 'Finance & Banking', hasAssets: true },
  { value: 'ENERGY', label: 'Energy & Utilities', hasPowerCapacity: true },
  { value: 'AGRICULTURE', label: 'Agriculture', hasLandSize: true },
  { value: 'REAL_ESTATE', label: 'Real Estate', hasProperties: true },
  { value: 'MEDIA', label: 'Media & Entertainment', hasContent: true },
  { value: 'TELECOM', label: 'Telecommunications', hasSubscribers: true },
  { value: 'AUTOMOTIVE', label: 'Automotive', hasProductionCapacity: true },
  { value: 'PHARMACEUTICAL', label: 'Pharmaceutical', hasProducts: true },
  { value: 'FOOD_BEVERAGE', label: 'Food & Beverage', hasProduction: true },
  { value: 'TEXTILE', label: 'Textile & Apparel', hasProduction: true },
  { value: 'CONSULTING', label: 'Consulting', hasConsultants: true },
];

function MasterDataContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [factories, setFactories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'companies');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  
  // Generate business code
  const generateBusinessCode = (type: string) => {
    const prefix = type.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}-${timestamp}-${random}`;
  };
  
  // Add form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState<any>({
    // Company form
    companyName: '',
    companyCode: '',
    companyEmail: '',
    companyPhone: '',
    companyGst: '',
    companyPan: '',
    companyAddress: '',
    
    // User form
    userName: '',
    userUsername: '',
    userEmail: '',
    userPassword: '',
    userRole: 'VIEWER',
    userCompanyId: '',
    
    // Business form
    factoryName: '',
    factoryCode: generateBusinessCode('MANUFACTURING'),
    factoryType: 'MANUFACTURING',
    factoryCompanyId: '',
    factoryCity: '',
    factoryState: '',
    factoryAddress: '',
    // Dynamic capacity fields
    factoryCapacity: '',
    factoryStoreSize: '',
    factoryEmployees: '',
    factorySpecialty: '',
  });
  
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle business type change
  const handleBusinessTypeChange = (type: string) => {
    setAddFormData({
      ...addFormData,
      factoryType: type,
      factoryCode: generateBusinessCode(type)
    });
  };

  // Copy company address to business
  const copyCompanyAddress = () => {
    const selectedCompany = companies.find(c => c.id === addFormData.factoryCompanyId);
    if (selectedCompany && selectedCompany.address) {
      // Simply copy the full address
      // City and State should be filled manually as they might not be parseable from address
      setAddFormData({
        ...addFormData,
        factoryAddress: selectedCompany.address,
      });
      toast.success('Company address copied! Please fill in City and State.');
    } else {
      toast.error('Please select a company first');
    }
  };

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
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

  const startEditUser = (user: any) => {
    setEditingUser(user.id);
    setEditFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      companyId: user.company?.id,
      accessLevel: user.accessLevel || 'FACTORY'
    });
  };

  const saveUserEdit = async (userId: string) => {
    try {
      // Update role if changed
      if (editFormData.role !== users.find(u => u.id === userId)?.role) {
        const roleRes = await fetch(`${API_URL}/api/users/${userId}/role`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ role: editFormData.role })
        });
        
        if (!roleRes.ok) {
          const error = await roleRes.json();
          toast.error(error.error || 'Failed to update role');
          return;
        }
      }

      // Update company if changed
      if (editFormData.companyId !== users.find(u => u.id === userId)?.company?.id) {
        const companyRes = await fetch(`${API_URL}/api/users/${userId}/company`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ companyId: editFormData.companyId })
        });
        
        if (!companyRes.ok) {
          const error = await companyRes.json();
          toast.error(error.error || 'Failed to update company');
          return;
        }
      }

      toast.success('User updated successfully');
      setEditingUser(null);
      loadAllData();
    } catch (error) {
      toast.error('Error updating user');
    }
  };

  const createCompany = async () => {
    try {
      const res = await fetch(`${API_URL}/api/companies`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: addFormData.companyName,
          code: addFormData.companyCode,
          email: addFormData.companyEmail,
          phone: addFormData.companyPhone,
          gstNumber: addFormData.companyGst,
          panNumber: addFormData.companyPan,
          address: addFormData.companyAddress,
        })
      });

      if (res.ok) {
        toast.success('Company created successfully');
        setShowAddForm(false);
        resetAddForm();
        loadAllData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create company');
      }
    } catch (error) {
      toast.error('Error creating company');
    }
  };

  const createUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: addFormData.userUsername,
          email: addFormData.userEmail,
          password: addFormData.userPassword,
          name: addFormData.userName,
          role: addFormData.userRole,
          companyId: addFormData.userCompanyId || companies[0]?.id,
        })
      });

      if (res.ok) {
        toast.success('User created successfully');
        setShowAddForm(false);
        resetAddForm();
        loadAllData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create user');
      }
    } catch (error) {
      toast.error('Error creating user');
    }
  };

  const createFactory = async () => {
    try {
      // Build capacity object based on business type
      const capacity: any = {};
      const businessType = businessTypes.find(t => t.value === addFormData.factoryType);
      
      if (businessType) {
        if (businessType.hasCapacity || businessType.hasProductionCapacity || businessType.hasPowerCapacity) {
          capacity.main = addFormData.factoryCapacity;
        }
        if (businessType.hasStoreSize) {
          capacity.storeSize = addFormData.factoryStoreSize;
        }
        if (businessType.hasBeds || businessType.hasRooms || businessType.hasFleetSize) {
          capacity.units = addFormData.factoryCapacity;
        }
        if (addFormData.factoryEmployees) {
          capacity.employees = parseInt(addFormData.factoryEmployees);
        }
      }
      
      const res = await fetch(`${API_URL}/api/factories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: addFormData.factoryName,
          code: addFormData.factoryCode,
          type: addFormData.factoryType,
          companyId: addFormData.factoryCompanyId || companies[0]?.id,
          location: {
            city: addFormData.factoryCity,
            state: addFormData.factoryState,
            address: addFormData.factoryAddress,
          },
          capacity: capacity
        })
      });

      if (res.ok) {
        toast.success('Business unit created successfully');
        setShowAddForm(false);
        resetAddForm();
        loadAllData();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create business unit');
      }
    } catch (error) {
      toast.error('Error creating business unit');
    }
  };

  const resetAddForm = () => {
    setAddFormData({
      companyName: '',
      companyCode: '',
      companyEmail: '',
      companyPhone: '',
      companyGst: '',
      companyPan: '',
      companyAddress: '',
      userName: '',
      userUsername: '',
      userEmail: '',
      userPassword: '',
      userRole: 'VIEWER',
      userCompanyId: '',
      factoryName: '',
      factoryCode: generateBusinessCode('MANUFACTURING'),
      factoryType: 'MANUFACTURING',
      factoryCompanyId: '',
      factoryCity: '',
      factoryState: '',
      factoryAddress: '',
      factoryCapacity: '',
      factoryStoreSize: '',
      factoryEmployees: '',
      factorySpecialty: '',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div>Loading master data...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Master Data Management</h1>
          <p className="text-gray-600">Manage all companies, users, and factories in the system</p>
          <p className="text-sm text-blue-600 mt-2">
            ℹ️ Only SUPER_ADMIN users can modify data in this section
          </p>
        </div>


        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Companies</h2>
              <Button
                onClick={() => {
                  setShowAddForm(true);
                  resetAddForm();
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Company
              </Button>
            </div>
            
            {showAddForm && (
              <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-4">Create New Company</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Name *</label>
                    <input
                      type="text"
                      value={addFormData.companyName}
                      onChange={(e) => setAddFormData({...addFormData, companyName: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Code *</label>
                    <input
                      type="text"
                      value={addFormData.companyCode}
                      onChange={(e) => setAddFormData({...addFormData, companyCode: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="e.g., MSPIL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={addFormData.companyEmail}
                      onChange={(e) => setAddFormData({...addFormData, companyEmail: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="company@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="text"
                      value={addFormData.companyPhone}
                      onChange={(e) => setAddFormData({...addFormData, companyPhone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="+91 XXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">GST Number</label>
                    <input
                      type="text"
                      value={addFormData.companyGst}
                      onChange={(e) => setAddFormData({...addFormData, companyGst: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="GST number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">PAN Number</label>
                    <input
                      type="text"
                      value={addFormData.companyPan}
                      onChange={(e) => setAddFormData({...addFormData, companyPan: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="PAN number"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <textarea
                      value={addFormData.companyAddress}
                      onChange={(e) => setAddFormData({...addFormData, companyAddress: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={2}
                      placeholder="Company address"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={createCompany}
                    disabled={!addFormData.companyName || !addFormData.companyCode || !addFormData.companyEmail}
                  >
                    Create Company
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      resetAddForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Users</h2>
              <Button
                onClick={() => {
                  setShowAddForm(true);
                  resetAddForm();
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            </div>
            
            {showAddForm && (
              <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-4">Create New User</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={addFormData.userName}
                      onChange={(e) => setAddFormData({...addFormData, userName: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Username *</label>
                    <input
                      type="text"
                      value={addFormData.userUsername}
                      onChange={(e) => setAddFormData({...addFormData, userUsername: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Username for login"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={addFormData.userEmail}
                      onChange={(e) => setAddFormData({...addFormData, userEmail: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password *</label>
                    <input
                      type="password"
                      value={addFormData.userPassword}
                      onChange={(e) => setAddFormData({...addFormData, userPassword: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Min 8 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role *</label>
                    <select
                      value={addFormData.userRole}
                      onChange={(e) => setAddFormData({...addFormData, userRole: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="VIEWER">VIEWER</option>
                      <option value="OPERATOR">OPERATOR</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Company *</label>
                    <select
                      value={addFormData.userCompanyId}
                      onChange={(e) => setAddFormData({...addFormData, userCompanyId: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select Company</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={createUser}
                    disabled={!addFormData.userName || !addFormData.userUsername || !addFormData.userEmail || !addFormData.userPassword}
                  >
                    Create User
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      resetAddForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
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
                      <th className="text-left p-2">Company</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        {editingUser === user.id ? (
                          <>
                            <td className="p-2">
                              <input
                                type="text"
                                value={editFormData.name}
                                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={editFormData.username}
                                onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                                disabled
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="email"
                                value={editFormData.email}
                                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                                disabled
                              />
                            </td>
                            <td className="p-2">
                              <select
                                value={editFormData.role}
                                onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                              >
                                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="MANAGER">MANAGER</option>
                                <option value="OPERATOR">OPERATOR</option>
                                <option value="VIEWER">VIEWER</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <select
                                value={editFormData.companyId}
                                onChange={(e) => setEditFormData({...editFormData, companyId: e.target.value})}
                                className="w-full px-2 py-1 border rounded"
                              >
                                {companies.map(company => (
                                  <option key={company.id} value={company.id}>{company.name}</option>
                                ))}
                              </select>
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
                                  onClick={() => saveUserEdit(user.id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingUser(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
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
                                {user.company?.name || 'No Company'}
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
                                  onClick={() => startEditUser(user)}
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
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Business Tab */}
        {activeTab === 'factories' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Business Units</h2>
              <Button
                onClick={() => {
                  setShowAddForm(true);
                  resetAddForm();
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Business
              </Button>
            </div>
            
            {showAddForm && (
              <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-4">Create New Business Unit</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Business Name *</label>
                    <input
                      type="text"
                      value={addFormData.factoryName}
                      onChange={(e) => setAddFormData({...addFormData, factoryName: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter business name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Business Code</label>
                    <input
                      type="text"
                      value={addFormData.factoryCode}
                      onChange={(e) => setAddFormData({...addFormData, factoryCode: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md bg-gray-100"
                      placeholder="Auto-generated"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Business Type *</label>
                    <select
                      value={addFormData.factoryType}
                      onChange={(e) => handleBusinessTypeChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {businessTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Company *</label>
                    <select
                      value={addFormData.factoryCompanyId}
                      onChange={(e) => setAddFormData({...addFormData, factoryCompanyId: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select Company</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input
                      type="text"
                      value={addFormData.factoryCity}
                      onChange={(e) => setAddFormData({...addFormData, factoryCity: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State *</label>
                    <input
                      type="text"
                      value={addFormData.factoryState}
                      onChange={(e) => setAddFormData({...addFormData, factoryState: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="State"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium">Address</label>
                      <button
                        type="button"
                        onClick={copyCompanyAddress}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy from Company
                      </button>
                    </div>
                    <textarea
                      value={addFormData.factoryAddress}
                      onChange={(e) => setAddFormData({...addFormData, factoryAddress: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={2}
                      placeholder="Business address"
                    />
                  </div>
                  
                  {/* Dynamic fields based on business type */}
                  {businessTypes.find(t => t.value === addFormData.factoryType)?.hasCapacity && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Production Capacity</label>
                      <input
                        type="text"
                        value={addFormData.factoryCapacity}
                        onChange={(e) => setAddFormData({...addFormData, factoryCapacity: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., 10000 units/month"
                      />
                    </div>
                  )}
                  
                  {businessTypes.find(t => t.value === addFormData.factoryType)?.hasStoreSize && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Store Size (sq ft)</label>
                      <input
                        type="number"
                        value={addFormData.factoryStoreSize}
                        onChange={(e) => setAddFormData({...addFormData, factoryStoreSize: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., 5000"
                      />
                    </div>
                  )}
                  
                  {businessTypes.find(t => t.value === addFormData.factoryType)?.hasBeds && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Number of Beds</label>
                      <input
                        type="number"
                        value={addFormData.factoryCapacity}
                        onChange={(e) => setAddFormData({...addFormData, factoryCapacity: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., 200"
                      />
                    </div>
                  )}
                  
                  {businessTypes.find(t => t.value === addFormData.factoryType)?.hasRooms && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Number of Rooms</label>
                      <input
                        type="number"
                        value={addFormData.factoryCapacity}
                        onChange={(e) => setAddFormData({...addFormData, factoryCapacity: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., 150"
                      />
                    </div>
                  )}
                  
                  {businessTypes.find(t => t.value === addFormData.factoryType)?.hasFleetSize && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Fleet Size</label>
                      <input
                        type="number"
                        value={addFormData.factoryCapacity}
                        onChange={(e) => setAddFormData({...addFormData, factoryCapacity: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., 50 vehicles"
                      />
                    </div>
                  )}
                  
                  {businessTypes.find(t => t.value === addFormData.factoryType)?.hasPowerCapacity && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Power Capacity (MW)</label>
                      <input
                        type="number"
                        value={addFormData.factoryCapacity}
                        onChange={(e) => setAddFormData({...addFormData, factoryCapacity: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., 100"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Number of Employees</label>
                    <input
                      type="number"
                      value={addFormData.factoryEmployees}
                      onChange={(e) => setAddFormData({...addFormData, factoryEmployees: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="e.g., 250"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={createFactory}
                    disabled={!addFormData.factoryName || !addFormData.factoryCity || !addFormData.factoryState}
                  >
                    Create Business
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      resetAddForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {factories.length === 0 ? (
              <p className="text-gray-500">No business units found</p>
            ) : (
              <div className="grid gap-4">
                {factories.map((factory) => (
                  <div key={factory.id} className="border rounded p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{factory.name}</h3>
                      <p className="text-sm text-gray-600">Code: {factory.code}</p>
                      <p className="text-sm text-gray-600">Type: {businessTypes.find(t => t.value === factory.type)?.label || factory.type}</p>
                      <p className="text-sm text-gray-600">
                        Location: {factory.location?.city}, {factory.location?.state}
                      </p>
                      {factory.capacity && (
                        <div className="mt-2 text-sm text-gray-600">
                          {Object.entries(factory.capacity).map(([key, value]) => 
                            value ? `${key}: ${value} ` : ''
                          ).filter(Boolean).join(', ')}
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
            <>
              <p className="text-sm text-orange-600 mt-2">
                ⚠️ You have multiple companies. For single-company operation, please delete the extra companies.
              </p>
              <div className="mt-4">
                <p className="text-sm text-gray-700 mb-2">
                  To delete a company with users, first move users to another company:
                </p>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/switch-company'}
                >
                  Go to Switch Company Tool
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
      </div>
    </DashboardLayout>
  );
}

export default function MasterDataPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div>Loading master data...</div>
        </div>
      </DashboardLayout>
    }>
      <MasterDataContent />
    </Suspense>
  );
}