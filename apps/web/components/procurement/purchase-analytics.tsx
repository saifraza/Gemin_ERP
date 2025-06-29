'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package,
  Users,
  Calendar,
  Download,
  Filter,
  CheckCircle
} from 'lucide-react';

export default function PurchaseAnalytics() {
  // Mock data
  const yearlySpend = [
    { month: 'Jan', actual: 280, budget: 300, forecast: 290 },
    { month: 'Feb', actual: 320, budget: 325, forecast: 315 },
    { month: 'Mar', actual: 310, budget: 300, forecast: 305 },
    { month: 'Apr', actual: 340, budget: 350, forecast: 345 },
    { month: 'May', actual: 330, budget: 340, forecast: 335 },
    { month: 'Jun', actual: 360, budget: 375, forecast: 370 },
    { month: 'Jul', actual: 0, budget: 380, forecast: 375 },
    { month: 'Aug', actual: 0, budget: 370, forecast: 365 },
    { month: 'Sep', actual: 0, budget: 360, forecast: 355 },
    { month: 'Oct', actual: 0, budget: 350, forecast: 345 },
    { month: 'Nov', actual: 0, budget: 340, forecast: 335 },
    { month: 'Dec', actual: 0, budget: 330, forecast: 325 },
  ];

  const categoryAnalysis = [
    { category: 'Raw Materials', spend: 1250000, count: 156, avgValue: 8013, growth: 12 },
    { category: 'Spare Parts', spend: 850000, count: 234, avgValue: 3632, growth: -5 },
    { category: 'Chemicals', spend: 620000, count: 89, avgValue: 6966, growth: 8 },
    { category: 'Safety Equipment', spend: 340000, count: 67, avgValue: 5075, growth: 15 },
    { category: 'Services', spend: 480000, count: 45, avgValue: 10667, growth: -2 },
    { category: 'IT & Electronics', spend: 290000, count: 23, avgValue: 12609, growth: 20 },
  ];

  const vendorAnalysis = [
    { vendor: 'ABC Engineering', spend: 1250000, orders: 45, avgLeadTime: 5, priceVariance: -2 },
    { vendor: 'ChemCorp', spend: 850000, orders: 32, avgLeadTime: 7, priceVariance: 3 },
    { vendor: 'SafetyFirst', spend: 450000, orders: 28, avgLeadTime: 3, priceVariance: -1 },
    { vendor: 'Industrial Supply', spend: 680000, orders: 38, avgLeadTime: 6, priceVariance: 5 },
    { vendor: 'TechPro Solutions', spend: 320000, orders: 15, avgLeadTime: 10, priceVariance: -3 },
  ];

  const priceVariance = [
    { item: 'Sulfuric Acid', budgeted: 125, actual: 132, variance: 5.6 },
    { item: 'Mill Bearings', budgeted: 45000, actual: 43500, variance: -3.3 },
    { item: 'Safety Helmets', budgeted: 850, actual: 920, variance: 8.2 },
    { item: 'Pump Seals', budgeted: 12000, actual: 11500, variance: -4.2 },
    { item: 'Filter Elements', budgeted: 2500, actual: 2650, variance: 6.0 },
  ];

  const leadTimeAnalysis = [
    { category: 'Raw Materials', avgDays: 7, minDays: 3, maxDays: 15 },
    { category: 'Spare Parts', avgDays: 12, minDays: 5, maxDays: 25 },
    { category: 'Chemicals', avgDays: 5, minDays: 2, maxDays: 10 },
    { category: 'Safety Equipment', avgDays: 4, minDays: 2, maxDays: 8 },
    { category: 'Services', avgDays: 3, minDays: 1, maxDays: 7 },
  ];

  const savingsOpportunities = [
    { area: 'Volume Consolidation', potential: 125000, effort: 'Low', impact: 'High' },
    { area: 'Contract Negotiation', potential: 85000, effort: 'Medium', impact: 'High' },
    { area: 'Alternative Sourcing', potential: 65000, effort: 'High', impact: 'Medium' },
    { area: 'Process Optimization', potential: 45000, effort: 'Low', impact: 'Medium' },
    { area: 'Inventory Management', potential: 55000, effort: 'Medium', impact: 'Medium' },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Select defaultValue="ytd">
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mtd">Month to Date</SelectItem>
              <SelectItem value="qtd">Quarter to Date</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Spend YTD</p>
                <p className="text-2xl font-bold text-white">₹3.84Cr</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-500 text-sm">8.5% vs last year</span>
                </div>
              </div>
              <DollarSign className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Cost Savings</p>
                <p className="text-2xl font-bold text-white">₹45.2L</p>
                <Progress value={75} className="mt-2" />
                <p className="text-gray-400 text-xs mt-1">75% of target</p>
              </div>
              <TrendingDown className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Purchase Orders</p>
                <p className="text-2xl font-bold text-white">1,234</p>
                <p className="text-gray-400 text-sm mt-1">Avg value: ₹3.1L</p>
              </div>
              <Package className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Vendors</p>
                <p className="text-2xl font-bold text-white">68</p>
                <p className="text-gray-400 text-sm mt-1">From 142 total</p>
              </div>
              <Users className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spend Analysis */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Spend Analysis - Actual vs Budget vs Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={yearlySpend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                formatter={(value) => `₹${value}L`}
              />
              <Legend />
              <Area type="monotone" dataKey="budget" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Budget" />
              <Area type="monotone" dataKey="forecast" stackId="2" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} name="Forecast" />
              <Area type="monotone" dataKey="actual" stackId="3" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Actual" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs defaultValue="category" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="category">Category Analysis</TabsTrigger>
          <TabsTrigger value="vendor">Vendor Analysis</TabsTrigger>
          <TabsTrigger value="price">Price Analysis</TabsTrigger>
          <TabsTrigger value="savings">Savings Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="category">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Spend by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryAnalysis}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="spend"
                    >
                      {categoryAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      formatter={(value) => `₹${(value as number / 100000).toFixed(1)}L`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryAnalysis.map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-gray-300 text-sm">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-medium">₹{(item.spend / 100000).toFixed(1)}L</span>
                        <span className={`ml-2 text-sm ${item.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {item.growth > 0 ? '+' : ''}{item.growth}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Category Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryAnalysis.map((cat) => (
                    <div key={cat.category} className="p-3 bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{cat.category}</span>
                        <Badge className={cat.growth > 0 ? 'bg-green-600' : 'bg-red-600'}>
                          {cat.growth > 0 ? '+' : ''}{cat.growth}% YoY
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400">Orders</p>
                          <p className="text-gray-300">{cat.count}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Avg Value</p>
                          <p className="text-gray-300">₹{cat.avgValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Total Spend</p>
                          <p className="text-gray-300">₹{(cat.spend / 100000).toFixed(1)}L</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Lead Time Analysis by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leadTimeAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    formatter={(value) => `${value} days`}
                  />
                  <Legend />
                  <Bar dataKey="minDays" fill="#10B981" name="Min Days" />
                  <Bar dataKey="avgDays" fill="#3B82F6" name="Avg Days" />
                  <Bar dataKey="maxDays" fill="#EF4444" name="Max Days" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendor">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Top Vendor Spend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vendorAnalysis} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9CA3AF" />
                    <YAxis dataKey="vendor" type="category" stroke="#9CA3AF" width={120} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      formatter={(value) => `₹${(value as number / 100000).toFixed(1)}L`}
                    />
                    <Bar dataKey="spend" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400">Vendor</th>
                        <th className="text-left py-3 px-4 text-gray-400">Total Spend</th>
                        <th className="text-left py-3 px-4 text-gray-400">Orders</th>
                        <th className="text-left py-3 px-4 text-gray-400">Avg Lead Time</th>
                        <th className="text-left py-3 px-4 text-gray-400">Price Variance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorAnalysis.map((vendor) => (
                        <tr key={vendor.vendor} className="border-b border-gray-700">
                          <td className="py-3 px-4 text-white">{vendor.vendor}</td>
                          <td className="py-3 px-4 text-gray-300">₹{(vendor.spend / 100000).toFixed(1)}L</td>
                          <td className="py-3 px-4 text-gray-300">{vendor.orders}</td>
                          <td className="py-3 px-4 text-gray-300">{vendor.avgLeadTime} days</td>
                          <td className="py-3 px-4">
                            <span className={vendor.priceVariance > 0 ? 'text-red-500' : 'text-green-500'}>
                              {vendor.priceVariance > 0 ? '+' : ''}{vendor.priceVariance}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="price">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Price Variance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {priceVariance.map((item) => (
                    <div key={item.item} className="p-3 bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{item.item}</span>
                        <Badge className={item.variance > 0 ? 'bg-red-600' : 'bg-green-600'}>
                          {item.variance > 0 ? '+' : ''}{item.variance}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-gray-400">Budgeted</p>
                          <p className="text-gray-300">₹{item.budgeted.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Actual</p>
                          <p className="text-gray-300">₹{item.actual.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Difference</p>
                          <p className={item.variance > 0 ? 'text-red-500' : 'text-green-500'}>
                            {item.variance > 0 ? '+' : ''}₹{Math.abs(item.actual - item.budgeted).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Price Trend Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-900 rounded-lg">
                    <h4 className="text-white font-medium mb-3">Categories with Price Increases</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Chemicals</span>
                        <span className="text-red-500">+6.5%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Safety Equipment</span>
                        <span className="text-red-500">+4.2%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">IT & Electronics</span>
                        <span className="text-red-500">+3.8%</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-900 rounded-lg">
                    <h4 className="text-white font-medium mb-3">Categories with Price Decreases</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Raw Materials</span>
                        <span className="text-green-500">-2.3%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Spare Parts</span>
                        <span className="text-green-500">-1.8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="savings">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Cost Savings Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {savingsOpportunities.map((opp) => (
                    <div key={opp.area} className="p-4 bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{opp.area}</span>
                        <span className="text-green-500 font-bold">₹{(opp.potential / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Effort:</span>
                          <Badge 
                            className={
                              opp.effort === 'Low' ? 'bg-green-600' :
                              opp.effort === 'Medium' ? 'bg-yellow-600' :
                              'bg-red-600'
                            }
                          >
                            {opp.effort}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Impact:</span>
                          <Badge 
                            className={
                              opp.impact === 'High' ? 'bg-purple-600' :
                              'bg-blue-600'
                            }
                          >
                            {opp.impact}
                          </Badge>
                        </div>
                      </div>
                      <Progress 
                        value={(opp.potential / 125000) * 100} 
                        className="mt-3" 
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-900 rounded-lg">
                    <h4 className="text-white font-medium mb-3">Total Savings Potential</h4>
                    <p className="text-3xl font-bold text-green-500">₹3.75L</p>
                    <p className="text-gray-400 text-sm mt-1">Across all opportunities</p>
                  </div>

                  <div className="p-4 bg-gray-900 rounded-lg">
                    <h4 className="text-white font-medium mb-3">Quick Wins (Low Effort, High Impact)</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Consolidate orders for volume discounts</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Optimize reorder points to reduce rush orders</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Standardize specifications across units</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-900/20 border border-blue-900 rounded-lg">
                    <h4 className="text-blue-400 font-medium mb-2">Recommendation</h4>
                    <p className="text-gray-300 text-sm">
                      Focus on volume consolidation and contract negotiations first. These offer the highest savings potential with minimal implementation effort.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}