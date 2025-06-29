'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wrench, 
  AlertTriangle, 
  Calendar, 
  CheckCircle,
  Clock,
  Activity,
  Settings
} from 'lucide-react';
import MaintenanceDashboard from '@/components/maintenance/maintenance-dashboard';
import WorkOrders from '@/components/maintenance/work-orders';
import PreventiveMaintenance from '@/components/maintenance/preventive-maintenance';
import AssetManagement from '@/components/maintenance/asset-management';

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Maintenance Management</h1>
          <p className="text-gray-400 mt-1">Manage equipment maintenance and work orders</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
          <Button className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            New Work Order
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Open Work Orders</p>
                <p className="text-2xl font-bold text-white">24</p>
                <p className="text-yellow-500 text-sm mt-1">8 high priority</p>
              </div>
              <Wrench className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Equipment Uptime</p>
                <p className="text-2xl font-bold text-white">96.5%</p>
                <Progress value={96.5} className="mt-2" />
              </div>
              <Activity className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Scheduled Today</p>
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-gray-400 text-sm mt-1">PM tasks</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Critical Alerts</p>
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-red-500 text-sm mt-1">Immediate action</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="work-orders" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Work Orders
          </TabsTrigger>
          <TabsTrigger value="preventive" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Preventive Maintenance
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Asset Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <MaintenanceDashboard />
        </TabsContent>

        <TabsContent value="work-orders">
          <WorkOrders />
        </TabsContent>

        <TabsContent value="preventive">
          <PreventiveMaintenance />
        </TabsContent>

        <TabsContent value="assets">
          <AssetManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}