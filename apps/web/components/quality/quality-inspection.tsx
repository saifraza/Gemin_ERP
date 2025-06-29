'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ClipboardList, 
  Camera, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  FileText,
  Upload,
  Clock
} from 'lucide-react';

export default function QualityInspection() {
  const [selectedInspection, setSelectedInspection] = useState<any>(null);

  const inspectionSchedule = [
    { id: 'INS-001', area: 'Sugar Mill Line 1', type: 'Routine', scheduled: '2:00 PM', inspector: 'John Doe', status: 'Pending' },
    { id: 'INS-002', area: 'Distillery Unit A', type: 'Safety', scheduled: '3:00 PM', inspector: 'Jane Smith', status: 'Pending' },
    { id: 'INS-003', area: 'Power Plant', type: 'Compliance', scheduled: '4:00 PM', inspector: 'Mike Johnson', status: 'Pending' },
    { id: 'INS-004', area: 'Feed Processing', type: 'Quality', scheduled: '5:00 PM', inspector: 'Sarah Williams', status: 'Pending' },
  ];

  const ongoingInspections = [
    { id: 'INS-005', area: 'Sugar Packaging', type: 'Quality', inspector: 'Tom Brown', startTime: '1:00 PM', progress: 60 },
    { id: 'INS-006', area: 'Ethanol Storage', type: 'Safety', inspector: 'Lisa Davis', startTime: '1:30 PM', progress: 40 },
  ];

  const completedInspections = [
    { id: 'INS-007', area: 'Sugar Mill Line 2', result: 'Passed', issues: 0, completedTime: '12:30 PM' },
    { id: 'INS-008', area: 'Boiler Room', result: 'Failed', issues: 3, completedTime: '11:45 AM' },
    { id: 'INS-009', area: 'Raw Material Storage', result: 'Passed with Observations', issues: 2, completedTime: '10:30 AM' },
  ];

  const inspectionChecklist = {
    equipment: [
      'Equipment cleanliness and sanitation',
      'Proper functioning of safety devices',
      'No visible damage or wear',
      'Calibration status up to date',
      'Maintenance records available',
    ],
    process: [
      'Following standard operating procedures',
      'Proper personal protective equipment usage',
      'Temperature and pressure within range',
      'No cross-contamination risks',
      'Proper documentation maintained',
    ],
    product: [
      'Product meets visual specifications',
      'Packaging integrity maintained',
      'Correct labeling and marking',
      'No foreign material contamination',
      'Storage conditions appropriate',
    ],
    safety: [
      'Emergency exits clear and accessible',
      'Fire safety equipment in place',
      'First aid supplies available',
      'Safety signage visible',
      'No slip/trip hazards present',
    ],
  };

  return (
    <div className="space-y-6">
      {/* Inspection Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Quality Inspections</h3>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Start New Inspection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle>New Quality Inspection</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Inspection Area</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sugar-mill">Sugar Mill</SelectItem>
                      <SelectItem value="distillery">Distillery</SelectItem>
                      <SelectItem value="power-plant">Power Plant</SelectItem>
                      <SelectItem value="feed-unit">Feed Unit</SelectItem>
                      <SelectItem value="packaging">Packaging Area</SelectItem>
                      <SelectItem value="storage">Storage Areas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Inspection Type</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine Inspection</SelectItem>
                      <SelectItem value="quality">Quality Check</SelectItem>
                      <SelectItem value="safety">Safety Inspection</SelectItem>
                      <SelectItem value="compliance">Compliance Audit</SelectItem>
                      <SelectItem value="incident">Incident Investigation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Inspection Checklist */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Inspection Checklist</h4>
                {Object.entries(inspectionChecklist).map(([category, items]) => (
                  <Card key={category} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-sm capitalize">{category} Inspection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {items.map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <Checkbox className="mt-1" />
                            <div className="flex-1">
                              <Label className="text-gray-300">{item}</Label>
                              <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 text-sm">
                                  <input type="radio" name={`${category}-${index}`} className="text-green-500" />
                                  <span className="text-green-500">Pass</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                  <input type="radio" name={`${category}-${index}`} className="text-red-500" />
                                  <span className="text-red-500">Fail</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                  <input type="radio" name={`${category}-${index}`} className="text-yellow-500" />
                                  <span className="text-yellow-500">N/A</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Observations / Issues Found</Label>
                  <Textarea 
                    placeholder="Describe any issues or observations..."
                    className="bg-gray-800 border-gray-700"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attach Photos</Label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-400 mb-2">Upload inspection photos</p>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Inspector Name</Label>
                    <Input 
                      placeholder="Enter inspector name" 
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Inspection Date & Time</Label>
                    <Input 
                      type="datetime-local" 
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Save Draft</Button>
                <Button>Complete Inspection</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inspection Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Today's Inspections</h4>
              <ClipboardList className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Scheduled</span>
                <span className="text-white">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Completed</span>
                <span className="text-white">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">In Progress</span>
                <span className="text-white">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pending</span>
                <span className="text-white">1</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Issues Found</h4>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Critical</span>
                <span className="text-red-500">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Major</span>
                <span className="text-orange-500">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Minor</span>
                <span className="text-yellow-500">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Observations</span>
                <span className="text-blue-500">8</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Compliance Rate</h4>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">94.5%</div>
              <div className="text-sm text-gray-400">This Month</div>
              <div className="mt-4 flex justify-around text-sm">
                <div>
                  <p className="text-gray-400">Passed</p>
                  <p className="text-green-500 font-medium">85</p>
                </div>
                <div>
                  <p className="text-gray-400">Failed</p>
                  <p className="text-red-500 font-medium">5</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Inspections */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Today's Inspection Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inspectionSchedule.map((inspection) => (
              <div key={inspection.id} className="p-4 bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">{inspection.area}</p>
                      <p className="text-gray-400 text-sm">{inspection.type} Inspection</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-white">{inspection.scheduled}</p>
                      <p className="text-gray-400 text-sm">{inspection.inspector}</p>
                    </div>
                    <Badge className="bg-yellow-600">Pending</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Inspection Results */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Recent Inspection Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {completedInspections.map((inspection) => (
              <div key={inspection.id} className="p-4 bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {inspection.result === 'Passed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {inspection.result === 'Failed' && <XCircle className="h-5 w-5 text-red-500" />}
                    {inspection.result === 'Passed with Observations' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                    <div>
                      <p className="text-white font-medium">{inspection.area}</p>
                      <p className="text-gray-400 text-sm">{inspection.issues} issues found</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{inspection.completedTime}</span>
                    <Badge 
                      className={
                        inspection.result === 'Passed' ? 'bg-green-600' :
                        inspection.result === 'Failed' ? 'bg-red-600' :
                        'bg-yellow-600'
                      }
                    >
                      {inspection.result}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues Alert */}
      <Alert className="border-red-500 bg-red-900/20">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Critical Issue:</strong> Boiler Room failed safety inspection. Immediate corrective action required. Work order #WO-2024-089 has been generated.
        </AlertDescription>
      </Alert>
    </div>
  );
}