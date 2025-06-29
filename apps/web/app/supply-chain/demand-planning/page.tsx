'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, Target, Calendar } from 'lucide-react';

export default function DemandPlanningPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Demand Planning & Forecasting</h1>
          <p className="text-gray-600 mt-1">Predict future demand and optimize inventory levels</p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <TrendingUp className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Demand Planning System</h2>
          <p className="text-gray-500 text-center max-w-md mb-6">
            Use advanced forecasting algorithms, collaborative planning, and demand sensing 
            to accurately predict customer demand and optimize inventory.
          </p>
          <div className="flex gap-4">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Forecasts
            </Button>
            <Button>
              <Target className="w-4 h-4 mr-2" />
              Create Forecast
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}