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
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Plus, 
  Users, 
  Star, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Building,
  Phone,
  Mail,
  MapPin,
  Edit,
  Ban
} from 'lucide-react';

export default function VendorManagement() {
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  // Mock data
  const vendors = [
    {
      id: 'VEN-001',
      name: 'ABC Engineering Ltd.',
      category: 'Spare Parts',
      status: 'Active',
      rating: 4.5,
      compliance: 98,
      totalBusiness: 12500000,
      paymentTerms: '30 days',
      contact: 'John Smith',
      email: 'john@abceng.com',
      phone: '+91 98765 43210',
      address: 'Industrial Area, Mumbai',
      performanceScore: 92,
      deliveryScore: 95,
      qualityScore: 90,
      priceScore: 88,
    },
    {
      id: 'VEN-002',
      name: 'ChemCorp Industries',
      category: 'Chemicals',
      status: 'Active',
      rating: 4.2,
      compliance: 95,
      totalBusiness: 8500000,
      paymentTerms: '45 days',
      contact: 'Sarah Johnson',
      email: 'sarah@chemcorp.com',
      phone: '+91 98765 43211',
      address: 'Chemical Zone, Gujarat',
      performanceScore: 88,
      deliveryScore: 85,
      qualityScore: 92,
      priceScore: 90,
    },
    {
      id: 'VEN-003',
      name: 'SafetyFirst Supplies',
      category: 'Safety Equipment',
      status: 'Active',
      rating: 4.8,
      compliance: 100,
      totalBusiness: 4200000,
      paymentTerms: '15 days',
      contact: 'Mike Wilson',
      email: 'mike@safetyfirst.com',
      phone: '+91 98765 43212',
      address: 'Safety Park, Delhi',
      performanceScore: 96,
      deliveryScore: 98,
      qualityScore: 100,
      priceScore: 85,
    },
    {
      id: 'VEN-004',
      name: 'Industrial Supply Co.',
      category: 'General Supplies',
      status: 'Under Review',
      rating: 3.8,
      compliance: 82,
      totalBusiness: 6800000,
      paymentTerms: '60 days',
      contact: 'David Lee',
      email: 'david@indsupply.com',
      phone: '+91 98765 43213',
      address: 'Supply Hub, Chennai',
      performanceScore: 78,
      deliveryScore: 75,
      qualityScore: 80,
      priceScore: 82,
    },
  ];

  const vendorCategories = [
    'Spare Parts',
    'Chemicals',
    'Raw Materials',
    'Safety Equipment',
    'IT & Electronics',
    'Services',
    'General Supplies',
  ];

  const performanceData = [
    { metric: 'On-Time Delivery', value: 92 },
    { metric: 'Quality Compliance', value: 95 },
    { metric: 'Price Competitiveness', value: 88 },
    { metric: 'Response Time', value: 90 },
    { metric: 'Documentation', value: 94 },
  ];

  const spendTrend = [
    { month: 'Jan', ABC: 850, ChemCorp: 620, SafetyFirst: 280, Industrial: 450 },
    { month: 'Feb', ABC: 920, ChemCorp: 580, SafetyFirst: 320, Industrial: 480 },
    { month: 'Mar', ABC: 1100, ChemCorp: 690, SafetyFirst: 290, Industrial: 520 },
    { month: 'Apr', ABC: 980, ChemCorp: 710, SafetyFirst: 350, Industrial: 490 },
    { month: 'May', ABC: 1050, ChemCorp: 650, SafetyFirst: 310, Industrial: 510 },
    { month: 'Jun', ABC: 1200, ChemCorp: 720, SafetyFirst: 380, Industrial: 550 },
  ];

  return (
    <div className="space-y-6">
      {/* Vendor Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Input 
            placeholder="Search vendors..." 
            className="w-64 bg-gray-800 border-gray-700"
          />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {vendorCategories.map(cat => (
                <SelectItem key={cat} value={cat.toLowerCase().replace(' ', '-')}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="active">
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="under-review">Under Review</SelectItem>
              <SelectItem value="blacklisted">Blacklisted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle>Register New Vendor</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vendor Name</Label>
                    <Input 
                      placeholder="Enter vendor name" 
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vendor Code</Label>
                    <Input 
                      placeholder="Auto-generated or enter code" 
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
                        {vendorCategories.map(cat => (
                          <SelectItem key={cat} value={cat.toLowerCase().replace(' ', '-')}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>GST Number</Label>
                    <Input 
                      placeholder="Enter GST number" 
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Person</Label>
                    <Input 
                      placeholder="Primary contact name" 
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Designation</Label>
                    <Input 
                      placeholder="Contact designation" 
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      placeholder="contact@vendor.com" 
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      placeholder="+91 98765 43210" 
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea 
                    placeholder="Enter complete address"
                    className="bg-gray-800 border-gray-700"
                    rows={3}
                  />
                </div>
              </div>

              {/* Commercial Terms */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Commercial Terms</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Terms</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="advance">Advance Payment</SelectItem>
                        <SelectItem value="15-days">15 Days</SelectItem>
                        <SelectItem value="30-days">30 Days</SelectItem>
                        <SelectItem value="45-days">45 Days</SelectItem>
                        <SelectItem value="60-days">60 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Credit Limit</Label>
                    <Input 
                      type="number"
                      placeholder="Enter credit limit in ₹" 
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button>Register Vendor</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vendor Alerts */}
      <div className="space-y-3">
        <Alert className="border-yellow-500 bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Compliance Alert:</strong> 3 vendors have pending document renewals due within 30 days.
          </AlertDescription>
        </Alert>
      </div>

      {/* Vendor Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Vendors</p>
                <p className="text-2xl font-bold text-white">142</p>
                <p className="text-green-500 text-sm mt-1">128 active</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Performance</p>
                <p className="text-2xl font-bold text-white">91%</p>
                <Progress value={91} className="mt-2" />
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Compliance Rate</p>
                <p className="text-2xl font-bold text-white">89%</p>
                <p className="text-yellow-500 text-sm mt-1">12 pending</p>
              </div>
              <CheckCircle className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Under Review</p>
                <p className="text-2xl font-bold text-white">5</p>
                <p className="text-orange-500 text-sm mt-1">Performance issues</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Spend Trend */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Top Vendor Spend Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                formatter={(value) => `₹${value}K`}
              />
              <Legend />
              <Line type="monotone" dataKey="ABC" stroke="#3B82F6" strokeWidth={2} name="ABC Engineering" />
              <Line type="monotone" dataKey="ChemCorp" stroke="#10B981" strokeWidth={2} name="ChemCorp" />
              <Line type="monotone" dataKey="SafetyFirst" stroke="#F59E0B" strokeWidth={2} name="SafetyFirst" />
              <Line type="monotone" dataKey="Industrial" stroke="#8B5CF6" strokeWidth={2} name="Industrial Supply" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Vendor Management Tabs */}
      <Tabs defaultValue="all-vendors" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="all-vendors">All Vendors</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
          <TabsTrigger value="evaluation">Vendor Evaluation</TabsTrigger>
        </TabsList>

        <TabsContent value="all-vendors">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Vendor List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-400">Vendor ID</TableHead>
                    <TableHead className="text-gray-400">Name</TableHead>
                    <TableHead className="text-gray-400">Category</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Rating</TableHead>
                    <TableHead className="text-gray-400">Compliance</TableHead>
                    <TableHead className="text-gray-400">Total Business</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id} className="border-gray-700">
                      <TableCell className="text-white font-medium">{vendor.id}</TableCell>
                      <TableCell className="text-gray-300">{vendor.name}</TableCell>
                      <TableCell className="text-gray-300">{vendor.category}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            vendor.status === 'Active' ? 'bg-green-600' :
                            vendor.status === 'Under Review' ? 'bg-yellow-600' :
                            'bg-red-600'
                          }
                        >
                          {vendor.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-white">{vendor.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={vendor.compliance} className="w-16" />
                          <span className="text-gray-300">{vendor.compliance}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">₹{(vendor.totalBusiness / 100000).toFixed(1)}L</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
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

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
                    <Radar name="Performance" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Top Performing Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vendors
                    .sort((a, b) => b.performanceScore - a.performanceScore)
                    .slice(0, 4)
                    .map((vendor, index) => (
                      <div key={vendor.id} className="p-3 bg-gray-900 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                            <div>
                              <p className="text-white font-medium">{vendor.name}</p>
                              <p className="text-gray-400 text-sm">{vendor.category}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-600">
                            {vendor.performanceScore}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <p className="text-gray-400">Delivery</p>
                            <p className="text-gray-300">{vendor.deliveryScore}%</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Quality</p>
                            <p className="text-gray-300">{vendor.qualityScore}%</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Price</p>
                            <p className="text-gray-300">{vendor.priceScore}%</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Rating</p>
                            <p className="text-gray-300">{vendor.rating}/5</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Vendor Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-gray-900 rounded-lg text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Fully Compliant</p>
                    <p className="text-2xl font-bold text-white">108</p>
                  </div>
                  <div className="p-4 bg-gray-900 rounded-lg text-center">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Minor Issues</p>
                    <p className="text-2xl font-bold text-white">26</p>
                  </div>
                  <div className="p-4 bg-gray-900 rounded-lg text-center">
                    <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Major Issues</p>
                    <p className="text-2xl font-bold text-white">5</p>
                  </div>
                  <div className="p-4 bg-gray-900 rounded-lg text-center">
                    <Ban className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Non-Compliant</p>
                    <p className="text-2xl font-bold text-white">3</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Pending Compliance Actions</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-900 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">ABC Engineering Ltd.</p>
                        <p className="text-gray-400 text-sm">GST Certificate renewal due in 15 days</p>
                      </div>
                      <Button size="sm" variant="outline">Send Reminder</Button>
                    </div>
                    <div className="p-3 bg-gray-900 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">ChemCorp Industries</p>
                        <p className="text-gray-400 text-sm">Insurance policy expired 5 days ago</p>
                      </div>
                      <Button size="sm" variant="outline" className="text-red-500">Urgent</Button>
                    </div>
                    <div className="p-3 bg-gray-900 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Industrial Supply Co.</p>
                        <p className="text-gray-400 text-sm">Quality certification renewal due in 30 days</p>
                      </div>
                      <Button size="sm" variant="outline">Send Reminder</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Vendor Evaluation Form</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Vendor</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Choose vendor to evaluate" />
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

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Performance Criteria</h3>
                    <div className="space-y-3">
                      {['Product Quality', 'Delivery Performance', 'Price Competitiveness', 'Customer Service', 'Technical Support'].map(criteria => (
                        <div key={criteria} className="space-y-2">
                          <Label>{criteria}</Label>
                          <Select>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 - Excellent</SelectItem>
                              <SelectItem value="4">4 - Good</SelectItem>
                              <SelectItem value="3">3 - Average</SelectItem>
                              <SelectItem value="2">2 - Below Average</SelectItem>
                              <SelectItem value="1">1 - Poor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Compliance Check</h3>
                    <div className="space-y-3">
                      {['Valid GST Certificate', 'Insurance Policy', 'Quality Certifications', 'PAN Card', 'Bank Details'].map(doc => (
                        <label key={doc} className="flex items-center gap-3">
                          <input type="checkbox" className="rounded" />
                          <span className="text-gray-300">{doc}</span>
                        </label>
                      ))}
                    </div>

                    <div className="space-y-2 mt-6">
                      <Label>Additional Comments</Label>
                      <Textarea 
                        placeholder="Enter evaluation comments..."
                        className="bg-gray-800 border-gray-700"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline">Save Draft</Button>
                  <Button>Submit Evaluation</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}