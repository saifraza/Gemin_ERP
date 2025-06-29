'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Beaker, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileCheck,
  TrendingUp,
  ClipboardList,
  ShieldCheck
} from 'lucide-react';
import QualityDashboard from '@/components/quality/quality-dashboard';
import LabTesting from '@/components/quality/lab-testing';
import QualityInspection from '@/components/quality/quality-inspection';
import QualityReports from '@/components/quality/quality-reports';

export default function QualityPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Quality Control</h1>
          <p className="text-gray-400 mt-1">Monitor and manage product quality across all divisions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Standards
          </Button>
          <Button className="flex items-center gap-2">
            <Beaker className="h-4 w-4" />
            New Test Request
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tests Today</p>
                <p className="text-2xl font-bold text-white">142</p>
                <p className="text-green-500 text-sm mt-1">95% passed</p>
              </div>
              <Beaker className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Quality Score</p>
                <p className="text-2xl font-bold text-white">98.5%</p>
                <p className="text-green-500 text-sm mt-1">Above target</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Tests</p>
                <p className="text-2xl font-bold text-white">18</p>
                <p className="text-yellow-500 text-sm mt-1">5 urgent</p>
              </div>
              <ClipboardList className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Compliance</p>
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-green-500 text-sm mt-1">All standards met</p>
              </div>
              <ShieldCheck className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <Beaker className="h-4 w-4" />
            Lab Testing
          </TabsTrigger>
          <TabsTrigger value="inspection" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Inspection
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <QualityDashboard />
        </TabsContent>

        <TabsContent value="testing">
          <LabTesting />
        </TabsContent>

        <TabsContent value="inspection">
          <QualityInspection />
        </TabsContent>

        <TabsContent value="reports">
          <QualityReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}