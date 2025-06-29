'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, Package, Clock } from 'lucide-react';

export default function TransportationPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Transportation Management</h1>
          <p className="text-gray-600 mt-1">Plan, execute, and track shipments across your supply chain</p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Truck className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Transportation Management System</h2>
          <p className="text-gray-500 text-center max-w-md mb-6">
            Optimize freight costs, improve delivery performance, and gain real-time visibility 
            into your transportation network.
          </p>
          <div className="flex gap-4">
            <Button variant="outline">
              <MapPin className="w-4 h-4 mr-2" />
              Track Shipments
            </Button>
            <Button>
              <Package className="w-4 h-4 mr-2" />
              Plan Routes
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}