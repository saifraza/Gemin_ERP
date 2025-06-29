'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ShoppingCart, 
  FileText, 
  Users, 
  TrendingUp,
  Search,
  Filter,
  Plus,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Package,
  Calendar,
  MoreHorizontal
} from 'lucide-react';

// Mock data for purchase orders
const purchaseOrders = [
  {
    id: 'PO-2024-001',
    vendor: 'Krishna Sugars Ltd',
    items: 3,
    value: 125000,
    status: 'pending',
    requestedBy: 'Rahul Sharma',
    requestedDate: '2024-01-15',
    requiredDate: '2024-01-25'
  },
  {
    id: 'PO-2024-002',
    vendor: 'Bharat Chemicals',
    items: 5,
    value: 89500,
    status: 'approved',
    requestedBy: 'Priya Patel',
    requestedDate: '2024-01-14',
    requiredDate: '2024-01-20'
  },
  {
    id: 'PO-2024-003',
    vendor: 'Global Packaging Co',
    items: 2,
    value: 45000,
    status: 'delivered',
    requestedBy: 'Amit Kumar',
    requestedDate: '2024-01-10',
    requiredDate: '2024-01-18'
  }
];

// Mock data for purchase requisitions
const purchaseRequisitions = [
  {
    id: 'PR-2024-101',
    department: 'Production',
    items: 4,
    estimatedValue: 75000,
    status: 'pending',
    requestedBy: 'Vijay Singh',
    priority: 'high',
    requestedDate: '2024-01-16'
  },
  {
    id: 'PR-2024-102',
    department: 'Maintenance',
    items: 2,
    estimatedValue: 35000,
    status: 'approved',
    requestedBy: 'Sneha Gupta',
    priority: 'medium',
    requestedDate: '2024-01-15'
  }
];

// Mock data for vendors
const vendors = [
  {
    id: 'V001',
    name: 'Krishna Sugars Ltd',
    category: 'Raw Materials',
    rating: 4.8,
    totalOrders: 145,
    totalSpend: 2400000,
    status: 'active',
    paymentTerms: 'Net 30'
  },
  {
    id: 'V002',
    name: 'Bharat Chemicals',
    category: 'Chemicals',
    rating: 4.5,
    totalOrders: 89,
    totalSpend: 1800000,
    status: 'active',
    paymentTerms: 'Net 45'
  },
  {
    id: 'V003',
    name: 'Global Packaging Co',
    category: 'Packaging',
    rating: 4.7,
    totalOrders: 234,
    totalSpend: 1200000,
    status: 'active',
    paymentTerms: 'Net 30'
  }
];

const procurementKPIs = [
  { label: 'Open POs', value: '23', icon: FileText, change: '+3', color: 'text-blue-600' },
  { label: 'Pending Approval', value: '12', icon: Clock, change: '-2', color: 'text-yellow-600' },
  { label: 'This Month Spend', value: '₹4.2M', icon: DollarSign, change: '+15%', color: 'text-green-600' },
  { label: 'Active Vendors', value: '156', icon: Users, change: '+8', color: 'text-purple-600' }
];

