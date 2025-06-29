'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Warehouse, Package, Truck, BarChart3 } from 'lucide-react';

export default function WarehousePage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
          <p className="text-gray-600 mt-1">Manage receiving, storage, picking, and shipping operations</p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Warehouse className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Warehouse Management System</h2>
          <p className="text-gray-500 text-center max-w-md mb-6">
            Optimize warehouse operations with advanced WMS features including receiving, put-away, 
            picking, packing, and shipping management.
          </p>
          <div className="flex gap-4">
            <Button variant="outline">
              <Package className="w-4 h-4 mr-2" />
              View Inventory
            </Button>
            <Button>
              <Truck className="w-4 h-4 mr-2" />
              Manage Shipments
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}