'use client';

import { useState } from 'react';
import { Plus, Search, Filter, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function MaterialIndentPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [selectedIndent, setSelectedIndent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    itemName: '',
    itemCode: '',
    quantity: '',
    unit: 'PCS',
    requiredDate: '',
    priority: 'MEDIUM',
    description: '',
    factoryId: '',
    departmentId: '',
  });

  const [approvalData, setApprovalData] = useState({
    action: 'approve',
    remarks: '',
  });

  // Mock data for now
  const mockIndents = [
    {
      id: '1',
      indentNumber: 'IND-2024-001',
      itemName: 'Steel Plates',
      itemCode: 'STL-001',
      quantity: 100,
      unit: 'PCS',
      requiredDate: new Date('2024-12-15'),
      priority: 'HIGH',
      status: 'PENDING',
      requestedBy: 'John Doe',
      factory: 'Factory A',
      department: 'Production'
    },
    {
      id: '2',
      indentNumber: 'IND-2024-002',
      itemName: 'Bearings',
      itemCode: 'BRG-002',
      quantity: 50,
      unit: 'PCS',
      requiredDate: new Date('2024-12-20'),
      priority: 'MEDIUM',
      status: 'APPROVED',
      requestedBy: 'Jane Smith',
      factory: 'Factory B',
      department: 'Maintenance'
    }
  ];

  const filteredIndents = mockIndents.filter(indent => {
    const matchesSearch = indent.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      indent.indentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      indent.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || indent.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || indent.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateIndent = () => {
    // Mock implementation
    console.log('Creating indent:', formData);
    setIsCreateDialogOpen(false);
    setFormData({
      itemName: '',
      itemCode: '',
      quantity: '',
      unit: 'PCS',
      requiredDate: '',
      priority: 'MEDIUM',
      description: '',
      factoryId: '',
      departmentId: '',
    });
  };

  const handleApproveIndent = () => {
    // Mock implementation
    console.log('Approving indent:', selectedIndent, approvalData);
    setIsApprovalDialogOpen(false);
    setSelectedIndent(null);
    setApprovalData({ action: 'approve', remarks: '' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'RFQ_CREATED':
        return <FileText className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'RFQ_CREATED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Material Indents</h1>
            <p className="text-gray-600 mt-1">Manage material requisitions and approvals</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Indent
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search indents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="RFQ_CREATED">RFQ Created</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </Card>

        {/* Indents List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Indent No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Required Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIndents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No indents found
                    </td>
                  </tr>
                ) : (
                  filteredIndents.map((indent) => (
                    <tr key={indent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {indent.indentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{indent.itemName}</div>
                          <div className="text-sm text-gray-500">Code: {indent.itemCode}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {indent.quantity} {indent.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {indent.requiredDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getPriorityColor(indent.priority)} variant="secondary">
                          {indent.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(indent.status)}
                          <Badge className={getStatusColor(indent.status)} variant="secondary">
                            {indent.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">View</Button>
                          {indent.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedIndent(indent);
                                setIsApprovalDialogOpen(true);
                              }}
                            >
                              Review
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Info message about real data */}
          <div className="p-4 bg-blue-50 border-t border-blue-100">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Real-time database integration is ready. The API endpoints and React Query hooks 
              are implemented for fetching actual procurement data. Currently showing mock data for demonstration.
            </p>
          </div>
        </Card>

        {/* Create Indent Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Material Indent</DialogTitle>
              <DialogDescription>
                Submit a new material requisition for procurement
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder="Enter item name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemCode">Item Code</Label>
                <Input
                  id="itemCode"
                  value={formData.itemCode}
                  onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                  placeholder="Enter item code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PCS">Pieces</SelectItem>
                    <SelectItem value="KG">Kilograms</SelectItem>
                    <SelectItem value="LTR">Liters</SelectItem>
                    <SelectItem value="MTR">Meters</SelectItem>
                    <SelectItem value="BOX">Box</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requiredDate">Required Date *</Label>
                <Input
                  id="requiredDate"
                  type="date"
                  value={formData.requiredDate}
                  onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter additional details"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateIndent}>
                Create Indent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Material Indent</DialogTitle>
              <DialogDescription>
                Review and approve or reject this material requisition
              </DialogDescription>
            </DialogHeader>

            {selectedIndent && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Indent Number:</span>
                    <p className="font-medium">{selectedIndent.indentNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Item Name:</span>
                    <p className="font-medium">{selectedIndent.itemName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <p className="font-medium">{selectedIndent.quantity} {selectedIndent.unit}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Required Date:</span>
                    <p className="font-medium">{selectedIndent.requiredDate.toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select value={approvalData.action} onValueChange={(value) => setApprovalData({ ...approvalData, action: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">Approve</SelectItem>
                      <SelectItem value="reject">Reject</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={approvalData.remarks}
                    onChange={(e) => setApprovalData({ ...approvalData, remarks: e.target.value })}
                    placeholder="Enter your remarks"
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleApproveIndent}
                variant={approvalData.action === 'approve' ? 'default' : 'destructive'}
              >
                {approvalData.action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}