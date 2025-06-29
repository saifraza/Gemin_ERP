'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, GitBranch, Package, Settings } from 'lucide-react';

export default function SupplyPlanningPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Supply Planning</h1>
          <p className="text-gray-600 mt-1">Optimize supply network and distribution planning</p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <GitBranch className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Supply Planning System</h2>
          <p className="text-gray-500 text-center max-w-md mb-6">
            Balance supply and demand across your network with distribution planning, 
            master planning, and available-to-promise (ATP) capabilities.
          </p>
          <div className="flex gap-4">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Plans
            </Button>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Configure Planning
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}