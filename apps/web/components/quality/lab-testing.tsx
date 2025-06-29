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
  Beaker, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  FileText,
  Download
} from 'lucide-react';

export default function LabTesting() {
  const [selectedTest, setSelectedTest] = useState<any>(null);

  const pendingTests = [
    { id: 'LT-001', sample: 'Sugar Batch #127', type: 'Purity Test', priority: 'High', requestedBy: 'Production', requestTime: '09:00 AM' },
    { id: 'LT-002', sample: 'Ethanol Tank B', type: 'Concentration Test', priority: 'Medium', requestedBy: 'Quality Team', requestTime: '09:30 AM' },
    { id: 'LT-003', sample: 'Feed Sample #46', type: 'Nutritional Analysis', priority: 'Low', requestedBy: 'Feed Unit', requestTime: '10:00 AM' },
    { id: 'LT-004', sample: 'Molasses #15', type: 'Brix Test', priority: 'High', requestedBy: 'Distillery', requestTime: '10:15 AM' },
  ];

  const ongoingTests = [
    { id: 'LT-005', sample: 'Sugar Batch #126', type: 'Color Test', progress: 75, technician: 'John Doe', startTime: '08:00 AM' },
    { id: 'LT-006', sample: 'Power Output', type: 'Quality Factor', progress: 50, technician: 'Jane Smith', startTime: '08:30 AM' },
  ];

  const completedTests = [
    { id: 'LT-007', sample: 'Sugar Batch #125', type: 'Purity Test', result: '99.2%', status: 'Passed', completedTime: '08:45 AM' },
    { id: 'LT-008', sample: 'Ethanol Tank A', type: 'Concentration', result: '99.5%', status: 'Passed', completedTime: '09:15 AM' },
    { id: 'LT-009', sample: 'Feed Sample #44', type: 'Protein Content', result: '17.8%', status: 'Failed', completedTime: '09:45 AM' },
  ];

  const testMethods = {
    sugar: ['Purity Test', 'Color Test (ICUMSA)', 'Moisture Content', 'Ash Content', 'Grain Size'],
    ethanol: ['Concentration Test', 'pH Test', 'Specific Gravity', 'Impurity Analysis', 'Methanol Content'],
    power: ['Power Factor', 'Frequency Analysis', 'Harmonic Distortion', 'Voltage Stability'],
    feed: ['Protein Content', 'Fat Content', 'Fiber Analysis', 'Moisture Content', 'Nutritional Value'],
  };

  return (
    <div className="space-y-6">
      {/* Test Request Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Input 
            placeholder="Search tests..." 
            className="w-64 bg-gray-800 border-gray-700"
          />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Test Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle>Create New Test Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sample Type</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select sample type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sugar">Sugar</SelectItem>
                      <SelectItem value="ethanol">Ethanol</SelectItem>
                      <SelectItem value="power">Power</SelectItem>
                      <SelectItem value="feed">Animal Feed</SelectItem>
                      <SelectItem value="molasses">Molasses</SelectItem>
                      <SelectItem value="bagasse">Bagasse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sample ID/Batch</Label>
                  <Input 
                    placeholder="Enter sample ID" 
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Test Type</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purity">Purity Test</SelectItem>
                      <SelectItem value="concentration">Concentration Test</SelectItem>
                      <SelectItem value="color">Color Test</SelectItem>
                      <SelectItem value="moisture">Moisture Content</SelectItem>
                      <SelectItem value="nutritional">Nutritional Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Special Instructions</Label>
                <Textarea 
                  placeholder="Enter any special instructions for the test..."
                  className="bg-gray-800 border-gray-700"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Requested By</Label>
                  <Input 
                    placeholder="Department/Person" 
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

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline">Cancel</Button>
                <Button>Submit Test Request</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Test Status Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingTests.length})
          </TabsTrigger>
          <TabsTrigger value="ongoing" className="flex items-center gap-2">
            <Beaker className="h-4 w-4" />
            Ongoing ({ongoingTests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Pending Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Test ID</TableHead>
                    <TableHead className="text-gray-400">Sample</TableHead>
                    <TableHead className="text-gray-400">Test Type</TableHead>
                    <TableHead className="text-gray-400">Priority</TableHead>
                    <TableHead className="text-gray-400">Requested By</TableHead>
                    <TableHead className="text-gray-400">Time</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTests.map((test) => (
                    <TableRow key={test.id} className="border-gray-700">
                      <TableCell className="text-white font-medium">{test.id}</TableCell>
                      <TableCell className="text-gray-300">{test.sample}</TableCell>
                      <TableCell className="text-gray-300">{test.type}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            test.priority === 'High' ? 'bg-red-600' :
                            test.priority === 'Medium' ? 'bg-yellow-600' :
                            'bg-blue-600'
                          }
                        >
                          {test.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{test.requestedBy}</TableCell>
                      <TableCell className="text-gray-300">{test.requestTime}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Start Test</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ongoing">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Ongoing Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ongoingTests.map((test) => (
                  <div key={test.id} className="p-4 bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <Beaker className="h-5 w-5 text-blue-500 animate-pulse" />
                        <span className="text-white font-medium">{test.id}</span>
                        <span className="text-gray-400">{test.sample}</span>
                      </div>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Test Type</p>
                        <p className="text-gray-300">{test.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Technician</p>
                        <p className="text-gray-300">{test.technician}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Started</p>
                        <p className="text-gray-300">{test.startTime}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{test.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${test.progress}%` }}
                        />
                      </div>
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
              <CardTitle>Completed Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Test ID</TableHead>
                    <TableHead className="text-gray-400">Sample</TableHead>
                    <TableHead className="text-gray-400">Test Type</TableHead>
                    <TableHead className="text-gray-400">Result</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Completed</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedTests.map((test) => (
                    <TableRow key={test.id} className="border-gray-700">
                      <TableCell className="text-white font-medium">{test.id}</TableCell>
                      <TableCell className="text-gray-300">{test.sample}</TableCell>
                      <TableCell className="text-gray-300">{test.type}</TableCell>
                      <TableCell className="text-gray-300">{test.result}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {test.status === 'Passed' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className={test.status === 'Passed' ? 'text-green-500' : 'text-red-500'}>
                            {test.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{test.completedTime}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Methods Reference */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Standard Test Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(testMethods).map(([category, methods]) => (
              <div key={category} className="p-4 bg-gray-900 rounded-lg">
                <h4 className="text-white font-medium capitalize mb-3">{category} Tests</h4>
                <ul className="space-y-1">
                  {methods.map((method) => (
                    <li key={method} className="text-gray-400 text-sm">• {method}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}