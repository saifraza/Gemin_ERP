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
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';

const supplyChainModules = [
  {
    title: 'Procurement',
    href: '/supply-chain/procurement',
    icon: ShoppingCart,
    description: 'Purchase orders, requisitions, and vendor management',
    stats: { pending: 12, approved: 145, value: '₹2.4M' },
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Inventory Management',
    href: '/supply-chain/inventory',
    icon: Package,
    description: 'Stock control, item master, and inventory optimization',
    stats: { items: 1250, lowStock: 23, value: '₹8.2M' },
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    title: 'Warehouse Management',
    href: '/supply-chain/warehouse',
    icon: Warehouse,
    description: 'Receiving, storage, picking, and shipping operations',
    stats: { locations: 5, utilization: 78, pending: 34 },
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    title: 'Transportation',
    href: '/supply-chain/transportation',
    icon: Truck,
    description: 'Shipment planning, carrier management, and tracking',
    stats: { activeShipments: 18, delivered: 234, onTime: 94 },
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    title: 'Demand Planning',
    href: '/supply-chain/demand-planning',
    icon: TrendingUp,
    description: 'Forecasting, collaborative planning, and demand sensing',
    stats: { accuracy: 87, forecasts: 45, alerts: 3 },
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  {
    title: 'Supply Planning',
    href: '/supply-chain/supply-planning',
    icon: BarChart3,
    description: 'Distribution planning, master planning, and ATP',
    stats: { plans: 12, constraints: 5, optimized: 89 },
    color: 'text-pink-600',
    bgColor: 'bg-pink-50'
  }
];

const kpis = [
  { 
    label: 'Inventory Turnover', 
    value: '8.2x', 
    trend: '+12%', 
    isPositive: true,
    description: 'Last 30 days'
  },
  { 
    label: 'Perfect Order Rate', 
    value: '94.3%', 
    trend: '+2.1%', 
    isPositive: true,
    description: 'This month'
  },
  { 
    label: 'Stock-out Rate', 
    value: '2.8%', 
    trend: '-0.5%', 
    isPositive: true,
    description: 'vs. target 3%'
  },
  { 
    label: 'Supply Chain Cost', 
    value: '₹12.4M', 
    trend: '+5.2%', 
    isPositive: false,
    description: 'This quarter'
  }
];

const recentActivities = [
  { type: 'po', icon: FileText, text: 'PO #2024-1234 approved for ₹125,000', time: '5 minutes ago', status: 'success' },
  { type: 'inventory', icon: AlertCircle, text: 'Low stock alert: Raw Sugar (< 500 MT)', time: '15 minutes ago', status: 'warning' },
  { type: 'shipment', icon: Truck, text: 'Shipment #SH-4567 delivered to Mumbai plant', time: '1 hour ago', status: 'success' },
  { type: 'vendor', icon: Users, text: 'New vendor registration: ABC Chemicals Ltd', time: '2 hours ago', status: 'info' },
  { type: 'quality', icon: XCircle, text: 'Quality issue reported for batch #B-8901', time: '3 hours ago', status: 'error' }
];

const topSuppliers = [
  { name: 'Krishna Sugars Ltd', spend: '₹2.4M', orders: 145, rating: 4.8, performance: 96 },
  { name: 'Bharat Chemicals', spend: '₹1.8M', orders: 89, rating: 4.5, performance: 92 },
  { name: 'Global Packaging Co', spend: '₹1.2M', orders: 234, rating: 4.7, performance: 94 },
  { name: 'Metro Logistics', spend: '₹980K', orders: 156, rating: 4.6, performance: 91 }
];

export default function SupplyChainPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Supply Chain Management</h1>
          <p className="text-gray-600 mt-1">End-to-end supply chain visibility and control</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index} className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-gray-600">{kpi.label}</p>
                <Badge 
                  variant={kpi.isPositive ? "default" : "destructive"}
                  className="text-xs"
                >
                  {kpi.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {kpi.trend}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
            </Card>
          ))}
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {supplyChainModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${module.bgColor}`}>
                      <Icon className={`w-6 h-6 ${module.color}`} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{module.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {Object.entries(module.stats).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="font-normal">
                        {key}: {typeof value === 'number' && key.includes('value') ? `₹${value}` : 
                               key === 'onTime' || key === 'utilization' || key === 'accuracy' || key === 'optimized' ? `${value}%` : value}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Activities</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'success' ? 'bg-green-50' :
                      activity.status === 'warning' ? 'bg-yellow-50' :
                      activity.status === 'error' ? 'bg-red-50' : 'bg-blue-50'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        activity.status === 'success' ? 'text-green-600' :
                        activity.status === 'warning' ? 'text-yellow-600' :
                        activity.status === 'error' ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Top Suppliers */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Top Suppliers</h2>
              <Button variant="ghost" size="sm">Manage Suppliers</Button>
            </div>
            <div className="space-y-4">
              {topSuppliers.map((supplier, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{supplier.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">Spend: {supplier.spend}</span>
                      <span className="text-xs text-gray-500">Orders: {supplier.orders}</span>
                      <span className="text-xs text-gray-500">Rating: ⭐ {supplier.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{supplier.performance}%</p>
                    <Progress value={supplier.performance} className="w-20 h-2 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium">3 items require immediate attention</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">View Alerts</Button>
              <Button size="sm">Create Purchase Order</Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}