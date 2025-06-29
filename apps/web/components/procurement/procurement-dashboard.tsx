'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ShoppingCart, AlertTriangle, TrendingUp, Package } from 'lucide-react';

export default function ProcurementDashboard() {
  // Mock data
  const procurementTrend = [
    { month: 'Jan', purchases: 320, budget: 350, savings: 30 },
    { month: 'Feb', purchases: 280, budget: 300, savings: 20 },
    { month: 'Mar', purchases: 340, budget: 350, savings: 10 },
    { month: 'Apr', purchases: 310, budget: 325, savings: 15 },
    { month: 'May', purchases: 290, budget: 300, savings: 10 },
    { month: 'Jun', purchases: 320, budget: 340, savings: 20 },
  ];

  const categorySpend = [
    { name: 'Raw Materials', value: 45, color: '#3B82F6' },
    { name: 'Spare Parts', value: 20, color: '#10B981' },
    { name: 'Chemicals', value: 15, color: '#F59E0B' },
    { name: 'Services', value: 12, color: '#8B5CF6' },
    { name: 'Others', value: 8, color: '#EF4444' },
  ];

  const pendingRequests = [
    { id: 'PR-2024-001', items: 'Mill Bearings (5 sets)', vendor: 'ABC Engineering', amount: 450000, requestor: 'Production', urgency: 'High', daysAgo: 2 },
    { id: 'PR-2024-002', items: 'Sulfuric Acid (1000L)', vendor: 'ChemCorp', amount: 125000, requestor: 'Lab', urgency: 'Medium', daysAgo: 1 },
    { id: 'PR-2024-003', items: 'Safety Equipment', vendor: 'SafetyFirst', amount: 85000, requestor: 'HSE', urgency: 'Low', daysAgo: 3 },
    { id: 'PR-2024-004', items: 'Boiler Tubes', vendor: 'Industrial Supply', amount: 780000, requestor: 'Maintenance', urgency: 'High', daysAgo: 1 },
  ];

  const recentPurchaseOrders = [
    { poNumber: 'PO-2024-156', vendor: 'ABC Engineering', items: 12, value: 850000, status: 'Delivered', deliveryDate: '2024-06-05' },
    { poNumber: 'PO-2024-157', vendor: 'ChemCorp', items: 5, value: 320000, status: 'In Transit', deliveryDate: '2024-06-10' },
    { poNumber: 'PO-2024-158', vendor: 'SafetyFirst', items: 20, value: 125000, status: 'Processing', deliveryDate: '2024-06-12' },
    { poNumber: 'PO-2024-159', vendor: 'Industrial Supply', items: 8, value: 550000, status: 'Shipped', deliveryDate: '2024-06-08' },
  ];

  const vendorPerformance = [
    { vendor: 'ABC Engineering', onTime: 95, quality: 98, compliance: 100, overallScore: 97 },
    { vendor: 'ChemCorp', onTime: 88, quality: 95, compliance: 98, overallScore: 93 },
    { vendor: 'Industrial Supply', onTime: 92, quality: 90, compliance: 95, overallScore: 92 },
    { vendor: 'SafetyFirst', onTime: 98, quality: 100, compliance: 100, overallScore: 99 },
  ];

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      <div className="space-y-3">
        <Alert className="border-red-500 bg-red-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Urgent:</strong> 2 purchase requests pending approval for over 48 hours. Total value: ₹12.3L
          </AlertDescription>
        </Alert>
        <Alert className="border-yellow-500 bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Budget Alert:</strong> Chemical category spending at 85% of monthly budget with 2 weeks remaining.
          </AlertDescription>
        </Alert>
      </div>

      {/* Procurement Trend */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Procurement Spend vs Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={procurementTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
                formatter={(value) => `₹${value}L`}
              />
              <Legend />
              <Line type="monotone" dataKey="purchases" stroke="#3B82F6" strokeWidth={2} name="Actual Spend" />
              <Line type="monotone" dataKey="budget" stroke="#10B981" strokeWidth={2} name="Budget" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="savings" stroke="#F59E0B" strokeWidth={2} name="Savings" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Spend Distribution */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categorySpend}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categorySpend.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  formatter={(value) => `${value}%`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categorySpend.map((item) => (
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

        {/* Vendor Performance */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Top Vendor Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vendorPerformance.map((vendor) => (
                <div key={vendor.vendor} className="p-3 bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{vendor.vendor}</span>
                    <Badge className={vendor.overallScore >= 95 ? 'bg-green-600' : 'bg-yellow-600'}>
                      {vendor.overallScore}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400">On-Time</p>
                      <p className="text-gray-300">{vendor.onTime}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Quality</p>
                      <p className="text-gray-300">{vendor.quality}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Compliance</p>
                      <p className="text-gray-300">{vendor.compliance}%</p>
                    </div>
                  </div>
                  <Progress value={vendor.overallScore} className="mt-2 h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Purchase Requests */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Pending Purchase Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-4 bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium">{request.id}</span>
                    <Badge 
                      className={
                        request.urgency === 'High' ? 'bg-red-600' :
                        request.urgency === 'Medium' ? 'bg-yellow-600' :
                        'bg-blue-600'
                      }
                    >
                      {request.urgency}
                    </Badge>
                  </div>
                  <span className="text-xl font-bold text-white">₹{request.amount.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Items</p>
                    <p className="text-gray-300">{request.items}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Vendor</p>
                    <p className="text-gray-300">{request.vendor}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Requested By</p>
                    <p className="text-gray-300">{request.requestor}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Pending Since</p>
                    <p className="text-yellow-500">{request.daysAgo} days</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Purchase Orders */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Recent Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400">PO Number</th>
                  <th className="text-left py-3 px-4 text-gray-400">Vendor</th>
                  <th className="text-left py-3 px-4 text-gray-400">Items</th>
                  <th className="text-left py-3 px-4 text-gray-400">Value</th>
                  <th className="text-left py-3 px-4 text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400">Delivery Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPurchaseOrders.map((po) => (
                  <tr key={po.poNumber} className="border-b border-gray-700">
                    <td className="py-3 px-4 text-white font-medium">{po.poNumber}</td>
                    <td className="py-3 px-4 text-gray-300">{po.vendor}</td>
                    <td className="py-3 px-4 text-gray-300">{po.items}</td>
                    <td className="py-3 px-4 text-gray-300">₹{po.value.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        className={
                          po.status === 'Delivered' ? 'bg-green-600' :
                          po.status === 'Shipped' || po.status === 'In Transit' ? 'bg-blue-600' :
                          'bg-yellow-600'
                        }
                      >
                        {po.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{po.deliveryDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Cost Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-500">₹12.5L</p>
              <p className="text-gray-400 mt-2">This Month</p>
              <Progress value={75} className="mt-4" />
              <p className="text-sm text-gray-400 mt-2">75% of target achieved</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Procurement Cycle Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-white">4.2 days</p>
              <p className="text-gray-400 mt-2">Average</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Requisition to PO</span>
                  <span className="text-white">2.1 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">PO to Delivery</span>
                  <span className="text-white">2.1 days</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Contract Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-white">92%</p>
              <p className="text-gray-400 mt-2">Overall Compliance</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Price Compliance</span>
                  <Badge className="bg-green-600">98%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Terms Compliance</span>
                  <Badge className="bg-yellow-600">88%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Volume Compliance</span>
                  <Badge className="bg-green-600">95%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}