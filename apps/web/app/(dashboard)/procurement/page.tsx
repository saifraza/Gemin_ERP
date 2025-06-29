'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Users,
  FileText,
  Plus,
  BarChart,
  Calendar
} from 'lucide-react';
import ProcurementDashboard from '@/components/procurement/procurement-dashboard';
import PurchaseRequisition from '@/components/procurement/purchase-requisition';
import VendorManagement from '@/components/procurement/vendor-management';
import PurchaseAnalytics from '@/components/procurement/purchase-analytics';

export default function ProcurementPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Procurement Management</h1>
          <p className="text-gray-400 mt-1">Manage purchases, vendors, and procurement analytics</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Vendors
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Purchase Request
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Approvals</p>
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-yellow-500 text-sm mt-1">₹45.2L value</p>
              </div>
              <FileText className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active POs</p>
                <p className="text-2xl font-bold text-white">28</p>
                <Progress value={65} className="mt-2" />
              </div>
              <ShoppingCart className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Monthly Spend</p>
                <p className="text-2xl font-bold text-white">₹3.2Cr</p>
                <p className="text-green-500 text-sm mt-1">-8% vs last month</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Vendors</p>
                <p className="text-2xl font-bold text-white">142</p>
                <p className="text-gray-400 text-sm mt-1">89% compliant</p>
              </div>
              <Users className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="requisition" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Purchase Requisition
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Vendor Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ProcurementDashboard />
        </TabsContent>

        <TabsContent value="requisition">
          <PurchaseRequisition />
        </TabsContent>

        <TabsContent value="vendors">
          <VendorManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <PurchaseAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}