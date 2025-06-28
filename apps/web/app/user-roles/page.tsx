'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Shield, User, ChevronDown } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', color: 'bg-red-600' },
  { value: 'ADMIN', label: 'Admin', color: 'bg-blue-600' },
  { value: 'MANAGER', label: 'Manager', color: 'bg-green-600' },
  { value: 'OPERATOR', label: 'Operator', color: 'bg-yellow-600' },
  { value: 'VIEWER', label: 'Viewer', color: 'bg-gray-600' },
];

export default function UserRolesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        toast.success('User role updated successfully');
        loadUsers(); // Reload users
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  const getRoleColor = (role: string) => {
    return ROLES.find(r => r.value === role)?.color || 'bg-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">User Roles Management</h1>
          <p className="text-gray-600">Manage user roles and permissions across the system</p>
        </div>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <h2 className="text-xl font-semibold">System Users</h2>
          </div>

          {users.length === 0 ? (
            <p className="text-gray-500">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">User</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Company</th>
                    <th className="text-left p-3">Current Role</th>
                    <th className="text-left p-3">Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{user.email}</td>
                      <td className="p-3 text-sm">
                        {user.company?.name || 'No Company'}
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded text-white text-sm ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="relative">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            disabled={updating === user.id}
                            className="appearance-none bg-white border rounded px-4 py-2 pr-8 text-sm cursor-pointer hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {ROLES.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-3 w-4 h-4 pointer-events-none text-gray-400" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Role Permissions</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div>
                <span className="font-medium">SUPER_ADMIN:</span> Full system access, can see all companies, users, and data
              </div>
              <div>
                <span className="font-medium">ADMIN:</span> Full company access, can manage users and settings
              </div>
              <div>
                <span className="font-medium">MANAGER:</span> Department management, reports, and approvals
              </div>
              <div>
                <span className="font-medium">OPERATOR:</span> Data entry and basic operations
              </div>
              <div>
                <span className="font-medium">VIEWER:</span> Read-only access to reports and data
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}