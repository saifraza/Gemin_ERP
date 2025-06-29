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
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  User,
  Calendar
} from 'lucide-react';

export default function WorkOrders() {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);

  const workOrders = {
    open: [
      { id: 'WO-2024-001', equipment: 'Boiler #2', issue: 'Temperature sensor malfunction', priority: 'High', type: 'Emergency', requestedBy: 'Operations', createdAt: '2024-06-07 14:30' },
      { id: 'WO-2024-002', equipment: 'Mill #1 Gearbox', issue: 'Unusual noise during operation', priority: 'High', type: 'Corrective', requestedBy: 'Production', createdAt: '2024-06-07 10:15' },
      { id: 'WO-2024-003', equipment: 'Cooling Tower', issue: 'Scheduled maintenance', priority: 'Medium', type: 'Preventive', requestedBy: 'Maintenance', createdAt: '2024-06-06 16:00' },
    ],
    inProgress: [
      { id: 'WO-2024-004', equipment: 'Distillery Pump #3', issue: 'Seal replacement', priority: 'Medium', type: 'Corrective', assignee: 'John Doe', startTime: '2024-06-07 09:00', estimatedCompletion: '2024-06-07 15:00' },
      { id: 'WO-2024-005', equipment: 'Conveyor Belt A', issue: 'Belt alignment', priority: 'Low', type: 'Preventive', assignee: 'Mike Smith', startTime: '2024-06-07 13:00', estimatedCompletion: '2024-06-07 16:00' },
    ],
    completed: [
      { id: 'WO-2024-006', equipment: 'Power Generator #1', issue: 'Oil change and filter replacement', priority: 'Medium', type: 'Preventive', completedBy: 'Tom Brown', completedAt: '2024-06-07 11:30', duration: '2.5 hours' },
      { id: 'WO-2024-007', equipment: 'Sugar Mill Motor', issue: 'Bearing replacement', priority: 'High', type: 'Corrective', completedBy: 'Jane Smith', completedAt: '2024-06-06 17:00', duration: '4 hours' },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Work Order Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Input 
            placeholder="Search work orders..." 
            className="w-64 bg-gray-800 border-gray-700"
          />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Work Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle>Create New Work Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Equipment</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mill-1">Sugar Mill #1</SelectItem>
                      <SelectItem value="mill-2">Sugar Mill #2</SelectItem>
                      <SelectItem value="boiler-1">Boiler #1</SelectItem>
                      <SelectItem value="boiler-2">Boiler #2</SelectItem>
                      <SelectItem value="distillery-a">Distillery Unit A</SelectItem>
                      <SelectItem value="power-gen">Power Generator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Work Order Type</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="corrective">Corrective</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="predictive">Predictive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High - Critical</SelectItem>
                      <SelectItem value="medium">Medium - Important</SelectItem>
                      <SelectItem value="low">Low - Routine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Doe</SelectItem>
                      <SelectItem value="jane">Jane Smith</SelectItem>
                      <SelectItem value="mike">Mike Johnson</SelectItem>
                      <SelectItem value="sarah">Sarah Williams</SelectItem>
                      <SelectItem value="team">Maintenance Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Issue Description</Label>
                <Textarea 
                  placeholder="Describe the issue or maintenance requirement..."
                  className="bg-gray-800 border-gray-700"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estimated Duration</Label>
                  <Input 
                    placeholder="e.g., 2 hours" 
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Required By</Label>
                  <Input 
                    type="datetime-local" 
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Parts Required</Label>
                <Textarea 
                  placeholder="List any parts or materials needed..."
                  className="bg-gray-800 border-gray-700"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Safety Requirements</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-300">Lock Out Tag Out (LOTO) required</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-300">Hot work permit required</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-300">Confined space entry</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-300">Working at height</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline">Cancel</Button>
                <Button>Create Work Order</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Work Orders Tabs */}
      <Tabs defaultValue="open" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="open" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Open ({workOrders.open.length})
          </TabsTrigger>
          <TabsTrigger value="inProgress" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            In Progress ({workOrders.inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Open Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">WO Number</TableHead>
                    <TableHead className="text-gray-400">Equipment</TableHead>
                    <TableHead className="text-gray-400">Issue</TableHead>
                    <TableHead className="text-gray-400">Type</TableHead>
                    <TableHead className="text-gray-400">Priority</TableHead>
                    <TableHead className="text-gray-400">Created</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrders.open.map((order) => (
                    <TableRow key={order.id} className="border-gray-700">
                      <TableCell className="text-white font-medium">{order.id}</TableCell>
                      <TableCell className="text-gray-300">{order.equipment}</TableCell>
                      <TableCell className="text-gray-300">{order.issue}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            order.type === 'Emergency' ? 'border-red-500 text-red-500' :
                            order.type === 'Corrective' ? 'border-yellow-500 text-yellow-500' :
                            'border-blue-500 text-blue-500'
                          }
                        >
                          {order.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            order.priority === 'High' ? 'bg-red-600' :
                            order.priority === 'Medium' ? 'bg-yellow-600' :
                            'bg-blue-600'
                          }
                        >
                          {order.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{order.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Assign</Button>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inProgress">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Work Orders In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workOrders.inProgress.map((order) => (
                  <div key={order.id} className="p-4 bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
                        <div>
                          <p className="text-white font-medium">{order.id} - {order.equipment}</p>
                          <p className="text-gray-400 text-sm">{order.issue}</p>
                        </div>
                      </div>
                      <Badge 
                        className={
                          order.priority === 'High' ? 'bg-red-600' :
                          order.priority === 'Medium' ? 'bg-yellow-600' :
                          'bg-blue-600'
                        }
                      >
                        {order.priority}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-400">Assigned To</p>
                          <p className="text-gray-300">{order.assignee}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-400">Started</p>
                          <p className="text-gray-300">{order.startTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-400">Est. Completion</p>
                          <p className="text-gray-300">{order.estimatedCompletion}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">Update Status</Button>
                      <Button size="sm" variant="outline">Add Notes</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Completed Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">WO Number</TableHead>
                    <TableHead className="text-gray-400">Equipment</TableHead>
                    <TableHead className="text-gray-400">Issue</TableHead>
                    <TableHead className="text-gray-400">Type</TableHead>
                    <TableHead className="text-gray-400">Completed By</TableHead>
                    <TableHead className="text-gray-400">Duration</TableHead>
                    <TableHead className="text-gray-400">Completed At</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrders.completed.map((order) => (
                    <TableRow key={order.id} className="border-gray-700">
                      <TableCell className="text-white font-medium">{order.id}</TableCell>
                      <TableCell className="text-gray-300">{order.equipment}</TableCell>
                      <TableCell className="text-gray-300">{order.issue}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            order.type === 'Emergency' ? 'border-red-500 text-red-500' :
                            order.type === 'Corrective' ? 'border-yellow-500 text-yellow-500' :
                            'border-blue-500 text-blue-500'
                          }
                        >
                          {order.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{order.completedBy}</TableCell>
                      <TableCell className="text-gray-300">{order.duration}</TableCell>
                      <TableCell className="text-gray-300">{order.completedAt}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Work Order Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-400 text-sm">Total Today</h4>
              <Wrench className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">12</p>
            <p className="text-gray-400 text-sm">Work orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-400 text-sm">Avg Response Time</h4>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">1.5 hrs</p>
            <p className="text-green-500 text-sm">Within target</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-400 text-sm">Completion Rate</h4>
              <CheckCircle className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">87%</p>
            <p className="text-yellow-500 text-sm">Below target</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-400 text-sm">Overdue</h4>
              <AlertTriangle className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">3</p>
            <p className="text-red-500 text-sm">Immediate attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}