'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, Mail, Printer } from 'lucide-react';

export default function QualityReports() {
  // Mock data
  const certificationData = [
    { name: 'ISO 9001', status: 'Active', expiry: '2025-12-31' },
    { name: 'FSSC 22000', status: 'Active', expiry: '2025-06-15' },
    { name: 'ISO 14001', status: 'Active', expiry: '2024-09-30' },
    { name: 'OHSAS 18001', status: 'Renewal Due', expiry: '2024-07-15' },
  ];

  const qualityTrendData = [
    { month: 'Jan', defectRate: 1.2, customerComplaints: 5, rework: 2.1 },
    { month: 'Feb', defectRate: 1.0, customerComplaints: 3, rework: 1.8 },
    { month: 'Mar', defectRate: 0.9, customerComplaints: 4, rework: 1.5 },
    { month: 'Apr', defectRate: 0.8, customerComplaints: 2, rework: 1.2 },
    { month: 'May', defectRate: 0.7, customerComplaints: 1, rework: 1.0 },
    { month: 'Jun', defectRate: 0.6, customerComplaints: 2, rework: 0.8 },
  ];

  const divisionQualityScores = [
    { division: 'Sugar', score: 98.5, target: 98 },
    { division: 'Ethanol', score: 99.2, target: 99 },
    { division: 'Power', score: 97.8, target: 98 },
    { division: 'Feed', score: 96.5, target: 97 },
  ];

  const nonConformances = [
    { id: 'NC-001', date: '2024-06-05', division: 'Sugar', issue: 'Color variation in batch #125', severity: 'Minor', status: 'Open' },
    { id: 'NC-002', date: '2024-06-04', division: 'Feed', issue: 'Protein content below spec', severity: 'Major', status: 'Closed' },
    { id: 'NC-003', date: '2024-06-03', division: 'Power', issue: 'Power factor below target', severity: 'Minor', status: 'In Progress' },
    { id: 'NC-004', date: '2024-06-02', division: 'Ethanol', issue: 'pH level variation', severity: 'Minor', status: 'Closed' },
  ];

  const costOfQuality = [
    { category: 'Prevention', amount: 45000, percentage: 15 },
    { category: 'Appraisal', amount: 60000, percentage: 20 },
    { category: 'Internal Failure', amount: 120000, percentage: 40 },
    { category: 'External Failure', amount: 75000, percentage: 25 },
  ];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Select defaultValue="monthly">
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily Quality Report</SelectItem>
              <SelectItem value="weekly">Weekly Quality Report</SelectItem>
              <SelectItem value="monthly">Monthly Quality Report</SelectItem>
              <SelectItem value="quarterly">Quarterly Review</SelectItem>
              <SelectItem value="annual">Annual Quality Report</SelectItem>
            </SelectContent>
          </Select>
          <DatePickerWithRange className="bg-gray-800 border-gray-700" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </Button>
          <Button size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Quality Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {divisionQualityScores.map((division) => (
          <Card key={division.division} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h4 className="text-white font-medium mb-2">{division.division} Quality Score</h4>
              <div className="text-3xl font-bold text-white mb-1">{division.score}%</div>
              <div className="text-sm text-gray-400">Target: {division.target}%</div>
              <div className={`text-sm mt-2 ${division.score >= division.target ? 'text-green-500' : 'text-red-500'}`}>
                {division.score >= division.target ? '✓ Above Target' : '✗ Below Target'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quality Trends */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Quality Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={qualityTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Line type="monotone" dataKey="defectRate" stroke="#EF4444" strokeWidth={2} name="Defect Rate (%)" />
              <Line type="monotone" dataKey="customerComplaints" stroke="#F59E0B" strokeWidth={2} name="Customer Complaints" />
              <Line type="monotone" dataKey="rework" stroke="#3B82F6" strokeWidth={2} name="Rework (%)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost of Quality */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Cost of Quality Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={costOfQuality}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {costOfQuality.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {costOfQuality.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-gray-300">{item.category}</span>
                  </div>
                  <span className="text-white font-medium">₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-400">Total CoQ</span>
                <span className="text-white font-bold">₹300,000</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-400">% of Revenue</span>
                <span className="text-white">2.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certification Status */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Certification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {certificationData.map((cert) => (
                <div key={cert.name} className="p-3 bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{cert.name}</p>
                      <p className="text-gray-400 text-sm">Expires: {cert.expiry}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm ${
                      cert.status === 'Active' ? 'bg-green-600' : 'bg-yellow-600'
                    }`}>
                      {cert.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <FileText className="h-4 w-4 mr-2" />
              View All Certificates
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Non-Conformance Report */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Non-Conformance Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-400">NC ID</TableHead>
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400">Division</TableHead>
                <TableHead className="text-gray-400">Issue</TableHead>
                <TableHead className="text-gray-400">Severity</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nonConformances.map((nc) => (
                <TableRow key={nc.id} className="border-gray-700">
                  <TableCell className="text-white font-medium">{nc.id}</TableCell>
                  <TableCell className="text-gray-300">{nc.date}</TableCell>
                  <TableCell className="text-gray-300">{nc.division}</TableCell>
                  <TableCell className="text-gray-300">{nc.issue}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      nc.severity === 'Major' ? 'bg-orange-600' : 'bg-yellow-600'
                    }`}>
                      {nc.severity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      nc.status === 'Closed' ? 'bg-green-600' :
                      nc.status === 'Open' ? 'bg-red-600' :
                      'bg-yellow-600'
                    }`}>
                      {nc.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Quality KPI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <p className="text-gray-400 text-sm">First Pass Yield</p>
              <p className="text-2xl font-bold text-white">94.5%</p>
              <p className="text-green-500 text-sm">↑ 2.3% from last month</p>
            </div>
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <p className="text-gray-400 text-sm">Customer Satisfaction</p>
              <p className="text-2xl font-bold text-white">4.6/5</p>
              <p className="text-green-500 text-sm">↑ 0.2 from last month</p>
            </div>
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <p className="text-gray-400 text-sm">On-Time Delivery</p>
              <p className="text-2xl font-bold text-white">98.2%</p>
              <p className="text-red-500 text-sm">↓ 0.5% from last month</p>
            </div>
            <div className="text-center p-4 bg-gray-900 rounded-lg">
              <p className="text-gray-400 text-sm">Process Capability</p>
              <p className="text-2xl font-bold text-white">1.85</p>
              <p className="text-green-500 text-sm">↑ 0.05 from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}