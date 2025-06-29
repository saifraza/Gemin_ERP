'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Package, 
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  PackageOpen,
  Truck,
  Clock,
  CheckCircle
} from 'lucide-react';

// Mock data for inventory items
const inventoryItems = [
  {
    id: 'ITM001',
    name: 'Raw Sugar',
    category: 'Raw Materials',
    sku: 'RS-001',
    currentStock: 2500,
    unit: 'MT',
    reorderLevel: 500,
    reorderQty: 1000,
    location: 'Warehouse A',
    value: 125000000,
    status: 'in-stock',
    lastMovement: '2024-01-15'
  },
  {
    id: 'ITM002',
    name: 'Sulphur',
    category: 'Chemicals',
    sku: 'CH-012',
    currentStock: 45,
    unit: 'MT',
    reorderLevel: 50,
    reorderQty: 100,
    location: 'Chemical Store',
    value: 4500000,
    status: 'low-stock',
    lastMovement: '2024-01-14'
  },
  {
    id: 'ITM003',
    name: 'Sugar Bags (50kg)',
    category: 'Packaging',
    sku: 'PK-050',
    currentStock: 15000,
    unit: 'Units',
    reorderLevel: 5000,
    reorderQty: 20000,
    location: 'Warehouse B',
    value: 750000,
    status: 'in-stock',
    lastMovement: '2024-01-16'
  },
  {
    id: 'ITM004',
    name: 'Lime',
    category: 'Chemicals',
    sku: 'CH-008',
    currentStock: 0,
    unit: 'MT',
    reorderLevel: 20,
    reorderQty: 50,
    location: 'Chemical Store',
    value: 0,
    status: 'out-of-stock',
    lastMovement: '2024-01-10'
  }
];

// Mock data for recent transactions
const recentTransactions = [
  {
    id: 'TXN001',
    type: 'receipt',
    item: 'Raw Sugar',
    quantity: 500,
    unit: 'MT',
    from: 'PO-2024-001',
    to: 'Warehouse A',
    date: '2024-01-15',
    user: 'Amit Kumar'
  },
  {
    id: 'TXN002',
    type: 'issue',
    item: 'Sulphur',
    quantity: 25,
    unit: 'MT',
    from: 'Chemical Store',
    to: 'Production',
    date: '2024-01-14',
    user: 'Priya Patel'
  },
  {
    id: 'TXN003',
    type: 'transfer',
    item: 'Sugar Bags (50kg)',
    quantity: 2000,
    unit: 'Units',
    from: 'Warehouse B',
    to: 'Packing Unit',
    date: '2024-01-16',
    user: 'Rahul Sharma'
  }
];

const inventoryKPIs = [
  { 
    label: 'Total Items', 
    value: '1,250', 
    change: '+45', 
    trend: 'up',
    icon: Package 
  },
  { 
    label: 'Low Stock Items', 
    value: '23', 
    change: '+5', 
    trend: 'down',
    icon: AlertTriangle 
  },
  { 
    label: 'Inventory Value', 
    value: '₹8.2M', 
    change: '+12%', 
    trend: 'up',
    icon: TrendingUp 
  },
  { 
    label: 'Stock Accuracy', 
    value: '98.5%', 
    change: '+0.5%', 
    trend: 'up',
    icon: CheckCircle 
  }
];

