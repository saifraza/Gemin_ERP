'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function QualityDashboard() {
  // Mock data
  const qualityTrend = [
    { date: '01 Jun', sugar: 99.2, ethanol: 99.5, power: 98.8, feed: 97.5 },
    { date: '02 Jun', sugar: 99.1, ethanol: 99.6, power: 98.9, feed: 97.8 },
    { date: '03 Jun', sugar: 99.3, ethanol: 99.4, power: 98.7, feed: 97.6 },
    { date: '04 Jun', sugar: 99.2, ethanol: 99.5, power: 98.9, feed: 97.9 },
    { date: '05 Jun', sugar: 99.4, ethanol: 99.7, power: 99.0, feed: 98.0 },
    { date: '06 Jun', sugar: 99.3, ethanol: 99.5, power: 98.8, feed: 97.7 },
    { date: '07 Jun', sugar: 99.5, ethanol: 99.6, power: 98.9, feed: 97.8 },
  ];

  const qualityParameters = [
    { parameter: 'Purity', sugar: 99, ethanol: 98, power: 95, feed: 90, fullMark: 100 },
    { parameter: 'Consistency', sugar: 95, ethanol: 97, power: 93, feed: 92, fullMark: 100 },
    { parameter: 'Standards', sugar: 100, ethanol: 100, power: 98, feed: 95, fullMark: 100 },
    { parameter: 'Safety', sugar: 100, ethanol: 99, power: 100, feed: 98, fullMark: 100 },
    { parameter: 'Efficiency', sugar: 92, ethanol: 94, power: 96, feed: 88, fullMark: 100 },
  ];

  const recentTests = [
    { id: 'QT-001', sample: 'Sugar Batch #125', test: 'Purity Test', result: '99.2%', status: 'passed', time: '10:30 AM' },
    { id: 'QT-002', sample: 'Ethanol Tank A', test: 'Concentration', result: '99.5%', status: 'passed', time: '10:45 AM' },
    { id: 'QT-003', sample: 'Power Output', test: 'Quality Factor', result: '0.92', status: 'warning', time: '11:00 AM' },
    { id: 'QT-004', sample: 'Feed Sample #45', test: 'Protein Content', result: '17.8%', status: 'failed', time: '11:15 AM' },
    { id: 'QT-005', sample: 'Sugar Batch #126', test: 'Moisture Content', result: '0.04%', status: 'passed', time: '11:30 AM' },
  ];

  const defectRate = [
    { division: 'Sugar', defects: 0.8 },
    { division: 'Ethanol', defects: 0.5 },
    { division: 'Power', defects: 1.2 },
    { division: 'Feed', defects: 2.1 },
  ];

  return (
    <div className="space-y-6">
      {/* Quality Alerts */}
      <div className="space-y-3">
        <Alert className="border-yellow-500 bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Feed protein content below target in batch #45. Immediate adjustment required.
          </AlertDescription>
        </Alert>
      </div>

      {/* Quality Score Trend */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Quality Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={qualityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[95, 100]} />
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
        {/* Quality Parameters Radar */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Quality Parameters by Division</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={qualityParameters}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="parameter" stroke="#9CA3AF" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
                <Radar name="Sugar" dataKey="sugar" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                <Radar name="Ethanol" dataKey="ethanol" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                <Radar name="Power" dataKey="power" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                <Radar name="Feed" dataKey="feed" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Defect Rate */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Defect Rate by Division</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={defectRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="division" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  formatter={(value) => `${value}%`}
                />
                <Bar dataKey="defects" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
            <Alert className="mt-4 border-blue-500 bg-blue-900/20">
              <AlertDescription>
                Target defect rate: &lt;1% for all divisions
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Recent Test Results */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Recent Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTests.map((test) => (
              <div key={test.id} className="p-4 bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {test.status === 'passed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {test.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                      {test.status === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
                      <span className="text-white font-medium">{test.id}</span>
                    </div>
                    <Badge 
                      className={
                        test.status === 'passed' ? 'bg-green-600' :
                        test.status === 'warning' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }
                    >
                      {test.status}
                    </Badge>
                  </div>
                  <span className="text-gray-400 text-sm">{test.time}</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Sample</p>
                    <p className="text-gray-300">{test.sample}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Test Type</p>
                    <p className="text-gray-300">{test.test}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Result</p>
                    <p className="text-gray-300">{test.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h4 className="text-white font-medium mb-3">Sugar Quality</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Purity</span>
                <span className="text-white">99.2%</span>
              </div>
              <Progress value={99.2} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Color (ICUMSA)</span>
                <span className="text-white">45</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h4 className="text-white font-medium mb-3">Ethanol Quality</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Concentration</span>
                <span className="text-white">99.5%</span>
              </div>
              <Progress value={99.5} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Impurities</span>
                <span className="text-white">0.02%</span>
              </div>
              <Progress value={98} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h4 className="text-white font-medium mb-3">Power Quality</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Power Factor</span>
                <span className="text-white">0.95</span>
              </div>
              <Progress value={95} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Frequency</span>
                <span className="text-white">50.0 Hz</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h4 className="text-white font-medium mb-3">Feed Quality</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Protein</span>
                <span className="text-white">18.5%</span>
              </div>
              <Progress value={92.5} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Moisture</span>
                <span className="text-white">11%</span>
              </div>
              <Progress value={89} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}