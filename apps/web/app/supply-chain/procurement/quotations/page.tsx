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
import { 
  FileSpreadsheet, 
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building,
  User,
  FileSearch,
  Download,
  Eye,
  GitCompare,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Mock data for quotations
const quotations = [
  {
    id: 'QT-2024-001',
    rfqNo: 'RFQ-2024-001',
    vendor: 'Krishna Sugars Ltd',
    vendorId: 'V001',
    items: [
      { 
        name: 'Sulphur', 
        quantity: 50, 
        unit: 'MT', 
        unitPrice: 2500, 
        totalPrice: 125000,
        deliveryDays: 7 
      }
    ],
    totalAmount: 125000,
    validUntil: '2024-01-30',
    paymentTerms: 'Net 30',
    deliveryTerms: 'FOB',
    receivedDate: '2024-01-18',
    status: 'pending',
    rating: 4.8,
    previousPrice: 2450,
    notes: 'Includes transportation'
  },
  {
    id: 'QT-2024-002',
    rfqNo: 'RFQ-2024-001',
    vendor: 'Bharat Chemicals',
    vendorId: 'V002',
    items: [
      { 
        name: 'Sulphur', 
        quantity: 50, 
        unit: 'MT', 
        unitPrice: 2400, 
        totalPrice: 120000,
        deliveryDays: 10 
      }
    ],
    totalAmount: 120000,
    validUntil: '2024-01-28',
    paymentTerms: 'Net 45',
    deliveryTerms: 'CIF',
    receivedDate: '2024-01-19',
    status: 'pending',
    rating: 4.5,
    previousPrice: 2500,
    notes: 'Bulk discount available'
  },
  {
    id: 'QT-2024-003',
    rfqNo: 'RFQ-2024-001',
    vendor: 'Supreme Chemicals Pvt Ltd',
    vendorId: 'V004',
    items: [
      { 
        name: 'Sulphur', 
        quantity: 50, 
        unit: 'MT', 
        unitPrice: 2600, 
        totalPrice: 130000,
        deliveryDays: 5 
      }
    ],
    totalAmount: 130000,
    validUntil: '2024-01-25',
    paymentTerms: 'Net 15',
    deliveryTerms: 'Ex Works',
    receivedDate: '2024-01-17',
    status: 'pending',
    rating: 4.6,
    previousPrice: 2550,
    notes: 'Premium quality, fastest delivery'
  },
  {
    id: 'QT-2024-004',
    rfqNo: 'RFQ-2024-002',
    vendor: 'Global Packaging Co',
    vendorId: 'V003',
    items: [
      { 
        name: 'Sugar Bags (50kg)', 
        quantity: 10000, 
        unit: 'Units', 
        unitPrice: 75, 
        totalPrice: 750000,
        deliveryDays: 15 
      },
      { 
        name: 'Sugar Bags (25kg)', 
        quantity: 5000, 
        unit: 'Units', 
        unitPrice: 65, 
        totalPrice: 325000,
        deliveryDays: 15 
      }
    ],
    totalAmount: 1075000,
    validUntil: '2024-01-31',
    paymentTerms: 'Net 30',
    deliveryTerms: 'DDP',
    receivedDate: '2024-01-16',
    status: 'accepted',
    rating: 4.7,
    previousPrice: 1100000,
    notes: 'Includes custom branding'
  }
];

export default function QuotationsPage() {
  const [activeTab, setActiveTab] = useState('all-quotations');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [showComparison, setShowComparison] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { variant: 'outline' as const, icon: Clock, color: 'text-yellow-600' },
      'accepted': { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      'rejected': { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      'expired': { variant: 'secondary' as const, icon: AlertCircle, color: 'text-gray-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className={`w-3 h-3 mr-1 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriceChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    const isIncrease = change > 0;
    
    return (
      <div className={`flex items-center gap-1 text-sm ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
        {isIncrease ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(change).toFixed(1)}%
      </div>
    );
  };

  const quotationColumns = [
    { key: 'id', label: 'Quote No.' },
    { key: 'rfqNo', label: 'RFQ Ref.' },
    { key: 'vendor', label: 'Vendor' },
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
      key: 'totalAmount', 
      label: 'Total Amount',
      render: (item: any) => (
        <div>
          <div className="font-medium">₹{item.totalAmount.toLocaleString()}</div>
          {item.previousPrice && getPriceChange(item.totalAmount, item.previousPrice)}
        </div>
      )
    },
    { 
      key: 'deliveryTerms', 
      label: 'Terms',
      render: (item: any) => (
        <div className="text-sm">
          <div>{item.deliveryTerms}</div>
          <div className="text-gray-500">{item.paymentTerms}</div>
        </div>
      )
    },
    { key: 'validUntil', label: 'Valid Until' },
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
          <Button size="sm" variant="outline" onClick={() => setSelectedQuotation(item)}>
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          {item.status === 'pending' && (
            <Button size="sm" variant="outline">
              <GitCompare className="w-3 h-3" />
            </Button>
          )}
        </div>
      )
    }
  ];

  // Group quotations by RFQ for comparison
  const rfqGroups = quotations.reduce((groups: any, quote) => {
    if (!groups[quote.rfqNo]) {
      groups[quote.rfqNo] = [];
    }
    groups[quote.rfqNo].push(quote);
    return groups;
  }, {});

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Quotations</h1>
            <p className="text-gray-600 mt-1">Review and compare vendor quotations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowComparison(true)}>
              <GitCompare className="w-4 h-4 mr-2" />
              Compare Quotes
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Quotations</p>
                <p className="text-2xl font-bold">89</p>
              </div>
              <FileSpreadsheet className="w-8 h-8 text-gray-400 opacity-20" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500 opacity-20" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold">54</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Savings</p>
                <p className="text-2xl font-bold">12.5%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="all-quotations" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  All Quotations
                </TabsTrigger>
                <TabsTrigger 
                  value="pending-review" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  Pending Review (23)
                </TabsTrigger>
                <TabsTrigger 
                  value="by-rfq" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  By RFQ
                </TabsTrigger>
                <TabsTrigger 
                  value="expiring-soon" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  Expiring Soon
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by quote no., vendor, or RFQ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {Array.from(new Set(quotations.map(q => q.vendor))).map(vendor => (
                      <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              {/* Tab Content */}
              <TabsContent value="all-quotations" className="mt-0">
                <DataTable
                  columns={quotationColumns}
                  data={quotations}
                />
              </TabsContent>

              <TabsContent value="pending-review" className="mt-0">
                <DataTable
                  columns={quotationColumns}
                  data={quotations.filter(q => q.status === 'pending')}
                />
              </TabsContent>

              <TabsContent value="by-rfq" className="mt-0">
                <div className="space-y-6">
                  {Object.entries(rfqGroups).map(([rfqNo, quotes]: [string, any]) => (
                    <Card key={rfqNo} className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">{rfqNo} - {quotes[0].items[0].name}</h3>
                        <Button size="sm">
                          <GitCompare className="w-3 h-3 mr-1" />
                          Compare All ({quotes.length})
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quotes.map((quote: any) => (
                          <Card key={quote.id} className="p-3 border">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{quote.vendor}</p>
                                <p className="text-sm text-gray-500">⭐ {quote.rating}</p>
                              </div>
                              {getStatusBadge(quote.status)}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Amount:</span>
                                <span className="font-medium">₹{quote.totalAmount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Delivery:</span>
                                <span>{quote.items[0].deliveryDays} days</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Terms:</span>
                                <span>{quote.paymentTerms}</span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="w-full mt-3">
                              View Details
                            </Button>
                          </Card>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="expiring-soon" className="mt-0">
                <DataTable
                  columns={quotationColumns}
                  data={quotations.filter(q => {
                    const daysUntilExpiry = Math.floor((new Date(q.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
                  })}
                />
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* View Quotation Dialog */}
        {selectedQuotation && (
          <Dialog open={!!selectedQuotation} onOpenChange={() => setSelectedQuotation(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Quotation Details</DialogTitle>
                <DialogDescription>
                  Quote No: {selectedQuotation.id} | RFQ: {selectedQuotation.rfqNo}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Vendor Info */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium mb-2">Vendor Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Name:</span> {selectedQuotation.vendor}</p>
                      <p><span className="text-gray-500">Rating:</span> ⭐ {selectedQuotation.rating}</p>
                      <p><span className="text-gray-500">Payment Terms:</span> {selectedQuotation.paymentTerms}</p>
                      <p><span className="text-gray-500">Delivery Terms:</span> {selectedQuotation.deliveryTerms}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Quote Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Total Amount:</span> ₹{selectedQuotation.totalAmount.toLocaleString()}</p>
                      <p><span className="text-gray-500">Valid Until:</span> {selectedQuotation.validUntil}</p>
                      <p><span className="text-gray-500">Status:</span> {getStatusBadge(selectedQuotation.status)}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-medium mb-2">Items</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr className="text-sm">
                          <th className="text-left p-3">Item</th>
                          <th className="text-right p-3">Quantity</th>
                          <th className="text-right p-3">Unit Price</th>
                          <th className="text-right p-3">Total</th>
                          <th className="text-right p-3">Delivery</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedQuotation.items.map((item: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">{item.name}</td>
                            <td className="text-right p-3">{item.quantity} {item.unit}</td>
                            <td className="text-right p-3">₹{item.unitPrice.toLocaleString()}</td>
                            <td className="text-right p-3">₹{item.totalPrice.toLocaleString()}</td>
                            <td className="text-right p-3">{item.deliveryDays} days</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="text-right p-3 font-medium">Total Amount:</td>
                          <td className="text-right p-3 font-medium">₹{selectedQuotation.totalAmount.toLocaleString()}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                {selectedQuotation.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{selectedQuotation.notes}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="destructive" onClick={() => setSelectedQuotation(null)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button variant="outline" onClick={() => setSelectedQuotation(null)}>
                  Request Clarification
                </Button>
                <Button onClick={() => setSelectedQuotation(null)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept Quotation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}