export default function ProcurementPage() {
  const [activeTab, setActiveTab] = useState('purchase-orders');
  const [showCreatePO, setShowCreatePO] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'outline' as const, icon: Clock },
      approved: { variant: 'default' as const, icon: CheckCircle },
      rejected: { variant: 'destructive' as const, icon: XCircle },
      delivered: { variant: 'secondary' as const, icon: Package }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const purchaseOrderColumns = [
    { key: 'id', header: 'PO Number', sortable: true },
    { key: 'vendor', header: 'Vendor', sortable: true },
    { key: 'items', header: 'Items' },
    { 
      key: 'value', 
      header: 'Value',
      render: (value: number) => `₹${value.toLocaleString()}`
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (status: string) => getStatusBadge(status)
    },
    { key: 'requestedBy', header: 'Requested By' },
    { key: 'requiredDate', header: 'Required Date' },
    {
      key: 'actions',
      header: '',
      render: () => (
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Procurement</h1>
            <p className="text-gray-600 mt-1">Manage purchase orders, requisitions, and vendors</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowCreatePO(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create PO
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {procurementKPIs.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Icon className={`w-8 h-8 ${kpi.color} opacity-20`} />
                    <span className="text-xs text-gray-500 mt-2">{kpi.change}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="purchase-orders" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Purchase Orders
                </TabsTrigger>
                <TabsTrigger 
                  value="requisitions" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Requisitions
                </TabsTrigger>
                <TabsTrigger 
                  value="vendors" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Vendors
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
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
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
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
              <TabsContent value="purchase-orders" className="mt-0">
                <DataTable
                  columns={purchaseOrderColumns}
                  data={purchaseOrders}
                />
              </TabsContent>

              <TabsContent value="requisitions" className="mt-0">
                <DataTable
                  columns={[
                    { key: 'id', header: 'PR Number', sortable: true },
                    { key: 'department', header: 'Department' },
                    { key: 'items', header: 'Items' },
                    { 
                      key: 'estimatedValue', 
                      header: 'Est. Value',
                      render: (value: number) => `₹${value.toLocaleString()}`
                    },
                    { 
                      key: 'priority', 
                      header: 'Priority',
                      render: (priority: string) => (
                        <Badge variant={priority === 'high' ? 'destructive' : 'secondary'}>
                          {priority.toUpperCase()}
                        </Badge>
                      )
                    },
                    { 
                      key: 'status', 
                      header: 'Status',
                      render: (status: string) => getStatusBadge(status)
                    },
                    { key: 'requestedBy', header: 'Requested By' },
                    {
                      key: 'actions',
                      header: '',
                      render: () => (
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      )
                    }
                  ]}
                  data={purchaseRequisitions}
                />
              </TabsContent>

              <TabsContent value="vendors" className="mt-0">
                <DataTable
                  columns={[
                    { key: 'id', header: 'Vendor ID' },
                    { key: 'name', header: 'Vendor Name', sortable: true },
                    { key: 'category', header: 'Category' },
                    { 
                      key: 'rating', 
                      header: 'Rating',
                      render: (rating: number) => (
                        <div className="flex items-center">
                          <span className="mr-1">⭐</span>
                          {rating}
                        </div>
                      )
                    },
                    { key: 'totalOrders', header: 'Total Orders' },
                    { 
                      key: 'totalSpend', 
                      header: 'Total Spend',
                      render: (value: number) => `₹${(value / 1000000).toFixed(1)}M`
                    },
                    { 
                      key: 'status', 
                      header: 'Status',
                      render: (status: string) => (
                        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                          {status.toUpperCase()}
                        </Badge>
                      )
                    },
                    { key: 'paymentTerms', header: 'Payment Terms' },
                    {
                      key: 'actions',
                      header: '',
                      render: () => (
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      )
                    }
                  ]}
                  data={vendors}
                />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Procurement analytics coming soon...</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Create PO Dialog */}
        <Dialog open={showCreatePO} onOpenChange={setShowCreatePO}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
              <DialogDescription>
                Create a new purchase order for vendor supplies
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Select>
                    <SelectTrigger id="vendor">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map(vendor => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="delivery-date">Required Delivery Date</Label>
                  <Input id="delivery-date" type="date" />
                </div>
              </div>
              <div>
                <Label htmlFor="items">Items</Label>
                <Textarea 
                  id="items" 
                  placeholder="Add purchase order items..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="quality">Quality</SelectItem>
                      <SelectItem value="admin">Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget">Budget Code</Label>
                  <Input id="budget" placeholder="Enter budget code" />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Additional notes or special instructions..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreatePO(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreatePO(false)}>
                Create Purchase Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}