'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ClipboardCheck, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  FileText,
  User,
  Calendar,
  Building,
  TrendingUp,
  Shield,
  AlertTriangle,
  ChevronRight,
  Package,
  Truck
} from 'lucide-react';

// Mock approval requests
const approvalRequests = [
  {
    id: 'APR-2024-001',
    type: 'purchase_order',
    title: 'Sulphur Purchase - 50 MT',
    rfqNo: 'RFQ-2024-001',
    vendor: 'Bharat Chemicals',
    amount: 120000,
    requestedBy: 'Amit Kumar',
    department: 'Procurement',
    requestDate: '2024-01-20',
    priority: 'high',
    status: 'pending',
    level: 1,
    approvalChain: [
      { level: 1, role: 'Department Head', status: 'pending' },
      { level: 2, role: 'Finance Manager', status: 'waiting' },
      { level: 3, role: 'General Manager', status: 'waiting' }
    ],
    details: {
      items: [{ name: 'Sulphur', quantity: 50, unit: 'MT', unitPrice: 2400 }],
      justification: 'Selected based on best overall score in vendor comparison. Lowest price with acceptable delivery terms.',
      savingsAmount: 10000,
      savingsPercentage: 7.7,
      deliveryDays: 10,
      paymentTerms: 'Net 45'
    }
  },
  {
    id: 'APR-2024-002',
    type: 'purchase_order',
    title: 'Packaging Materials - Monthly Supply',
    rfqNo: 'RFQ-2024-002',
    vendor: 'Global Packaging Co',
    amount: 1075000,
    requestedBy: 'Priya Patel',
    department: 'Procurement',
    requestDate: '2024-01-19',
    priority: 'urgent',
    status: 'pending',
    level: 2,
    approvalChain: [
      { level: 1, role: 'Department Head', status: 'approved', approvedBy: 'Rahul Sharma', approvedDate: '2024-01-19' },
      { level: 2, role: 'Finance Manager', status: 'pending' },
      { level: 3, role: 'CFO', status: 'waiting' },
      { level: 4, role: 'Managing Director', status: 'waiting' }
    ],
    details: {
      items: [
        { name: 'Sugar Bags (50kg)', quantity: 10000, unit: 'Units', unitPrice: 75 },
        { name: 'Sugar Bags (25kg)', quantity: 5000, unit: 'Units', unitPrice: 65 }
      ],
      justification: 'Monthly packaging requirement. Vendor offers best price with custom branding included.',
      savingsAmount: 25000,
      savingsPercentage: 2.3,
      deliveryDays: 15,
      paymentTerms: 'Net 30'
    }
  },
  {
    id: 'APR-2024-003',
    type: 'material_indent',
    title: 'Lime - Emergency Requirement',
    indentNo: 'IND-2024-005',
    amount: 60000,
    requestedBy: 'Vijay Singh',
    department: 'Production',
    requestDate: '2024-01-18',
    priority: 'urgent',
    status: 'approved',
    level: 3,
    approvalChain: [
      { level: 1, role: 'Department Head', status: 'approved', approvedBy: 'Amit Kumar', approvedDate: '2024-01-18' },
      { level: 2, role: 'Production Manager', status: 'approved', approvedBy: 'Sneha Gupta', approvedDate: '2024-01-18' },
      { level: 3, role: 'General Manager', status: 'approved', approvedBy: 'Rajesh Patel', approvedDate: '2024-01-19' }
    ],
    details: {
      items: [{ name: 'Lime', quantity: 30, unit: 'MT', estimatedPrice: 2000 }],
      justification: 'Current stock exhausted. Production will stop without immediate procurement.',
      requiredDate: '2024-01-22'
    }
  }
];

