'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Edit,
  Eye,
  Download,
  AlertTriangle
} from 'lucide-react';

export default function PurchaseRequisition() {
  const [selectedPR, setSelectedPR] = useState<any>(null);

  // Mock data
  const requisitions = {
    draft: [
      { id: 'PR-2024-010', title: 'Spare Parts for Mill #1', items: 5, totalValue: 250000, createdBy: 'John Doe', createdAt: '2024-06-07', category: 'Maintenance' },
      { id: 'PR-2024-011', title: 'Lab Chemicals Monthly', items: 12, totalValue: 85000, createdBy: 'Lab Manager', createdAt: '2024-06-06', category: 'Operations' },
    ],
    pending: [
      { id: 'PR-2024-012', title: 'Boiler Tubes Replacement', items: 3, totalValue: 780000, createdBy: 'Maintenance Head', createdAt: '2024-06-05', priority: 'High', approver: 'Plant Manager', daysWaiting: 2 },
      { id: 'PR-2024-013', title: 'Safety Equipment Q3', items: 15, totalValue: 125000, createdBy: 'HSE Officer', createdAt: '2024-06-04', priority: 'Medium', approver: 'CFO', daysWaiting: 3 },
      { id: 'PR-2024-014', title: 'IT Infrastructure Upgrade', items: 8, totalValue: 450000, createdBy: 'IT Manager', createdAt: '2024-06-03', priority: 'Low', approver: 'CEO', daysWaiting: 4 },
    ],
    approved: [
      { id: 'PR-2024-015', title: 'Chemical Supplies June', items: 10, totalValue: 320000, createdBy: 'Production Manager', approvedBy: 'Plant Manager', approvedAt: '2024-06-06', poNumber: 'PO-2024-158' },
      { id: 'PR-2024-016', title: 'Electrical Components', items: 20, totalValue: 180000, createdBy: 'Electrical Head', approvedBy: 'CFO', approvedAt: '2024-06-05', poNumber: 'PO-2024-159' },
    ],
    rejected: [
      { id: 'PR-2024-017', title: 'Office Renovation', items: 25, totalValue: 550000, createdBy: 'Admin Head', rejectedBy: 'CFO', rejectedAt: '2024-06-04', reason: 'Budget constraints - postpone to next quarter' },
    ],
  };

  const itemCategories = [
    'Raw Materials',
    'Spare Parts',
    'Chemicals',
    'Safety Equipment',
    'IT & Electronics',
    'Office Supplies',
    'Services',
    'Others',
  ];

  return (
    <div className="space-y-6">
      {/* PR Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Input 
            placeholder="Search requisitions..." 
            className="w-64 bg-gray-800 border-gray-700"
          />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New PR
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle>Create Purchase Requisition</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* PR Header */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>PR Title</Label>
                  <Input 
                    placeholder="Enter requisition title" 
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="lab">Laboratory</SelectItem>
                      <SelectItem value="admin">Administration</SelectItem>
                      <SelectItem value="it">IT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High - Urgent</SelectItem>
                      <SelectItem value="medium">Medium - Normal</SelectItem>
                      <SelectItem value="low">Low - Can Wait</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Required By</Label>
                  <Input 
                    type="date" 
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Budget Code</Label>
                  <Input 
                    placeholder="Enter budget code" 
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Justification</Label>
                <Textarea 
                  placeholder="Provide business justification for this purchase..."
                  className="bg-gray-800 border-gray-700"
                  rows={3}
                />
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Items</h3>
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                <div className="border border-gray-700 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-400">Item Description</TableHead>
                        <TableHead className="text-gray-400">Category</TableHead>
                        <TableHead className="text-gray-400">Quantity</TableHead>
                        <TableHead className="text-gray-400">UOM</TableHead>
                        <TableHead className="text-gray-400">Est. Price</TableHead>
                        <TableHead className="text-gray-400">Total</TableHead>
                        <TableHead className="text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-gray-700">
                        <TableCell>
                          <Input 
                            placeholder="Item description" 
                            className="bg-gray-800 border-gray-700"
                          />
                        </TableCell>
                        <TableCell>
                          <Select>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {itemCategories.map(cat => (
                                <SelectItem key={cat} value={cat.toLowerCase().replace(' ', '-')}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            placeholder="Qty" 
                            className="bg-gray-800 border-gray-700 w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            placeholder="Unit" 
                            className="bg-gray-800 border-gray-700 w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            placeholder="Price" 
                            className="bg-gray-800 border-gray-700 w-24"
                          />
                        </TableCell>
                        <TableCell className="text-white">₹0</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
                  <span className="text-gray-400">Total Estimated Value:</span>
                  <span className="text-2xl font-bold text-white">₹0</span>
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <Label>Attachments</Label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                  <p className="text-gray-400">Drag and drop files here or click to browse</p>
                  <p className="text-gray-500 text-sm mt-1">Quotations, specifications, approvals etc.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Save as Draft</Button>
                <Button>Submit for Approval</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Requisition Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="draft" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Draft ({requisitions.draft.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({requisitions.pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({requisitions.approved.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({requisitions.rejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draft">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Draft Requisitions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requisitions.draft.map((pr) => (
                  <div key={pr.id} className="p-4 bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-white font-medium">{pr.id}</p>
                          <p className="text-gray-400 text-sm">{pr.title}</p>
                        </div>
                        <Badge variant="outline" className="border-gray-600">
                          {pr.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">₹{pr.totalValue.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">{pr.items} items</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-gray-400 text-sm">Created by {pr.createdBy} on {pr.createdAt}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button size="sm">Submit</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requisitions.pending.map((pr) => (
                  <div key={pr.id} className="p-4 bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-white font-medium">{pr.id}</p>
                          <p className="text-gray-400 text-sm">{pr.title}</p>
                        </div>
                        <Badge 
                          className={
                            pr.priority === 'High' ? 'bg-red-600' :
                            pr.priority === 'Medium' ? 'bg-yellow-600' :
                            'bg-blue-600'
                          }
                        >
                          {pr.priority}
                        </Badge>
                        {pr.daysWaiting > 2 && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {pr.daysWaiting} days waiting
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">₹{pr.totalValue.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">{pr.items} items</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <p className="text-gray-400">Created by {pr.createdBy} on {pr.createdAt}</p>
                        <p className="text-gray-400">Pending approval from: <span className="text-yellow-500">{pr.approver}</span></p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Approved Requisitions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requisitions.approved.map((pr) => (
                  <div key={pr.id} className="p-4 bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-medium">{pr.id}</p>
                        <p className="text-gray-400 text-sm">{pr.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">₹{pr.totalValue.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">{pr.items} items</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <p className="text-gray-400">Created by {pr.createdBy}</p>
                        <p className="text-green-500">Approved by {pr.approvedBy} on {pr.approvedAt}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-green-600">
                          PO: {pr.poNumber}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Rejected Requisitions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requisitions.rejected.map((pr) => (
                  <div key={pr.id} className="p-4 bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-medium">{pr.id}</p>
                        <p className="text-gray-400 text-sm">{pr.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">₹{pr.totalValue.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">{pr.items} items</p>
                      </div>
                    </div>
                    <div className="p-3 bg-red-900/20 border border-red-900 rounded-lg">
                      <p className="text-red-400 text-sm">Rejection Reason:</p>
                      <p className="text-gray-300">{pr.reason}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm">
                        <p className="text-gray-400">Created by {pr.createdBy}</p>
                        <p className="text-red-500">Rejected by {pr.rejectedBy} on {pr.rejectedAt}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Revise</Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}