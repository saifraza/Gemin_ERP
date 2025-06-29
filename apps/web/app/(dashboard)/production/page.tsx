'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Factory, 
  Gauge, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Clock,
  BarChart3,
  Activity
} from 'lucide-react';
import ProductionDashboard from '@/components/production/production-dashboard';
import ProductionPlanning from '@/components/production/production-planning';
import ProductionMonitoring from '@/components/production/production-monitoring';
import ProductionReports from '@/components/production/production-reports';

export default function ProductionPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Production Management</h1>
          <p className="text-gray-400 mt-1">Monitor and manage production across all divisions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
          <Button className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            New Production Order
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Daily Production</p>
                <p className="text-2xl font-bold text-white">1,245 MT</p>
                <p className="text-green-500 text-sm mt-1">+12% from yesterday</p>
              </div>
              <Gauge className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Efficiency Rate</p>
                <p className="text-2xl font-bold text-white">94.5%</p>
                <Progress value={94.5} className="mt-2" />
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Orders</p>
                <p className="text-2xl font-bold text-white">18</p>
                <p className="text-gray-400 text-sm mt-1">6 high priority</p>
              </div>
              <Activity className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Downtime</p>
                <p className="text-2xl font-bold text-white">2.5 hrs</p>
                <p className="text-red-500 text-sm mt-1">2 incidents today</p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Planning
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time Monitoring
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ProductionDashboard />
        </TabsContent>

        <TabsContent value="planning">
          <ProductionPlanning />
        </TabsContent>

        <TabsContent value="monitoring">
          <ProductionMonitoring />
        </TabsContent>

        <TabsContent value="reports">
          <ProductionReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}