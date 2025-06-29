'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wrench, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export default function MaintenanceDashboard() {
  // Mock data
  const maintenanceTrend = [
    { month: 'Jan', planned: 45, completed: 42, emergency: 8 },
    { month: 'Feb', planned: 50, completed: 48, emergency: 5 },
    { month: 'Mar', planned: 48, completed: 45, emergency: 7 },
    { month: 'Apr', planned: 52, completed: 50, emergency: 4 },
    { month: 'May', planned: 55, completed: 53, emergency: 6 },
    { month: 'Jun', planned: 53, completed: 51, emergency: 3 },
  ];

  const equipmentStatus = [
    { name: 'Operational', value: 85, color: '#10B981' },
    { name: 'Under Maintenance', value: 10, color: '#F59E0B' },
    { name: 'Breakdown', value: 3, color: '#EF4444' },
    { name: 'Standby', value: 2, color: '#6B7280' },
  ];

  const mtbfData = [
    { equipment: 'Sugar Mills', mtbf: 720, target: 800 },
    { equipment: 'Distillery', mtbf: 850, target: 900 },
    { equipment: 'Power Plant', mtbf: 920, target: 1000 },
    { equipment: 'Feed Unit', mtbf: 680, target: 750 },
  ];

  const recentWorkOrders = [
    { id: 'WO-001', equipment: 'Mill #1 Motor', type: 'Preventive', priority: 'Medium', status: 'In Progress', assignee: 'John Doe' },
    { id: 'WO-002', equipment: 'Boiler #2', type: 'Emergency', priority: 'High', status: 'Open', assignee: 'Unassigned' },
    { id: 'WO-003', equipment: 'Distillery Pump', type: 'Corrective', priority: 'High', status: 'In Progress', assignee: 'Mike Smith' },
    { id: 'WO-004', equipment: 'Conveyor Belt', type: 'Preventive', priority: 'Low', status: 'Scheduled', assignee: 'Tom Brown' },
  ];

  const costAnalysis = {
    labor: 125000,
    parts: 85000,
    external: 45000,
    total: 255000,
    budget: 300000,
  };

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      <div className="space-y-3">
        <Alert className="border-red-500 bg-red-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical:</strong> Boiler #2 requires immediate attention - Temperature sensor malfunction detected.
          </AlertDescription>
        </Alert>
        <Alert className="border-yellow-500 bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> Scheduled maintenance for Mill #3 overdue by 2 days.
          </AlertDescription>
        </Alert>
      </div>

      {/* Maintenance Trend */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Maintenance Activity Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={maintenanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Line type="monotone" dataKey="planned" stroke="#3B82F6" strokeWidth={2} name="Planned" />
              <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} name="Completed" />
              <Line type="monotone" dataKey="emergency" stroke="#EF4444" strokeWidth={2} name="Emergency" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Equipment Status */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Equipment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={equipmentStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {equipmentStatus.map((entry, index) => (
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
              {equipmentStatus.map((item) => (
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

        {/* MTBF Analysis */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Mean Time Between Failures (Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mtbfData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="equipment" type="category" stroke="#9CA3AF" width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                />
                <Bar dataKey="mtbf" fill="#3B82F6" name="Actual MTBF" />
                <Bar dataKey="target" fill="#6B7280" name="Target MTBF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Work Orders */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Recent Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentWorkOrders.map((order) => (
              <div key={order.id} className="p-4 bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {order.status === 'Open' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                      {order.status === 'In Progress' && <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />}
                      {order.status === 'Scheduled' && <Clock className="h-5 w-5 text-blue-500" />}
                      <span className="text-white font-medium">{order.id}</span>
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
                </div>
                <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Equipment</p>
                    <p className="text-gray-300">{order.equipment}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <p className="text-gray-300">{order.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Assignee</p>
                    <p className="text-gray-300">{order.assignee}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Maintenance Cost */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Monthly Maintenance Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Budget Utilization</span>
                  <span className="text-white">{Math.round((costAnalysis.total / costAnalysis.budget) * 100)}%</span>
                </div>
                <Progress value={(costAnalysis.total / costAnalysis.budget) * 100} className="h-2" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Labor Cost</span>
                  <span className="text-white">₹{costAnalysis.labor.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Parts & Materials</span>
                  <span className="text-white">₹{costAnalysis.parts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">External Services</span>
                  <span className="text-white">₹{costAnalysis.external.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-700">
                  <span className="text-gray-400">Total Spent</span>
                  <span className="text-white font-bold">₹{costAnalysis.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Budget</span>
                  <span className="text-gray-300">₹{costAnalysis.budget.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Key Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-gray-900 rounded-lg">
                <p className="text-gray-400 text-sm">Preventive vs Reactive</p>
                <p className="text-xl font-bold text-white">75:25</p>
                <p className="text-green-500 text-sm">Good ratio</p>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg">
                <p className="text-gray-400 text-sm">Schedule Compliance</p>
                <p className="text-xl font-bold text-white">92%</p>
                <p className="text-yellow-500 text-sm">Near target</p>
              </div>
              <div className="p-3 bg-gray-900 rounded-lg">
                <p className="text-gray-400 text-sm">First Time Fix Rate</p>
                <p className="text-xl font-bold text-white">88%</p>
                <p className="text-green-500 text-sm">Above average</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Maintenance */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Upcoming Scheduled Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-2 bg-gray-900 rounded text-sm">
                <p className="text-white">Mill #2 - Annual Service</p>
                <p className="text-gray-400">Tomorrow, 9:00 AM</p>
              </div>
              <div className="p-2 bg-gray-900 rounded text-sm">
                <p className="text-white">Boiler #1 - Inspection</p>
                <p className="text-gray-400">Jun 12, 2:00 PM</p>
              </div>
              <div className="p-2 bg-gray-900 rounded text-sm">
                <p className="text-white">Distillery - Filter Change</p>
                <p className="text-gray-400">Jun 15, 10:00 AM</p>
              </div>
              <div className="p-2 bg-gray-900 rounded text-sm">
                <p className="text-white">Power Gen - Oil Change</p>
                <p className="text-gray-400">Jun 18, 3:00 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}