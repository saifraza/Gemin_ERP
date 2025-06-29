'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Edit, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProductionPlanning() {
  const [date, setDate] = useState<Date>();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const productionPlans = [
    {
      id: 'PP-2024-001',
      product: 'Refined Sugar Grade A',
      plannedQuantity: '1000 MT',
      startDate: '2024-06-10',
      endDate: '2024-06-15',
      status: 'Scheduled',
      priority: 'High',
      assignedTo: 'Production Team A',
      rawMaterial: 'Sugarcane - 12,000 MT',
    },
    {
      id: 'PP-2024-002',
      product: 'Ethanol 99.5%',
      plannedQuantity: '50,000 L',
      startDate: '2024-06-12',
      endDate: '2024-06-14',
      status: 'In Preparation',
      priority: 'Medium',
      assignedTo: 'Distillery Unit',
      rawMaterial: 'Molasses - 150 MT',
    },
    {
      id: 'PP-2024-003',
      product: 'Bagasse-based Power',
      plannedQuantity: '100 MWh',
      startDate: '2024-06-10',
      endDate: '2024-06-17',
      status: 'Active',
      priority: 'High',
      assignedTo: 'Power Plant',
      rawMaterial: 'Bagasse - 500 MT',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Planning Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Input 
            placeholder="Search plans..." 
            className="w-64 bg-gray-800 border-gray-700"
          />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="preparation">In Preparation</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Production Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle>Create New Production Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sugar-a">Refined Sugar Grade A</SelectItem>
                      <SelectItem value="sugar-b">Refined Sugar Grade B</SelectItem>
                      <SelectItem value="ethanol-99">Ethanol 99.5%</SelectItem>
                      <SelectItem value="ethanol-95">Ethanol 95%</SelectItem>
                      <SelectItem value="power">Bagasse Power</SelectItem>
                      <SelectItem value="feed">Cattle Feed Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Planned Quantity</Label>
                  <Input 
                    placeholder="Enter quantity" 
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-gray-800 border-gray-700",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-gray-800 border-gray-700",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="team-a">Production Team A</SelectItem>
                      <SelectItem value="team-b">Production Team B</SelectItem>
                      <SelectItem value="distillery">Distillery Unit</SelectItem>
                      <SelectItem value="power">Power Plant</SelectItem>
                      <SelectItem value="feed">Feed Unit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Raw Material Requirements</Label>
                <Textarea 
                  placeholder="Enter raw material requirements..."
                  className="bg-gray-800 border-gray-700"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  placeholder="Additional notes..."
                  className="bg-gray-800 border-gray-700"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline">Cancel</Button>
                <Button>Create Plan</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Production Calendar View */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Production Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm text-gray-400 font-medium p-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const dayNum = i - 6; // Adjust for start day
              const isCurrentMonth = dayNum > 0 && dayNum <= 30;
              const hasProduction = [5, 10, 12, 15, 20, 25].includes(dayNum);
              
              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-[80px] p-2 border border-gray-700 rounded-lg",
                    isCurrentMonth ? "bg-gray-900" : "bg-gray-950 opacity-50",
                    hasProduction && "border-blue-500"
                  )}
                >
                  {isCurrentMonth && (
                    <>
                      <div className="text-sm text-gray-400">{dayNum}</div>
                      {hasProduction && (
                        <div className="mt-1 space-y-1">
                          <div className="text-xs bg-blue-600 rounded px-1 py-0.5 truncate">
                            Sugar Prod
                          </div>
                          {dayNum === 10 && (
                            <div className="text-xs bg-green-600 rounded px-1 py-0.5 truncate">
                              Ethanol
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Production Plans List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Production Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productionPlans.map((plan) => (
              <div key={plan.id} className="p-4 bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium">{plan.id}</span>
                    <Badge 
                      className={
                        plan.status === 'Active' ? 'bg-green-600' :
                        plan.status === 'Scheduled' ? 'bg-blue-600' :
                        plan.status === 'In Preparation' ? 'bg-yellow-600' :
                        'bg-gray-600'
                      }
                    >
                      {plan.status}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={
                        plan.priority === 'High' ? 'border-red-500 text-red-500' :
                        plan.priority === 'Medium' ? 'border-yellow-500 text-yellow-500' :
                        'border-gray-500 text-gray-500'
                      }
                    >
                      {plan.priority} Priority
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Product</p>
                    <p className="text-white font-medium">{plan.product}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Planned Quantity</p>
                    <p className="text-white font-medium">{plan.plannedQuantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Duration</p>
                    <p className="text-white font-medium">{plan.startDate} - {plan.endDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Assigned To</p>
                    <p className="text-white font-medium">{plan.assignedTo}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <AlertTriangle className="h-4 w-4" />
                    Raw Material: {plan.rawMaterial}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Allocation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Resource Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-900 rounded-lg">
                <h4 className="text-white font-medium mb-3">Equipment Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Mill #1</span>
                    <Badge className="bg-green-600">Available</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Mill #2</span>
                    <Badge className="bg-red-600">In Use</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Distillery Unit A</span>
                    <Badge className="bg-yellow-600">Maintenance</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Power Gen Unit</span>
                    <Badge className="bg-green-600">Available</Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-900 rounded-lg">
                <h4 className="text-white font-medium mb-3">Workforce Allocation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Production Team A</span>
                    <span className="text-white">24/30 workers</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Production Team B</span>
                    <span className="text-white">28/30 workers</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Maintenance Team</span>
                    <span className="text-white">8/10 workers</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Quality Control</span>
                    <span className="text-white">5/5 workers</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-900 rounded-lg">
                <h4 className="text-white font-medium mb-3">Raw Material Stock</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Sugarcane</span>
                    <span className="text-white">45,000 MT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Molasses</span>
                    <span className="text-white">2,500 MT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Bagasse</span>
                    <span className="text-white">8,000 MT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Chemicals</span>
                    <span className="text-white">Sufficient</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}