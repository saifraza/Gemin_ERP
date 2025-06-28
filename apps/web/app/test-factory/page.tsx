'use client';

import { useAuthStore } from '@/stores/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function TestFactoryPage() {
  const authState = useAuthStore();
  const [myAccess, setMyAccess] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkFactoryAccess = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('No auth token found. Please login first.');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/factory-access/my-access`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMyAccess(data);
      } else {
        const error = await response.json();
        console.error('Factory access error:', error);
        setMyAccess({ error: error.error || 'Failed to get factory access' });
      }
    } catch (error) {
      console.error('Error checking factory access:', error);
      setMyAccess({ error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    try {
      // Create a test user with HQ access
      const testUser = {
        email: `hquser${Date.now()}@example.com`,
        password: 'password123',
        name: 'HQ Test User',
        username: `hquser${Date.now()}`,
        role: 'ADMIN',
        accessLevel: 'HQ'
      };

      // Register
      await api.register(testUser);
      
      // Login
      const loginResult = await api.login(testUser.username, testUser.password);
      console.log('Login result:', loginResult);
      
      // Reload page to see changes
      window.location.reload();
    } catch (error: any) {
      console.error('Test login error:', error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Factory Access Test Page</h1>
        
        <div className="grid gap-6">
          {/* Current Auth State */}
          <Card className="bg-[#1a1f2e] border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
            <pre className="bg-[#0f1419] p-4 rounded overflow-auto text-sm">
              {JSON.stringify({
                user: authState.user,
                isAuthenticated: authState.isAuthenticated,
                currentFactory: authState.currentFactory,
                allowedFactories: authState.allowedFactories,
                canAccessAllFactories: authState.canAccessAllFactories()
              }, null, 2)}
            </pre>
          </Card>

          {/* Factory Access Check */}
          <Card className="bg-[#1a1f2e] border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Factory Access from API</h2>
            <Button 
              onClick={checkFactoryAccess}
              disabled={loading}
              className="mb-4"
            >
              {loading ? 'Checking...' : 'Check My Factory Access'}
            </Button>
            
            {myAccess && (
              <pre className="bg-[#0f1419] p-4 rounded overflow-auto text-sm">
                {JSON.stringify(myAccess, null, 2)}
              </pre>
            )}
          </Card>

          {/* Test Actions */}
          <Card className="bg-[#1a1f2e] border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  Create and login as HQ user to test multi-factory access
                </p>
                <Button onClick={testLogin} variant="default">
                  Create HQ Test User & Login
                </Button>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  Check browser console for debug logs
                </p>
                <Button 
                  onClick={() => {
                    console.log('=== AUTH DEBUG ===');
                    console.log('LocalStorage auth-storage:', localStorage.getItem('auth-storage'));
                    console.log('LocalStorage auth_token:', localStorage.getItem('auth_token'));
                    console.log('Current auth state:', authState);
                  }}
                >
                  Log Debug Info to Console
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}