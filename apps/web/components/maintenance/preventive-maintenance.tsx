'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  FileText,
  TrendingUp
} from 'lucide-react';

export default function PreventiveMaintenance() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Mock data
  const maintenanceSchedule = [
    { 
      id: 'PM-001', 
      equipment: 'Sugar Mill #1', 
      task: 'Quarterly Inspection', 
      frequency: 'Every 3 months', 
      lastDone: '2024-03-15', 
      nextDue: '2024-06-15', 
      daysRemaining: 8,
      status: 'Due Soon'
    },
    { 
      id: 'PM-002', 
      equipment: 'Boiler #1', 
      task: 'Annual Overhaul', 
      frequency: 'Yearly', 
      lastDone: '2023-07-20', 
      nextDue: '2024-07-20', 
      daysRemaining: 43,
      status: 'Scheduled'
    },
    { 
      id: 'PM-003', 
      equipment: 'Distillery Unit A', 
      task: 'Monthly Filter Change', 
      frequency: 'Monthly', 
      lastDone: '2024-05-10', 
      nextDue: '2024-06-10', 
      daysRemaining: 3,
      status: 'Urgent'
    },
    { 
      id: 'PM-004', 
      equipment: 'Power Generator', 
      task: 'Oil Change', 
      frequency: 'Every 500 hours', 
      lastDone: '2024-05-01', 
      nextDue: '2024-06-30', 
      daysRemaining: 23,
      status: 'Scheduled'
    },
  ];

  const maintenanceChecklist = {
    'Sugar Mill': [
      'Check bearing temperature and vibration',
      'Inspect gearbox oil level and condition',
      'Verify alignment of shafts',
      'Clean and inspect mill rollers',
      'Test emergency stop systems',
    ],
    'Boiler': [
      'Inspect water levels and gauges',
      'Check pressure relief valves',
      'Clean burner assemblies',
      'Test safety interlocks',
      'Verify combustion efficiency',
    ],
    'Distillery': [
      'Check pump seals and packing',
      'Inspect column trays and packing',
      'Verify temperature controls',
      'Test level sensors',
      'Clean heat exchangers',
    ],
    'Power Plant': [
      'Check oil levels and quality',
      'Inspect air filters',
      'Test generator protection systems',
      'Verify synchronization equipment',
      'Check cooling system',
    ],
  };

  const complianceMetrics = {
    overall: 92,
    divisions: [
      { name: 'Sugar', compliance: 95 },
      { name: 'Ethanol', compliance: 88 },
      { name: 'Power', compliance: 94 },
      { name: 'Feed', compliance: 90 },
    ],
  };

  const upcomingTasks = [
    { date: '2024-06-08', equipment: 'Mill #2', task: 'Belt Inspection', technician: 'John Doe' },
    { date: '2024-06-09', equipment: 'Cooling Tower', task: 'Water Treatment', technician: 'Jane Smith' },
    { date: '2024-06-10', equipment: 'Distillery', task: 'Filter Change', technician: 'Mike Johnson' },
    { date: '2024-06-11', equipment: 'Boiler #2', task: 'Safety Valve Test', technician: 'Tom Brown' },
    { date: '2024-06-12', equipment: 'Mill #1', task: 'Lubrication', technician: 'Sarah Williams' },
  ];

  return (
    <div className="space-y-6">
      {/* PM Alerts */}
      <div className="space-y-3">
        <Alert className="border-red-500 bg-red-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Urgent:</strong> Distillery Unit A filter change is overdue by 3 days. Schedule immediately.
          </AlertDescription>
        </Alert>
        <Alert className="border-yellow-500 bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Reminder:</strong> Sugar Mill #1 quarterly inspection due in 8 days. Please plan for downtime.
          </AlertDescription>
        </Alert>
      </div>

      {/* PM Calendar and Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Maintenance Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border border-gray-700"
            />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 md:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Preventive Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="p-3 bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{task.equipment} - {task.task}</p>
                      <p className="text-gray-400 text-sm">Assigned to: {task.technician}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">{task.date}</p>
                      <Badge className="bg-blue-600 mt-1">Scheduled</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PM Schedule Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Preventive Maintenance Schedule</CardTitle>
            <Button size="sm" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-400">PM ID</TableHead>
                <TableHead className="text-gray-400">Equipment</TableHead>
                <TableHead className="text-gray-400">Task</TableHead>
                <TableHead className="text-gray-400">Frequency</TableHead>
                <TableHead className="text-gray-400">Last Done</TableHead>
                <TableHead className="text-gray-400">Next Due</TableHead>
                <TableHead className="text-gray-400">Days Remaining</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenanceSchedule.map((schedule) => (
                <TableRow key={schedule.id} className="border-gray-700">
                  <TableCell className="text-white font-medium">{schedule.id}</TableCell>
                  <TableCell className="text-gray-300">{schedule.equipment}</TableCell>
                  <TableCell className="text-gray-300">{schedule.task}</TableCell>
                  <TableCell className="text-gray-300">{schedule.frequency}</TableCell>
                  <TableCell className="text-gray-300">{schedule.lastDone}</TableCell>
                  <TableCell className="text-gray-300">{schedule.nextDue}</TableCell>
                  <TableCell className={
                    schedule.daysRemaining <= 7 ? 'text-red-500 font-medium' : 
                    schedule.daysRemaining <= 14 ? 'text-yellow-500' : 
                    'text-gray-300'
                  }>
                    {schedule.daysRemaining} days
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        schedule.status === 'Urgent' ? 'bg-red-600' :
                        schedule.status === 'Due Soon' ? 'bg-yellow-600' :
                        'bg-green-600'
                      }
                    >
                      {schedule.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Schedule</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PM Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>PM Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-white mb-2">{complianceMetrics.overall}%</div>
              <p className="text-gray-400">Overall Compliance</p>
            </div>
            <div className="space-y-3">
              {complianceMetrics.divisions.map((division) => (
                <div key={division.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">{division.name} Division</span>
                    <span className="text-white">{division.compliance}%</span>
                  </div>
                  <Progress value={division.compliance} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>PM Task Checklist Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Equipment Type</Label>
                <Select defaultValue="sugar-mill">
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sugar-mill">Sugar Mill</SelectItem>
                    <SelectItem value="boiler">Boiler</SelectItem>
                    <SelectItem value="distillery">Distillery</SelectItem>
                    <SelectItem value="power-plant">Power Plant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-white font-medium">Standard Checklist Items:</p>
                <div className="space-y-2">
                  {maintenanceChecklist['Sugar Mill'].map((item, index) => (
                    <label key={index} className="flex items-center gap-2 text-gray-300">
                      <input type="checkbox" className="rounded" />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PM Performance Metrics */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Preventive Maintenance Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-900 rounded-lg text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">PM Tasks Completed</p>
              <p className="text-2xl font-bold text-white">156</p>
              <p className="text-gray-400 text-sm">This Month</p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg text-center">
              <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Avg Completion Time</p>
              <p className="text-2xl font-bold text-white">2.3 hrs</p>
              <p className="text-green-500 text-sm">Within target</p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">On-Time Completion</p>
              <p className="text-2xl font-bold text-white">94%</p>
              <p className="text-gray-400 text-sm">Target: 95%</p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg text-center">
              <Settings className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Equipment Reliability</p>
              <p className="text-2xl font-bold text-white">98.5%</p>
              <p className="text-green-500 text-sm">Excellent</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}