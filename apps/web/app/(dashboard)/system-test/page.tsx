'use client';

import { useState, useEffect } from 'react';
import { Check, X, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'checking' | 'healthy' | 'error' | 'unknown';
  message?: string;
  response?: any;
}

export default function SystemTestPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'API Gateway',
      url: `${apiUrl}/health`,
      status: 'unknown'
    },
    {
      name: 'Core API',
      url: `${apiUrl}/api/core/health`,
      status: 'unknown'
    },
    {
      name: 'MCP Orchestrator',
      url: `${apiUrl}/api/mcp/health`,
      status: 'unknown'
    },
    {
      name: 'Database Connection',
      url: `${apiUrl}/api/system/database`,
      status: 'unknown'
    }
  ]);
  const [isChecking, setIsChecking] = useState(false);

  const checkService = async (service: ServiceStatus): Promise<ServiceStatus> => {
    try {
      const response = await fetch(service.url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
      
      const data = await response.json();
      
      return {
        ...service,
        status: response.ok ? 'healthy' : 'error',
        message: data.status || data.error || 'Service responded',
        response: data
      };
    } catch (error) {
      return {
        ...service,
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  };

  const runHealthChecks = async () => {
    setIsChecking(true);
    
    // Set all services to checking state
    setServices(prev => prev.map(s => ({ ...s, status: 'checking' })));
    
    // Check all services
    const results = await Promise.all(
      services.map(service => checkService(service))
    );
    
    setServices(results);
    setIsChecking(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'healthy':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'checking':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Test</h1>
        <p className="text-gray-600 mt-1">
          Check the health status of all ERP system components
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Service Health Status</CardTitle>
          <CardDescription>
            Real-time status of all microservices and system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.url}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                    {service.status === 'checking' ? 'Checking...' : service.status}
                  </span>
                  {service.message && (
                    <p className="text-xs text-gray-500 mt-1">{service.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={runHealthChecks}
              disabled={isChecking}
              className="gap-2"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Rerun Health Checks
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Architecture Overview</CardTitle>
          <CardDescription>
            Modern ERP microservices architecture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Frontend</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Next.js 14 with TypeScript</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Professional dashboard UI</li>
                <li>• Master Data management</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Backend Services</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• API Gateway (Port 4000)</li>
                <li>• Core API (Port 3001)</li>
                <li>• MCP Orchestrator (Port 3000)</li>
                <li>• PostgreSQL Database</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2 text-blue-900">Key Features</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• JWT-based authentication</li>
              <li>• Multi-tenant company support</li>
              <li>• AI-powered MCP integration</li>
              <li>• Real-time WebSocket support</li>
              <li>• PostgreSQL-based caching</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}