const warehouseUtilization = [
  { name: 'Warehouse A', capacity: 5000, used: 3850, percentage: 77 },
  { name: 'Warehouse B', capacity: 3000, used: 2400, percentage: 80 },
  { name: 'Chemical Store', capacity: 500, used: 425, percentage: 85 },
  { name: 'Finished Goods', capacity: 2000, used: 1200, percentage: 60 }
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('stock-levels');
  const [searchQuery, setSearchQuery] = useState('');

  const getStockStatusBadge = (status: string) => {
    const statusConfig = {
      'in-stock': { variant: 'default' as const, label: 'In Stock' },
      'low-stock': { variant: 'secondary' as const, label: 'Low Stock' },
      'out-of-stock': { variant: 'destructive' as const, label: 'Out of Stock' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTransactionTypeBadge = (type: string) => {
    const typeConfig = {
      receipt: { icon: ArrowDownRight, color: 'text-green-600', bg: 'bg-green-50' },
      issue: { icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-50' },
      transfer: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' }
    };

    const config = typeConfig[type as keyof typeof typeConfig];
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${config.bg}`}>
        <Icon className={`w-3 h-3 ${config.color}`} />
        <span className={`text-xs font-medium ${config.color}`}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      </div>
    );
  };

  const inventoryColumns = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Item Name' },
    { key: 'category', label: 'Category' },
    { 
      key: 'currentStock', 
      label: 'Current Stock',
      render: (item: any) => (
        <div>
          <span className="font-medium">{item.currentStock.toLocaleString()}</span>
          <span className="text-gray-500 ml-1">{item.unit}</span>
        </div>
      )
    },
    { 
      key: 'reorderLevel', 
      label: 'Reorder Level',
      render: (item: any) => `${item.reorderLevel} ${item.unit}`
    },
    { key: 'location', label: 'Location' },
    { 
      key: 'value', 
      label: 'Value',
      render: (item: any) => `₹${(item.value / 1000000).toFixed(1)}M`
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: any) => getStockStatusBadge(item.status)
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Monitor stock levels, movements, and optimize inventory</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <Package className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {inventoryKPIs.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                    <div className="flex items-center mt-2">
                      {kpi.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-xs ml-1 ${
                        kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <Icon className="w-8 h-8 text-gray-400 opacity-20" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Warehouse Utilization */}
        <Card className="mb-6">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Warehouse Utilization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {warehouseUtilization.map((warehouse, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{warehouse.name}</span>
                    <span className="text-sm text-gray-500">{warehouse.percentage}%</span>
                  </div>
                  <Progress value={warehouse.percentage} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {warehouse.used.toLocaleString()} / {warehouse.capacity.toLocaleString()} MT
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="stock-levels" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Stock Levels
                </TabsTrigger>
                <TabsTrigger 
                  value="transactions" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Transactions
                </TabsTrigger>
                <TabsTrigger 
                  value="low-stock" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Low Stock Alerts
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by item name, SKU, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="raw-materials">Raw Materials</SelectItem>
                    <SelectItem value="chemicals">Chemicals</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="finished-goods">Finished Goods</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="warehouse-a">Warehouse A</SelectItem>
                    <SelectItem value="warehouse-b">Warehouse B</SelectItem>
                    <SelectItem value="chemical-store">Chemical Store</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              {/* Tab Content */}
              <TabsContent value="stock-levels" className="mt-0">
                <DataTable
                  columns={inventoryColumns}
                  data={inventoryItems}
                />
              </TabsContent>

              <TabsContent value="transactions" className="mt-0">
                <DataTable
                  columns={[
                    { key: 'id', label: 'Transaction ID' },
                    { 
                      key: 'type', 
                      label: 'Type',
                      render: (item: any) => getTransactionTypeBadge(item.type)
                    },
                    { key: 'item', label: 'Item' },
                    { 
                      key: 'quantity', 
                      label: 'Quantity',
                      render: (item: any) => `${item.quantity} ${item.unit}`
                    },
                    { key: 'from', label: 'From' },
                    { key: 'to', label: 'To' },
                    { key: 'date', label: 'Date' },
                    { key: 'user', label: 'User' }
                  ]}
                  data={recentTransactions}
                />
              </TabsContent>

              <TabsContent value="low-stock" className="mt-0">
                <div className="space-y-4">
                  {inventoryItems
                    .filter(item => item.status === 'low-stock' || item.status === 'out-of-stock')
                    .map((item) => (
                      <Card key={item.id} className="p-4 border-l-4 border-l-orange-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              SKU: {item.sku} | Location: {item.location}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm">
                                Current: <strong>{item.currentStock} {item.unit}</strong>
                              </span>
                              <span className="text-sm">
                                Reorder Level: <strong>{item.reorderLevel} {item.unit}</strong>
                              </span>
                              <span className="text-sm">
                                Reorder Qty: <strong>{item.reorderQty} {item.unit}</strong>
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStockStatusBadge(item.status)}
                            <Button size="sm" className="mt-2">
                              Create PO
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Inventory analytics coming soon...</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
}