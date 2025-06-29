'use client';

export const dynamic = 'force-dynamic';

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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileSearch, 
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  Send,
  Calendar,
  Package,
  Users,
  FileText,
  Mail,
  Phone,
  MapPin,
  Building,
  User,
  AlertCircle
} from 'lucide-react';

// Mock data for RFQs
const rfqs = [
  {
    id: 'RFQ-2024-001',
    title: 'Sulphur Supply - Q1 2024',
    indentNo: 'IND-2024-001',
    items: [
      { name: 'Sulphur', quantity: 50, unit: 'MT' }
    ],
    vendorCount: 5,
    sentDate: '2024-01-16',
    dueDate: '2024-01-20',
    status: 'active',
    responsesReceived: 3,
    createdBy: 'Amit Kumar',
    department: 'Procurement'
  },
  {
    id: 'RFQ-2024-002',
    title: 'Packaging Materials - Monthly',
    indentNo: 'IND-2024-002',
    items: [
      { name: 'Sugar Bags (50kg)', quantity: 10000, unit: 'Units' },
      { name: 'Sugar Bags (25kg)', quantity: 5000, unit: 'Units' }
    ],
    vendorCount: 8,
    sentDate: '2024-01-15',
    dueDate: '2024-01-19',
    status: 'active',
    responsesReceived: 6,
    createdBy: 'Priya Patel',
    department: 'Procurement'
  },
  {
    id: 'RFQ-2024-003',
    title: 'Chemical Supplies',
    indentNo: 'IND-2024-003',
    items: [
      { name: 'Lime', quantity: 30, unit: 'MT' },
      { name: 'Phosphoric Acid', quantity: 10, unit: 'MT' }
    ],
    vendorCount: 4,
    sentDate: '2024-01-14',
    dueDate: '2024-01-18',
    status: 'closed',
    responsesReceived: 4,
    createdBy: 'Rahul Sharma',
    department: 'Procurement'
  }
];

// Mock vendor list
const vendors = [
  {
    id: 'V001',
    name: 'Krishna Sugars Ltd',
    category: 'Raw Materials',
    email: 'procurement@krishnasugars.com',
    phone: '+91 98765 43210',
    location: 'Mumbai',
    rating: 4.8,
    selected: false
  },
  {
    id: 'V002',
    name: 'Bharat Chemicals',
    category: 'Chemicals',
    email: 'sales@bharatchemicals.com',
    phone: '+91 98765 43211',
    location: 'Delhi',
    rating: 4.5,
    selected: false
  },
  {
    id: 'V003',
    name: 'Global Packaging Co',
    category: 'Packaging',
    email: 'info@globalpackaging.com',
    phone: '+91 98765 43212',
    location: 'Pune',
    rating: 4.7,
    selected: false
  },
  {
    id: 'V004',
    name: 'Supreme Chemicals Pvt Ltd',
    category: 'Chemicals',
    email: 'contact@supremechemicals.com',
    phone: '+91 98765 43213',
    location: 'Chennai',
    rating: 4.6,
    selected: false
  }
];

