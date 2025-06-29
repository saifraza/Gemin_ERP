'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, Mail, Printer } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ProductionReports() {
  const [selectedReport, setSelectedReport] = useState('daily');
  const [selectedDivision, setSelectedDivision] = useState('all');

  // Mock data for reports
  const productionSummary = {
    sugar: { planned: 1000, actual: 980, variance: -2 },
    ethanol: { planned: 50000, actual: 52000, variance: 4 },
    power: { planned: 100, actual: 95, variance: -5 },
    feed: { planned: 200, actual: 210, variance: 5 },
  };

  const efficiencyData = [
    { date: '01', sugar: 92, ethanol: 88, power: 95, feed: 90 },
    { date: '02', sugar: 94, ethanol: 90, power: 93, feed: 88 },
    { date: '03', sugar: 91, ethanol: 92, power: 94, feed: 91 },
    { date: '04', sugar: 93, ethanol: 89, power: 96, feed: 89 },
    { date: '05', sugar: 95, ethanol: 91, power: 92, feed: 92 },
    { date: '06', sugar: 94, ethanol: 93, power: 94, feed: 90 },
    { date: '07', sugar: 96, ethanol: 94, power: 95, feed: 93 },
  ];

  const wasteData = [
    { name: 'Bagasse Utilized', value: 85, color: '#10B981' },
    { name: 'Bagasse Waste', value: 15, color: '#EF4444' },
  ];

  const batchReports = [
    { batch: 'B-2024-001', product: 'Sugar Grade A', quantity: '100 MT', quality: '99.2%', status: 'Completed' },
    { batch: 'B-2024-002', product: 'Ethanol 99.5%', quantity: '5000 L', quality: '99.5%', status: 'Completed' },
    { batch: 'B-2024-003', product: 'Power', quantity: '10 MWh', quality: 'PF 0.95', status: 'In Progress' },
    { batch: 'B-2024-004', product: 'Cattle Feed', quantity: '20 MT', quality: '18.5% Protein', status: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily Report</SelectItem>
              <SelectItem value="weekly">Weekly Report</SelectItem>
              <SelectItem value="monthly">Monthly Report</SelectItem>
              <SelectItem value="custom">Custom Period</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDivision} onValueChange={setSelectedDivision}>
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              <SelectItem value="sugar">Sugar</SelectItem>
              <SelectItem value="ethanol">Ethanol</SelectItem>
              <SelectItem value="power">Power</SelectItem>
              <SelectItem value="feed">Animal Feed</SelectItem>
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
            Export
          </Button>
        </div>
      </div>

      {/* Production Summary */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Production Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(productionSummary).map(([division, data]) => (
              <div key={division} className="p-4 bg-gray-900 rounded-lg">
                <h4 className="text-white font-medium capitalize mb-3">{division}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Planned</span>
                    <span className="text-white">{data.planned.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Actual</span>
                    <span className="text-white">{data.actual.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Variance</span>
                    <span className={data.variance >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {data.variance > 0 ? '+' : ''}{data.variance}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Efficiency Trends */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Efficiency Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={efficiencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[80, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Line type="monotone" dataKey="sugar" stroke="#3B82F6" strokeWidth={2} name="Sugar" />
              <Line type="monotone" dataKey="ethanol" stroke="#10B981" strokeWidth={2} name="Ethanol" />
              <Line type="monotone" dataKey="power" stroke="#F59E0B" strokeWidth={2} name="Power" />
              <Line type="monotone" dataKey="feed" stroke="#8B5CF6" strokeWidth={2} name="Feed" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Waste Utilization */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Waste Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={wasteData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {wasteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {wasteData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }} />
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Overall Equipment Effectiveness (OEE)</span>
                <span className="text-white font-medium">85.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">First Pass Yield</span>
                <span className="text-white font-medium">92.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Mean Time Between Failures</span>
                <span className="text-white font-medium">168 hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Schedule Adherence</span>
                <span className="text-white font-medium">94.7%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Energy Efficiency</span>
                <span className="text-white font-medium">78.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Raw Material Utilization</span>
                <span className="text-white font-medium">96.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Reports */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Batch Production Report</CardTitle>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Detailed Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-400">Batch ID</TableHead>
                <TableHead className="text-gray-400">Product</TableHead>
                <TableHead className="text-gray-400">Quantity</TableHead>
                <TableHead className="text-gray-400">Quality</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batchReports.map((batch) => (
                <TableRow key={batch.batch} className="border-gray-700">
                  <TableCell className="text-white font-medium">{batch.batch}</TableCell>
                  <TableCell className="text-gray-300">{batch.product}</TableCell>
                  <TableCell className="text-gray-300">{batch.quantity}</TableCell>
                  <TableCell className="text-gray-300">{batch.quality}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      batch.status === 'Completed' ? 'bg-green-600' : 'bg-yellow-600'
                    }`}>
                      {batch.status}
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
    </div>
  );
}