'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Truck, 
  Warehouse, 
  ShoppingCart, 
  TrendingUp,
  AlertCircle,
  Clock,
  DollarSign,
  BarChart3,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  FileSearch,
  GitCompare,
  ClipboardCheck,
  PackageCheck,
  Repeat,
  TruckIcon,
  CheckSquare,
  Package2,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';

// Business Cycle Flow
const businessCycleSteps = [
  {
    id: 'indent',
    title: 'Material Indent',
    icon: FileText,
    description: 'Raise material requirements',
    status: 'active',
    count: 23,
    href: '/supply-chain/procurement/indent'
  },
  {
    id: 'rfq',
    title: 'RFQ Management',
    icon: FileSearch,
    description: 'Request for quotations',
    status: 'active',
    count: 15,
    href: '/supply-chain/procurement/rfq'
  },
  {
    id: 'quotations',
    title: 'Quotations',
    icon: FileSpreadsheet,
    description: 'Vendor quotations',
    status: 'active',
    count: 42,
    href: '/supply-chain/procurement/quotations'
  },
  {
    id: 'comparison',
    title: 'Compare & Select',
    icon: GitCompare,
    description: 'Compare vendor quotes',
    status: 'pending',
    count: 8,
    href: '/supply-chain/procurement/comparison'
  },
  {
    id: 'approval',
    title: 'Approval',
    icon: ClipboardCheck,
    description: 'Get management approval',
    status: 'pending',
    count: 5,
    href: '/supply-chain/procurement/approval'
  },
  {
    id: 'po',
    title: 'Purchase Order',
    icon: ShoppingCart,
    description: 'Create & send PO',
    status: 'pending',
    count: 0,
    href: '/supply-chain/procurement/purchase-orders'
  },
  {
    id: 'tracking',
    title: 'Order Tracking',
    icon: Package2,
    description: 'Track shipments',
    status: 'pending',
    count: 18,
    href: '/supply-chain/tracking'
  },
  {
    id: 'receipt',
    title: 'Goods Receipt',
    icon: PackageCheck,
    description: 'Receive & inspect',
    status: 'pending',
    count: 12,
    href: '/supply-chain/warehouse/receipt'
  },
  {
    id: 'quality',
    title: 'Quality Check',
    icon: CheckSquare,
    description: 'Verify quality standards',
    status: 'pending',
    count: 7,
    href: '/supply-chain/quality'
  },
  {
    id: 'storage',
    title: 'Put Away',
    icon: Warehouse,
    description: 'Store in warehouse',
    status: 'pending',
    count: 0,
    href: '/supply-chain/warehouse/putaway'
  }
];

// Main Supply Chain Modules
const supplyChainModules = [
  {
    title: 'Procurement',
    href: '/supply-chain/procurement',
    icon: ShoppingCart,
    description: 'End-to-end procurement process from indent to PO',
    metrics: { active: 89, pending: 23, value: '₹4.2M' },
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    subModules: [
      'Material Indents',
      'RFQ Management', 
      'Vendor Quotations',
      'Price Comparison',
      'Purchase Orders'
    ]
  },
  {
    title: 'Inventory Management',
    href: '/supply-chain/inventory',
    icon: Package,
    description: 'Real-time inventory tracking and optimization',
    metrics: { items: 1250, lowStock: 23, accuracy: '98.5%' },
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    subModules: [
      'Stock Levels',
      'Item Master',
      'Stock Movements',
      'Reorder Management',
      'Inventory Valuation'
    ]
  },
  {
    title: 'Warehouse Operations',
    href: '/supply-chain/warehouse',
    icon: Warehouse,
    description: 'Optimize warehouse efficiency and space utilization',
    metrics: { utilization: '78%', pending: 34, efficiency: '92%' },
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    subModules: [
      'Goods Receipt',
      'Put Away',
      'Picking',
      'Packing',
      'Shipping'
    ]
  },
  {
    title: 'Transportation',
    href: '/supply-chain/transportation',
    icon: Truck,
    description: 'Fleet management and shipment tracking',
    metrics: { active: 18, delivered: 234, onTime: '94%' },
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    subModules: [
      'Fleet Management',
      'Route Planning',
      'Shipment Tracking',
      'Carrier Management',
      'Freight Cost'
    ]
  }
];

const kpis = [
  { 
    label: 'Procurement Cycle Time', 
    value: '4.2 days', 
    trend: '-12%', 
    isPositive: true,
    description: 'Indent to PO'
  },
  { 
    label: 'Vendor Performance', 
    value: '94.3%', 
    trend: '+2.1%', 
    isPositive: true,
    description: 'On-time delivery'
  },
  { 
    label: 'Inventory Turnover', 
    value: '8.2x', 
    trend: '+5%', 
    isPositive: true,
    description: 'Annual'
  },
  { 
    label: 'Cost Savings', 
    value: '₹2.4M', 
    trend: '+18%', 
    isPositive: true,
    description: 'This quarter'
  }
];

export default function SupplyChainPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Supply Chain Management</h1>
          <p className="text-gray-600 mt-1">Complete procurement to delivery cycle management</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-gray-600">{kpi.label}</p>
                <Badge 
                  variant={kpi.isPositive ? "default" : "destructive"}
                  className="text-xs"
                >
                  {kpi.isPositive ? <ArrowDownRight className="w-3 h-3 mr-1" /> : <ArrowUpRight className="w-3 h-3 mr-1" />}
                  {kpi.trend}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
            </Card>
          ))}
        </div>

        {/* Business Cycle Flow */}
        <Card className="mb-8 p-6">
          <h2 className="text-lg font-semibold mb-4">Procurement Business Cycle</h2>
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {businessCycleSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <Link href={step.href}>
                    <div className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all cursor-pointer min-w-[120px] ${
                      step.status === 'active' 
                        ? 'border-blue-500 bg-blue-50 hover:bg-blue-100' 
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}>
                      <div className={`p-2 rounded-full mb-2 ${
                        step.status === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-center">{step.title}</span>
                      {step.count > 0 && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {step.count}
                        </Badge>
                      )}
                    </div>
                  </Link>
                  {index < businessCycleSteps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-gray-400 mx-2 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {supplyChainModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${module.bgColor}`}>
                      <Icon className={`w-8 h-8 ${module.color}`} />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-xl mb-2">{module.title}</h3>
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  
                  {/* Metrics */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    {Object.entries(module.metrics).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="text-gray-500 capitalize">{key}:</span>
                        <span className="font-semibold ml-1">{value}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Sub-modules */}
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500 uppercase mb-2">Key Features</p>
                    <div className="flex flex-wrap gap-2">
                      {module.subModules.map((subModule, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {subModule}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="p-4 border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold">23</p>
                <p className="text-xs text-gray-500 mt-1">5 urgent</p>
              </div>
              <ClipboardCheck className="w-8 h-8 text-yellow-500 opacity-20" />
            </div>
          </Card>
          
          <Card className="p-4 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold">17</p>
                <p className="text-xs text-gray-500 mt-1">Immediate action required</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500 opacity-20" />
            </div>
          </Card>
          
          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold">34</p>
                <p className="text-xs text-gray-500 mt-1">Expected this week: 12</p>
              </div>
              <TruckIcon className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Create Material Indent
          </Button>
          <Button variant="outline">
            <Package className="w-4 h-4 mr-2" />
            Check Inventory
          </Button>
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}