export default function RFQManagementPage() {
  const [activeTab, setActiveTab] = useState('active-rfqs');
  const [showCreateRFQ, setShowCreateRFQ] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { variant: 'default' as const, icon: Clock, color: 'text-blue-600' },
      'closed': { variant: 'secondary' as const, icon: CheckCircle, color: 'text-gray-600' },
      'draft': { variant: 'outline' as const, icon: FileText, color: 'text-gray-500' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className={`w-3 h-3 mr-1 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const rfqColumns = [
    { key: 'id', label: 'RFQ No.' },
    { key: 'title', label: 'Title' },
    { key: 'indentNo', label: 'Indent Ref.' },
    { 
      key: 'items', 
      label: 'Items',
      render: (item: any) => (
        <div className="text-sm">
          {item.items.length} item{item.items.length > 1 ? 's' : ''}
        </div>
      )
    },
    { 
      key: 'vendorCount', 
      label: 'Vendors',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{item.vendorCount}</span>
        </div>
      )
    },
    { 
      key: 'responsesReceived', 
      label: 'Responses',
      render: (item: any) => (
        <div className="text-sm">
          <span className="font-medium">{item.responsesReceived}</span>
          <span className="text-gray-500">/{item.vendorCount}</span>
        </div>
      )
    },
    { key: 'dueDate', label: 'Due Date' },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: any) => getStatusBadge(item.status)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: any) => (
        <div className="flex gap-2">
          {item.status === 'active' && (
            <>
              <Button size="sm" variant="outline">
                View Responses
              </Button>
              {item.responsesReceived >= item.vendorCount * 0.6 && (
                <Button size="sm">
                  Compare
                </Button>
              )}
            </>
          )}
          {item.status === 'closed' && (
            <Button size="sm" variant="outline">
              View Results
            </Button>
          )}
        </div>
      )
    }
  ];

  const toggleVendor = (vendorId: string) => {
    setSelectedVendors(prev => 
      prev.includes(vendorId) 
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RFQ Management</h1>
            <p className="text-gray-600 mt-1">Create and manage requests for quotation</p>
          </div>
          <Button onClick={() => setShowCreateRFQ(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create RFQ
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total RFQs</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <FileSearch className="w-8 h-8 text-gray-400 opacity-20" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active RFQs</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Responses</p>
                <p className="text-2xl font-bold">45</p>
              </div>
              <Mail className="w-8 h-8 text-yellow-500 opacity-20" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold">78%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="active-rfqs" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  Active RFQs
                </TabsTrigger>
                <TabsTrigger 
                  value="draft-rfqs" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  Drafts
                </TabsTrigger>
                <TabsTrigger 
                  value="closed-rfqs" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  Closed
                </TabsTrigger>
                <TabsTrigger 
                  value="templates" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  Templates
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by RFQ no., title, or vendor..."
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
                    <SelectItem value="chemicals">Chemicals</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="raw-materials">Raw Materials</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              {/* Tab Content */}
              <TabsContent value="active-rfqs" className="mt-0">
                <DataTable
                  columns={rfqColumns}
                  data={rfqs.filter(rfq => rfq.status === 'active')}
                />
              </TabsContent>

              <TabsContent value="draft-rfqs" className="mt-0">
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No draft RFQs</p>
                </div>
              </TabsContent>

              <TabsContent value="closed-rfqs" className="mt-0">
                <DataTable
                  columns={rfqColumns}
                  data={rfqs.filter(rfq => rfq.status === 'closed')}
                />
              </TabsContent>

              <TabsContent value="templates" className="mt-0">
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No RFQ templates saved</p>
                  <Button className="mt-4" variant="outline">
                    Create Template
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Create RFQ Dialog */}
        <Dialog open={showCreateRFQ} onOpenChange={setShowCreateRFQ}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Request for Quotation</DialogTitle>
              <DialogDescription>
                Send RFQ to selected vendors for material requirements
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-medium">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rfq-title">RFQ Title</Label>
                    <Input id="rfq-title" placeholder="Enter RFQ title" />
                  </div>
                  <div>
                    <Label htmlFor="indent-ref">Indent Reference</Label>
                    <Select>
                      <SelectTrigger id="indent-ref">
                        <SelectValue placeholder="Select indent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IND-2024-001">IND-2024-001 - Sulphur</SelectItem>
                        <SelectItem value="IND-2024-002">IND-2024-002 - Sugar Bags</SelectItem>
                        <SelectItem value="IND-2024-003">IND-2024-003 - Lime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="due-date">Response Due Date</Label>
                    <Input id="due-date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="delivery-date">Expected Delivery Date</Label>
                    <Input id="delivery-date" type="date" />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <h3 className="font-medium">Items</h3>
                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-4 mb-2 text-sm font-medium text-gray-500">
                    <div>Item Name</div>
                    <div>Quantity</div>
                    <div>Unit</div>
                    <div>Specifications</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <Input placeholder="Item name" />
                    <Input type="number" placeholder="0" />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mt">MT</SelectItem>
                        <SelectItem value="kg">KG</SelectItem>
                        <SelectItem value="units">Units</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Specifications" />
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>

              {/* Vendor Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Select Vendors</h3>
                  <span className="text-sm text-gray-500">
                    {selectedVendors.length} vendors selected
                  </span>
                </div>
                <div className="border rounded-lg divide-y">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedVendors.includes(vendor.id)}
                            onCheckedChange={() => toggleVendor(vendor.id)}
                          />
                          <div>
                            <p className="font-medium">{vendor.name}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {vendor.category}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {vendor.location}
                              </span>
                              <span className="flex items-center gap-1">
                                ⭐ {vendor.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="w-4 h-4" />
                          <Phone className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="space-y-4">
                <h3 className="font-medium">Terms & Conditions</h3>
                <Textarea 
                  placeholder="Enter terms and conditions for this RFQ..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Additional Instructions */}
              <div className="space-y-4">
                <h3 className="font-medium">Additional Instructions</h3>
                <Textarea 
                  placeholder="Any special instructions for vendors..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateRFQ(false)}>
                Save as Draft
              </Button>
              <Button 
                onClick={() => setShowCreateRFQ(false)}
                disabled={selectedVendors.length === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                Send RFQ ({selectedVendors.length} vendors)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}