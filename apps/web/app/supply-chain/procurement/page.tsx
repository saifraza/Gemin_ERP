'use client';

import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, ShoppingCart, Package, TrendingUp, 
  CheckCircle, Clock, AlertCircle, ArrowRight,
  ChevronRight, Users, FileCheck, BarChart3,
  Archive
} from 'lucide-react';

export default function ProcurementPage() {
  // Mock stats for now
  const procurementStats = {
    indents: 5,
    rfqs: 3,
    quotations: 12,
    comparisons: 2,
    pendingApprovals: 4,
    purchaseOrders: 8,
    totalVendors: 25,
    activePOs: 6,
    monthlySpend: 125000
  };

  const businessCycleSteps = [
    {
      id: 'indent',
      title: 'Material Indent',
      icon: FileText,
      href: '/supply-chain/procurement/indent',
      stats: procurementStats.indents,
      color: 'blue',
      description: 'Create material requisitions'
    },
    {
      id: 'rfq',
      title: 'RFQ Management',
      icon: Users,
      href: '/supply-chain/procurement/rfq',
      stats: procurementStats.rfqs,
      color: 'indigo',
      description: 'Request quotations from vendors'
    },
    {
      id: 'quotations',
      title: 'Quotations',
      icon: FileCheck,
      href: '/supply-chain/procurement/quotations',
      stats: procurementStats.quotations,
      color: 'purple',
      description: 'Receive vendor quotations'
    },
    {
      id: 'compare',
      title: 'Compare & Select',
      icon: BarChart3,
      href: '/supply-chain/procurement/compare',
      stats: procurementStats.comparisons,
      color: 'pink',
      description: 'Compare and select best offers'
    },
    {
      id: 'approval',
      title: 'Approval',
      icon: CheckCircle,
      href: '/supply-chain/procurement/approval',
      stats: procurementStats.pendingApprovals,
      color: 'orange',
      description: 'Get management approvals'
    },
    {
      id: 'po',
      title: 'Purchase Order',
      icon: ShoppingCart,
      href: '/supply-chain/procurement/purchase-orders',
      stats: procurementStats.purchaseOrders,
      color: 'green',
      description: 'Create and manage POs'
    },
    {
      id: 'grn',
      title: 'Goods Receipt',
      icon: Package,
      href: '/supply-chain/procurement/grn',
      stats: 0,
      color: 'teal',
      description: 'Receive and inspect goods'
    },
    {
      id: 'putaway',
      title: 'Put Away',
      icon: Archive,
      href: '/supply-chain/procurement/putaway',
      stats: 0,
      color: 'gray',
      description: 'Store in warehouse'
    }
  ];

  const quickStats = [
    {
      title: 'Total Vendors',
      value: procurementStats.totalVendors,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active POs',
      value: procurementStats.activePOs,
      change: '+8%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'green'
    },
    {
      title: 'Pending Approvals',
      value: procurementStats.pendingApprovals,
      change: '-5%',
      trend: 'down',
      icon: Clock,
      color: 'orange'
    },
    {
      title: 'This Month Spend',
      value: `$${procurementStats.monthlySpend.toLocaleString()}`,
      change: '+15%',
      trend: 'up',
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
      gray: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Procurement Management</h1>
          <p className="text-gray-600 mt-1">
            Manage the complete procurement cycle from requisition to receipt
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            const colors = getColorClasses(stat.color);
            return (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Business Cycle Flow */}
        <Card className="mb-6 p-6">
          <h2 className="text-lg font-semibold mb-4">Procurement Business Cycle</h2>
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {businessCycleSteps.map((step, index) => {
              const Icon = step.icon;
              const colors = getColorClasses(step.color);
              return (
                <div key={step.id} className="flex items-center">
                  <Link href={step.href}>
                    <div className={`flex flex-col items-center p-4 rounded-lg border-2 ${colors.border} ${colors.bg} hover:shadow-md transition-all cursor-pointer min-w-[120px]`}>
                      <Icon className={`w-6 h-6 ${colors.text} mb-2`} />
                      <span className="text-sm font-medium text-center">{step.title}</span>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {step.stats} Active
                      </Badge>
                    </div>
                  </Link>
                  {index < businessCycleSteps.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-gray-400 mx-1 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Module Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Core Processes */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Core Processes</h3>
            <div className="space-y-3">
              {businessCycleSteps.slice(0, 6).map((step) => {
                const Icon = step.icon;
                const colors = getColorClasses(step.color);
                return (
                  <Link href={step.href} key={step.id}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colors.bg}`}>
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{step.title}</p>
                          <p className="text-sm text-gray-500">{step.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">PO Approved</p>
                  <p className="text-xs text-gray-500">PO-2024-001 approved by Finance Manager</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New Indent Created</p>
                  <p className="text-xs text-gray-500">Material indent for spare parts submitted</p>
                  <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-orange-100">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Approval Pending</p>
                  <p className="text-xs text-gray-500">5 purchase orders awaiting approval</p>
                  <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-purple-100">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Vendor Registered</p>
                  <p className="text-xs text-gray-500">New vendor ABC Supplies onboarded</p>
                  <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-4">
              View All Activity
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6 p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/supply-chain/procurement/indent">
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Create Indent
              </Button>
            </Link>
            <Link href="/supply-chain/procurement/rfq">
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                New RFQ
              </Button>
            </Link>
            <Link href="/supply-chain/procurement/vendors">
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </Link>
            <Link href="/supply-chain/procurement/reports">
              <Button variant="outline" className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Reports
              </Button>
            </Link>
          </div>
        </Card>

        {/* Info message about real data */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Database Integration Ready:</strong> The complete procurement module has been implemented with:
            • Prisma models for all procurement entities
            • RESTful API endpoints with authentication
            • React Query hooks for data fetching
            • Full CRUD operations for Material Indents, RFQs, Quotations, and Purchase Orders
            • Currently showing demo data for visualization
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}