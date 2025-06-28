'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ServiceStatus {
  name: string;
  endpoint: string;
  status: 'checking' | 'online' | 'offline' | 'error';
  message?: string;
  response?: any;
}

export default function TestPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'API Gateway', endpoint: '/health', status: 'checking' },
    { name: 'Auth Service', endpoint: '/api/auth/health', status: 'checking' },
    { name: 'Company Service', endpoint: '/api/companies', status: 'checking' },
    { name: 'Test Service', endpoint: '/api/test/version', status: 'checking' },
  ]);

  const checkService = async (index: number) => {
    const service = services[index];
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    try {
      const response = await fetch(`${apiUrl}${service.endpoint}`);
      const data = await response.json();
      
      setServices(prev => {
        const updated = [...prev];
        updated[index] = {
          ...service,
          status: response.ok ? 'online' : 'error',
          message: response.ok ? 'Service is running' : `HTTP ${response.status}`,
          response: data,
        };
        return updated;
      });
    } catch (error: any) {
      setServices(prev => {
        const updated = [...prev];
        updated[index] = {
          ...service,
          status: 'offline',
          message: error.message,
        };
        return updated;
      });
    }
  };

  const checkAllServices = () => {
    services.forEach((_, index) => {
      checkService(index);
    });
  };

  const testCompanyCreation = async () => {
    try {
      const testCompany = {
        name: 'Test Company ' + Date.now(),
        code: 'TEST' + Date.now(),
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          country: 'India',
          postalCode: '123456',
        },
        phone: '+91 9876543210',
        email: 'test@example.com',
        gstNumber: '29ABCDE1234F1Z5',
        panNumber: 'ABCDE1234F',
      };

      const result = await api.createCompany(testCompany);
      toast.success('Company created successfully!');
      console.log('Created company:', result);
    } catch (error: any) {
      toast.error(error.message);
      console.error('Company creation error:', error);
    }
  };

  const testAuth = async () => {
    try {
      // First register a test user
      const testUser = {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User',
        username: `testuser${Date.now()}`,
      };

      const registerResult = await api.register(testUser);
      console.log('Registered user:', registerResult);
      
      // Then try to login
      const loginResult = await api.login(testUser.email, testUser.password);
      console.log('Login result:', loginResult);
      
      if (loginResult.token) {
        localStorage.setItem('auth_token', loginResult.token);
        toast.success('Auth test successful! Token saved.');
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error('Auth test error:', error);
    }
  };

  useEffect(() => {
    checkAllServices();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'error': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Backend Services Test</h1>
          <p className="text-gray-400">Test connectivity to all backend services</p>
        </div>

        <div className="grid gap-6">
          {/* Service Status */}
          <Card className="bg-[#1a1f2e] border-gray-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Service Status</h2>
              <Button onClick={checkAllServices} className="bg-blue-600 hover:bg-blue-700">
                Refresh All
              </Button>
            </div>
            
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={service.name} className="flex items-center justify-between p-4 bg-[#0f1419] rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-400">{service.endpoint}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{service.message}</div>
                    {service.response && (
                      <details className="text-xs text-gray-400 cursor-pointer">
                        <summary>View Response</summary>
                        <pre className="mt-2 p-2 bg-[#1a1f2e] rounded text-left overflow-auto max-w-md">
                          {JSON.stringify(service.response, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Test Actions */}
          <Card className="bg-[#1a1f2e] border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-6">Test Actions</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Authentication Test</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Register a new user and login to get an auth token
                </p>
                <Button onClick={testAuth} className="w-full bg-green-600 hover:bg-green-700">
                  Test Auth Flow
                </Button>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Company Creation Test</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Create a test company (requires auth token)
                </p>
                <Button onClick={testCompanyCreation} className="w-full bg-purple-600 hover:bg-purple-700">
                  Create Test Company
                </Button>
              </div>
            </div>
          </Card>

          {/* Connection Info */}
          <Card className="bg-[#1a1f2e] border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Connection Info</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">API URL:</span>{' '}
                <span className="font-mono">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}</span>
              </div>
              <div>
                <span className="text-gray-400">Environment:</span>{' '}
                <span className="font-mono">{process.env.NODE_ENV}</span>
              </div>
              <div>
                <span className="text-gray-400">Auth Token:</span>{' '}
                <span className="font-mono">
                  {localStorage.getItem('auth_token') ? 'Present' : 'Not set'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}