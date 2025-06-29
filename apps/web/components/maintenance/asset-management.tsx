'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Settings, 
  Plus, 
  FileText, 
  Download,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function AssetManagement() {
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // Mock data
  const assets = [
    {
      id: 'AST-001',
      name: 'Sugar Mill #1',
      category: 'Production Equipment',
      location: 'Building A',
      status: 'Operational',
      purchaseDate: '2015-03-15',
      value: 5000000,
      depreciation: 35,
      criticality: 'High',
      maintenanceCost: 125000,
    },
    {
      id: 'AST-002',
      name: 'Boiler #1',
      category: 'Utility Equipment',
      location: 'Power House',
      status: 'Operational',
      purchaseDate: '2018-06-20',
      value: 3000000,
      depreciation: 20,
      criticality: 'Critical',
      maintenanceCost: 85000,
    },
    {
      id: 'AST-003',
      name: 'Distillery Unit A',
      category: 'Production Equipment',
      location: 'Building B',
      status: 'Under Maintenance',
      purchaseDate: '2016-09-10',
      value: 4000000,
      depreciation: 30,
      criticality: 'High',
      maintenanceCost: 95000,
    },
    {
      id: 'AST-004',
      name: 'Power Generator #1',
      category: 'Utility Equipment',
      location: 'Power House',
      status: 'Operational',
      purchaseDate: '2019-12-05',
      value: 2500000,
      depreciation: 15,
      criticality: 'Critical',
      maintenanceCost: 65000,
    },
  ];

  const assetPerformance = [
    { month: 'Jan', availability: 95, reliability: 92, oee: 88 },
    { month: 'Feb', availability: 94, reliability: 93, oee: 87 },
    { month: 'Mar', availability: 96, reliability: 91, oee: 89 },
    { month: 'Apr', availability: 93, reliability: 94, oee: 88 },
    { month: 'May', availability: 95, reliability: 93, oee: 90 },
    { month: 'Jun', availability: 94, reliability: 92, oee: 88 },
  ];

  const assetLifecycle = [
    { phase: 'Commissioning', assets: 2 },
    { phase: 'Early Life', assets: 8 },
    { phase: 'Useful Life', assets: 25 },
    { phase: 'Wear Out', assets: 5 },
    { phase: 'End of Life', assets: 2 },
  ];

  const sparePartInventory = [
    { partNo: 'SP-001', description: 'Mill Bearing Set', criticalAssets: ['Sugar Mill #1', 'Sugar Mill #2'], stock: 4, minStock: 2, status: 'Adequate' },
    { partNo: 'SP-002', description: 'Boiler Safety Valve', criticalAssets: ['Boiler #1', 'Boiler #2'], stock: 1, minStock: 2, status: 'Low' },
    { partNo: 'SP-003', description: 'Pump Seal Kit', criticalAssets: ['Distillery Unit A'], stock: 6, minStock: 3, status: 'Adequate' },
    { partNo: 'SP-004', description: 'Filter Elements', criticalAssets: ['All Units'], stock: 25, minStock: 20, status: 'Adequate' },
  ];

  return (
    <div className="space-y-6">
      {/* Asset Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Input 
            placeholder="Search assets..." 
            className="w-64 bg-gray-800 border-gray-700"
          />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="production">Production Equipment</SelectItem>
              <SelectItem value="utility">Utility Equipment</SelectItem>
              <SelectItem value="facility">Facility Assets</SelectItem>
              <SelectItem value="vehicle">Vehicles</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle>Register New Asset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Asset Name</Label>
                  <Input 
                    placeholder="Enter asset name" 
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Asset ID</Label>
                  <Input 
                    placeholder="Auto-generated or enter ID" 
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production Equipment</SelectItem>
                      <SelectItem value="utility">Utility Equipment</SelectItem>
                      <SelectItem value="facility">Facility Assets</SelectItem>
                      <SelectItem value="vehicle">Vehicles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="building-a">Building A</SelectItem>
                      <SelectItem value="building-b">Building B</SelectItem>
                      <SelectItem value="power-house">Power House</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Purchase Date</Label>
                  <Input 
                    type="date" 
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Value</Label>
                  <Input 
                    type="number" 
                    placeholder="Enter value in ₹" 
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Criticality</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select criticality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Warranty Period</Label>
                  <Input 
                    placeholder="e.g., 2 years" 
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Manufacturer Details</Label>
                <Input 
                  placeholder="Manufacturer name and model" 
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline">Cancel</Button>
                <Button>Register Asset</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Asset Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Assets</p>
                <p className="text-2xl font-bold text-white">142</p>
                <p className="text-gray-400 text-sm">₹45.2 Cr value</p>
              </div>
              <Settings className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Critical Assets</p>
                <p className="text-2xl font-bold text-white">28</p>
                <p className="text-green-500 text-sm">All operational</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Asset Age</p>
                <p className="text-2xl font-bold text-white">6.5 yrs</p>
                <p className="text-yellow-500 text-sm">42% depreciated</p>
              </div>
              <TrendingDown className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Maintenance Cost</p>
                <p className="text-2xl font-bold text-white">₹3.2L</p>
                <p className="text-gray-400 text-sm">This month</p>
              </div>
              <TrendingUp className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Performance Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Asset Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={assetPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Line type="monotone" dataKey="availability" stroke="#10B981" strokeWidth={2} name="Availability %" />
              <Line type="monotone" dataKey="reliability" stroke="#3B82F6" strokeWidth={2} name="Reliability %" />
              <Line type="monotone" dataKey="oee" stroke="#F59E0B" strokeWidth={2} name="OEE %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Asset Management Tabs */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="inventory">Asset Inventory</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle Analysis</TabsTrigger>
          <TabsTrigger value="spares">Spare Parts</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Asset Inventory</CardTitle>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Asset ID</TableHead>
                    <TableHead className="text-gray-400">Name</TableHead>
                    <TableHead className="text-gray-400">Category</TableHead>
                    <TableHead className="text-gray-400">Location</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Value (₹)</TableHead>
                    <TableHead className="text-gray-400">Depreciation</TableHead>
                    <TableHead className="text-gray-400">Criticality</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id} className="border-gray-700">
                      <TableCell className="text-white font-medium">{asset.id}</TableCell>
                      <TableCell className="text-gray-300">{asset.name}</TableCell>
                      <TableCell className="text-gray-300">{asset.category}</TableCell>
                      <TableCell className="text-gray-300">{asset.location}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            asset.status === 'Operational' ? 'bg-green-600' :
                            asset.status === 'Under Maintenance' ? 'bg-yellow-600' :
                            'bg-red-600'
                          }
                        >
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{asset.value.toLocaleString()}</TableCell>
                      <TableCell className="text-gray-300">{asset.depreciation}%</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            asset.criticality === 'Critical' ? 'border-red-500 text-red-500' :
                            asset.criticality === 'High' ? 'border-orange-500 text-orange-500' :
                            'border-yellow-500 text-yellow-500'
                          }
                        >
                          {asset.criticality}
                        </Badge>
                      </TableCell>
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

        <TabsContent value="lifecycle">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Asset Lifecycle Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assetLifecycle}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="phase" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Bar dataKey="assets" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-3">
                <Alert className="border-yellow-500 bg-yellow-900/20">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    5 assets are approaching end of life and require replacement planning.
                  </AlertDescription>
                </Alert>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Replacement Planning</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Conveyor Belt System - Replace by Q3 2024</li>
                    <li>• Cooling Tower Fan - Replace by Q4 2024</li>
                    <li>• Mill Gearbox #3 - Major overhaul or replace by Q1 2025</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spares">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Critical Spare Parts Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Part No</TableHead>
                    <TableHead className="text-gray-400">Description</TableHead>
                    <TableHead className="text-gray-400">Critical Assets</TableHead>
                    <TableHead className="text-gray-400">Stock</TableHead>
                    <TableHead className="text-gray-400">Min Stock</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sparePartInventory.map((part) => (
                    <TableRow key={part.partNo} className="border-gray-700">
                      <TableCell className="text-white font-medium">{part.partNo}</TableCell>
                      <TableCell className="text-gray-300">{part.description}</TableCell>
                      <TableCell className="text-gray-300">
                        {Array.isArray(part.criticalAssets) ? part.criticalAssets.join(', ') : part.criticalAssets}
                      </TableCell>
                      <TableCell className="text-gray-300">{part.stock}</TableCell>
                      <TableCell className="text-gray-300">{part.minStock}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            part.status === 'Adequate' ? 'bg-green-600' :
                            part.status === 'Low' ? 'bg-red-600' :
                            'bg-yellow-600'
                          }
                        >
                          {part.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Order</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}