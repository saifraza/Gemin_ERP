'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

// Mock data
const productionTrend = [
  { date: '01 Jun', sugar: 450, ethanol: 280, power: 120, feed: 90 },
  { date: '02 Jun', sugar: 480, ethanol: 290, power: 125, feed: 95 },
  { date: '03 Jun', sugar: 460, ethanol: 285, power: 122, feed: 92 },
  { date: '04 Jun', sugar: 490, ethanol: 295, power: 128, feed: 98 },
  { date: '05 Jun', sugar: 510, ethanol: 300, power: 130, feed: 100 },
  { date: '06 Jun', sugar: 495, ethanol: 292, power: 126, feed: 96 },
  { date: '07 Jun', sugar: 520, ethanol: 305, power: 132, feed: 102 },
];

const divisionPerformance = [
  { name: 'Sugar', value: 35, color: '#3B82F6' },
  { name: 'Ethanol', value: 30, color: '#10B981' },
  { name: 'Power', value: 20, color: '#F59E0B' },
  { name: 'Feed', value: 15, color: '#8B5CF6' },
];

const shiftPerformance = [
  { shift: 'Morning', target: 400, actual: 420, efficiency: 105 },
  { shift: 'Afternoon', target: 400, actual: 380, efficiency: 95 },
  { shift: 'Night', target: 400, actual: 390, efficiency: 97.5 },
];

export default function ProductionDashboard() {
  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Select defaultValue="7d">
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
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
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Production Trend Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Production Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Line type="monotone" dataKey="sugar" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="ethanol" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="power" stroke="#F59E0B" strokeWidth={2} />
              <Line type="monotone" dataKey="feed" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Division Performance */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Division Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={divisionPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {divisionPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {divisionPerformance.map((item) => (
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

        {/* Shift Performance */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Shift Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={shiftPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="shift" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                />
                <Bar dataKey="target" fill="#6B7280" />
                <Bar dataKey="actual" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {shiftPerformance.map((shift) => (
                <div key={shift.shift} className="flex items-center justify-between">
                  <span className="text-gray-300">{shift.shift}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white">{shift.efficiency}%</span>
                    <Badge 
                      variant={shift.efficiency >= 100 ? 'default' : 'secondary'}
                      className={shift.efficiency >= 100 ? 'bg-green-600' : 'bg-yellow-600'}
                    >
                      {shift.efficiency >= 100 ? 'Above Target' : 'Below Target'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Orders */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Active Production Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: 'PO-2024-001', product: 'Refined Sugar', quantity: '500 MT', progress: 75, status: 'In Progress', priority: 'High' },
              { id: 'PO-2024-002', product: 'Ethanol 99.5%', quantity: '10,000 L', progress: 45, status: 'In Progress', priority: 'Medium' },
              { id: 'PO-2024-003', product: 'Power Generation', quantity: '5 MW', progress: 90, status: 'In Progress', priority: 'High' },
              { id: 'PO-2024-004', product: 'Cattle Feed', quantity: '100 MT', progress: 30, status: 'In Progress', priority: 'Low' },
            ].map((order) => (
              <div key={order.id} className="p-4 bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium">{order.id}</span>
                    <span className="text-gray-400">{order.product}</span>
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
                  <span className="text-gray-300">{order.quantity}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{order.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${order.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}