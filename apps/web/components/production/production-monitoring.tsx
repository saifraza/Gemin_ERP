'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Thermometer,
  Gauge,
  Zap,
  Droplets
} from 'lucide-react';

export default function ProductionMonitoring() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock real-time data
  const equipmentStatus = [
    { id: 'MILL-01', name: 'Sugar Mill #1', status: 'Running', efficiency: 92, temperature: 85, pressure: 120 },
    { id: 'MILL-02', name: 'Sugar Mill #2', status: 'Running', efficiency: 88, temperature: 82, pressure: 118 },
    { id: 'DIST-01', name: 'Distillery Unit A', status: 'Warning', efficiency: 75, temperature: 95, pressure: 140 },
    { id: 'POWER-01', name: 'Power Gen Unit', status: 'Running', efficiency: 94, temperature: 78, pressure: 110 },
    { id: 'FEED-01', name: 'Feed Processing', status: 'Stopped', efficiency: 0, temperature: 25, pressure: 0 },
  ];

  const productionMetrics = [
    { division: 'Sugar', current: 45.5, target: 50, unit: 'MT/hr' },
    { division: 'Ethanol', current: 2800, target: 3000, unit: 'L/hr' },
    { division: 'Power', current: 4.2, target: 5, unit: 'MW' },
    { division: 'Feed', current: 0, target: 10, unit: 'MT/hr' },
  ];

  const activeAlerts = [
    { id: 1, type: 'warning', message: 'Distillery Unit A temperature above normal range', time: '5 mins ago' },
    { id: 2, type: 'error', message: 'Feed Processing Unit stopped - Manual intervention required', time: '15 mins ago' },
    { id: 3, type: 'info', message: 'Scheduled maintenance for Mill #2 in 2 hours', time: '30 mins ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Real-time Clock */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Real-time Production Monitoring</h2>
        <div className="text-xl font-mono text-gray-300">
          {currentTime.toLocaleString()}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="space-y-3">
        {activeAlerts.map((alert) => (
          <Alert 
            key={alert.id} 
            className={
              alert.type === 'error' ? 'border-red-500 bg-red-900/20' :
              alert.type === 'warning' ? 'border-yellow-500 bg-yellow-900/20' :
              'border-blue-500 bg-blue-900/20'
            }
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex justify-between items-center">
              <span>{alert.message}</span>
              <span className="text-sm text-gray-400">{alert.time}</span>
            </AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Production Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {productionMetrics.map((metric) => (
          <Card key={metric.division} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-white">{metric.division}</h3>
                  <Activity className={`h-5 w-5 ${metric.current > 0 ? 'text-green-500 animate-pulse' : 'text-gray-500'}`} />
                </div>
                <div className="text-2xl font-bold text-white">
                  {metric.current} {metric.unit}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Target: {metric.target} {metric.unit}</span>
                    <span className="text-white">{Math.round((metric.current / metric.target) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(metric.current / metric.target) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Equipment Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Equipment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {equipmentStatus.map((equipment) => (
              <div key={equipment.id} className="p-4 bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      equipment.status === 'Running' ? 'bg-green-500 animate-pulse' :
                      equipment.status === 'Warning' ? 'bg-yellow-500 animate-pulse' :
                      'bg-red-500'
                    }`} />
                    <span className="text-white font-medium">{equipment.name}</span>
                    <Badge 
                      className={
                        equipment.status === 'Running' ? 'bg-green-600' :
                        equipment.status === 'Warning' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }
                    >
                      {equipment.status}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Gauge className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-400">Efficiency</span>
                    </div>
                    <div className="text-xl font-bold text-white">{equipment.efficiency}%</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Thermometer className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-400">Temperature</span>
                    </div>
                    <div className="text-xl font-bold text-white">{equipment.temperature}°C</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Droplets className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-400">Pressure</span>
                    </div>
                    <div className="text-xl font-bold text-white">{equipment.pressure} PSI</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Zap className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-400">Power</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {equipment.status === 'Running' ? '250 kW' : '0 kW'}
                    </div>
                  </div>
                </div>

                {equipment.status === 'Warning' && (
                  <Alert className="mt-3 border-yellow-500 bg-yellow-900/20">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Temperature exceeding normal operating range. Check cooling system.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Production Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Production Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: '14:32:15', event: 'Batch #2024-125 completed', status: 'success' },
                { time: '14:28:42', event: 'Quality check passed for Batch #2024-124', status: 'success' },
                { time: '14:25:10', event: 'Temperature spike detected in Distillery A', status: 'warning' },
                { time: '14:20:33', event: 'Feed Processing Unit stopped', status: 'error' },
                { time: '14:15:22', event: 'New production batch started', status: 'info' },
                { time: '14:10:18', event: 'Maintenance completed on Mill #1', status: 'success' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400 font-mono">{item.time}</span>
                  {item.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {item.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  {item.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                  {item.status === 'info' && <Activity className="h-4 w-4 text-blue-500" />}
                  <span className="text-gray-300">{item.event}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Sugar Purity</span>
                  <span className="text-white font-medium">99.2%</span>
                </div>
                <Progress value={99.2} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Ethanol Concentration</span>
                  <span className="text-white font-medium">99.5%</span>
                </div>
                <Progress value={99.5} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Power Quality Factor</span>
                  <span className="text-white font-medium">0.95</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Feed Protein Content</span>
                  <span className="text-white font-medium">18.5%</span>
                </div>
                <Progress value={92.5} className="h-2" />
              </div>

              <Alert className="mt-4 border-green-500 bg-green-900/20">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All quality parameters within acceptable range
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}