export default function ApprovalPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approvalDialog, setApprovalDialog] = useState<any>(null);
  const [remarks, setRemarks] = useState('');

  const pendingRequests = approvalRequests.filter(r => r.status === 'pending');
  const approvedRequests = approvalRequests.filter(r => r.status === 'approved');
  const rejectedRequests = approvalRequests.filter(r => r.status === 'rejected');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { variant: 'outline' as const, icon: Clock, color: 'text-yellow-600' },
      'approved': { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      'rejected': { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      'waiting': { variant: 'secondary' as const, icon: Clock, color: 'text-gray-500' }
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

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'urgent': { variant: 'destructive' as const },
      'high': { variant: 'destructive' as const },
      'medium': { variant: 'secondary' as const },
      'low': { variant: 'outline' as const }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;

    return (
      <Badge variant={config.variant}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const approvalColumns = [
    { key: 'id', label: 'Request ID' },
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type', render: (item: any) => item.type.replace('_', ' ').toUpperCase() },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (item: any) => `₹${item.amount.toLocaleString()}`
    },
    { key: 'requestedBy', label: 'Requested By' },
    { key: 'department', label: 'Department' },
    { 
      key: 'priority', 
      label: 'Priority',
      render: (item: any) => getPriorityBadge(item.priority)
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (item: any) => getStatusBadge(item.status)
    },
    { key: 'requestDate', label: 'Request Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setSelectedRequest(item)}>
            View Details
          </Button>
          {item.status === 'pending' && (
            <Button size="sm" onClick={() => setApprovalDialog(item)}>
              Review
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Approval Management</h1>
            <p className="text-gray-600 mt-1">Review and approve procurement requests</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
            {pendingRequests.length} Pending Approvals
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <ClipboardCheck className="w-8 h-8 text-gray-400 opacity-20" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500 opacity-20" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved (MTD)</p>
                <p className="text-2xl font-bold">123</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Approval Time</p>
                <p className="text-2xl font-bold">2.4 days</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Urgent Approvals Alert */}
        {pendingRequests.filter(r => r.priority === 'urgent').length > 0 && (
          <Card className="p-4 mb-6 border-l-4 border-l-red-500 bg-red-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Urgent Approvals Required</p>
                  <p className="text-sm text-red-700">
                    {pendingRequests.filter(r => r.priority === 'urgent').length} requests need immediate attention
                  </p>
                </div>
              </div>
              <Button size="sm" variant="destructive">
                View Urgent
              </Button>
            </div>
          </Card>
        )}

        {/* Main Content */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="pending" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  Pending ({pendingRequests.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="approved" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  Approved
                </TabsTrigger>
                <TabsTrigger 
                  value="rejected" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  Rejected
                </TabsTrigger>
                <TabsTrigger 
                  value="delegation" 
                  className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
                >
                  Delegation Rules
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="pending" className="mt-0">
                <DataTable
                  columns={approvalColumns}
                  data={pendingRequests}
                />
              </TabsContent>

              <TabsContent value="approved" className="mt-0">
                <DataTable
                  columns={approvalColumns}
                  data={approvedRequests}
                />
              </TabsContent>

              <TabsContent value="rejected" className="mt-0">
                <DataTable
                  columns={approvalColumns}
                  data={rejectedRequests}
                />
              </TabsContent>

              <TabsContent value="delegation" className="mt-0">
                <div className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-medium mb-3">Approval Matrix</h3>
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-2">Amount Range</th>
                          <th className="text-left py-2">Level 1</th>
                          <th className="text-left py-2">Level 2</th>
                          <th className="text-left py-2">Level 3</th>
                          <th className="text-left py-2">Level 4</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Up to ₹50,000</td>
                          <td className="py-2">Department Head</td>
                          <td className="py-2 text-gray-400">-</td>
                          <td className="py-2 text-gray-400">-</td>
                          <td className="py-2 text-gray-400">-</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">₹50,001 - ₹2,00,000</td>
                          <td className="py-2">Department Head</td>
                          <td className="py-2">Finance Manager</td>
                          <td className="py-2">General Manager</td>
                          <td className="py-2 text-gray-400">-</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">₹2,00,001 - ₹10,00,000</td>
                          <td className="py-2">Department Head</td>
                          <td className="py-2">Finance Manager</td>
                          <td className="py-2">CFO</td>
                          <td className="py-2 text-gray-400">-</td>
                        </tr>
                        <tr>
                          <td className="py-2">Above ₹10,00,000</td>
                          <td className="py-2">Department Head</td>
                          <td className="py-2">Finance Manager</td>
                          <td className="py-2">CFO</td>
                          <td className="py-2">Managing Director</td>
                        </tr>
                      </tbody>
                    </table>
                  </Card>
                  
                  <Card className="p-4">
                    <h3 className="font-medium mb-3">Delegation Settings</h3>
                    <p className="text-sm text-gray-600">Configure automatic delegation rules when approvers are unavailable.</p>
                    <Button className="mt-3" variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      Configure Delegation
                    </Button>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* View Details Dialog */}
        {selectedRequest && (
          <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Request Details</DialogTitle>
                <DialogDescription>
                  {selectedRequest.id} - {selectedRequest.title}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Request Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Requested By</p>
                    <p className="font-medium">{selectedRequest.requestedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{selectedRequest.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Request Date</p>
                    <p className="font-medium">{selectedRequest.requestDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Priority</p>
                    {getPriorityBadge(selectedRequest.priority)}
                  </div>
                </div>

                {/* Amount & Vendor */}
                {selectedRequest.vendor && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Vendor</p>
                      <p className="font-medium">{selectedRequest.vendor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium text-lg">₹{selectedRequest.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Terms</p>
                      <p className="font-medium">{selectedRequest.details.paymentTerms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Delivery</p>
                      <p className="font-medium">{selectedRequest.details.deliveryDays} days</p>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div>
                  <h4 className="font-medium mb-2">Items</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3">Item</th>
                          <th className="text-right p-3">Quantity</th>
                          <th className="text-right p-3">Unit Price</th>
                          <th className="text-right p-3">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRequest.details.items.map((item: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">{item.name}</td>
                            <td className="text-right p-3">{item.quantity} {item.unit}</td>
                            <td className="text-right p-3">
                              {item.unitPrice ? `₹${item.unitPrice.toLocaleString()}` : '-'}
                            </td>
                            <td className="text-right p-3">
                              {item.unitPrice ? `₹${(item.quantity * item.unitPrice).toLocaleString()}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Justification */}
                <div>
                  <h4 className="font-medium mb-2">Justification</h4>
                  <p className="text-sm text-gray-600">{selectedRequest.details.justification}</p>
                </div>

                {/* Savings */}
                {selectedRequest.details.savingsAmount && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Cost Savings</p>
                        <p className="text-sm text-green-700">
                          ₹{selectedRequest.details.savingsAmount.toLocaleString()} ({selectedRequest.details.savingsPercentage}% savings)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Approval Chain */}
                <div>
                  <h4 className="font-medium mb-3">Approval Chain</h4>
                  <div className="space-y-2">
                    {selectedRequest.approvalChain.map((level: any, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          level.status === 'approved' ? 'bg-green-100 text-green-700' :
                          level.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {level.level}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{level.role}</p>
                          {level.approvedBy && (
                            <p className="text-sm text-gray-500">
                              Approved by {level.approvedBy} on {level.approvedDate}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(level.status)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Approval Dialog */}
        {approvalDialog && (
          <Dialog open={!!approvalDialog} onOpenChange={() => setApprovalDialog(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Review Approval Request</DialogTitle>
                <DialogDescription>
                  {approvalDialog.id} - {approvalDialog.title}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-medium ml-2">₹{approvalDialog.amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Vendor:</span>
                      <span className="font-medium ml-2">{approvalDialog.vendor || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea 
                    id="remarks" 
                    placeholder="Add your remarks here..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="destructive" onClick={() => setApprovalDialog(null)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button variant="outline" onClick={() => setApprovalDialog(null)}>
                  Request Info
                </Button>
                <Button onClick={() => setApprovalDialog(null)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}