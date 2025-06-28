'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function SwitchCompanyPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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

  const loadData = async () => {
    setLoading(true);
    try {
      // Get current user info
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        const parsed = JSON.parse(authData);
        setCurrentUser(parsed.state.user);
      }

      // Load all companies (as SUPER_ADMIN you should see all)
      const res = await fetch(`${API_URL}/api/companies`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const switchToCompany = async (companyId: string, companyName: string) => {
    if (!currentUser) {
      toast.error('No user found');
      return;
    }

    setSwitching(true);
    try {
      // Update user's company
      const res = await fetch(`${API_URL}/api/users/${currentUser.id}/company`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ companyId })
      });

      if (res.ok) {
        toast.success(`Switched to ${companyName}! Please log in again.`);
        // Force logout to refresh everything
        setTimeout(() => {
          window.location.href = '/auth/logout';
        }, 1000);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to switch company');
      }
    } catch (error) {
      console.error('Error switching company:', error);
      toast.error('Failed to switch company');
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading companies...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Switch Company</h1>
          <p className="text-gray-600">Move your user account to a different company</p>
        </div>

        {currentUser && (
          <Card className="p-6 mb-6 bg-blue-50">
            <h3 className="font-semibold mb-2">Current Status</h3>
            <p>User: {currentUser.name} ({currentUser.username})</p>
            <p>Current Company: {currentUser.company?.name || 'No Company'}</p>
            <p>Role: {currentUser.role}</p>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Available Companies</h2>
          {companies.length === 0 ? (
            <p className="text-gray-500">No companies found</p>
          ) : (
            <div className="space-y-4">
              {companies.map((company) => (
                <div key={company.id} className="border rounded p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-500" />
                    <div>
                      <h3 className="font-semibold">{company.name}</h3>
                      <p className="text-sm text-gray-600">
                        Code: {company.code} | Users: {company._count?.users || 0}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => switchToCompany(company.id, company.name)}
                    disabled={switching || currentUser?.companyId === company.id}
                    className={currentUser?.companyId === company.id ? 'bg-gray-400' : ''}
                  >
                    {currentUser?.companyId === company.id ? 'Current' : 'Switch'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => router.push('/master-data')}>
            Back to Master Data
          </Button>
        </div>
      </div>
    </div>
  );
}