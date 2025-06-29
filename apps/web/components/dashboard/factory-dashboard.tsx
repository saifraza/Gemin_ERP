'use client';

import { useEffect, useState } from 'react';
import { KPICard } from './kpi-card';
import { DataTable } from './data-table';
import { useFactoryApi } from '@/lib/factory-api';
import { useAuthStore } from '@/stores/auth';

export function FactoryDashboard() {
  const api = useFactoryApi();
  const { currentFactory, allowedFactories } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentFactoryDetails = allowedFactories.find(f => f.id === currentFactory);

  useEffect(() => {
    loadDashboardData();
  }, [currentFactory]);

  const loadDashboardData = async () => {
    try {
      // TODO: Implement finance dashboard endpoint
      // const data = await api.get('/api/finance/dashboard');
      // setDashboardData(data);
      
      // For now, use mock data
      setDashboardData({
        kpis: {
          revenue: 12500000, // ₹125L
        }
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading factory dashboard...</div>;
  }

  // Mock production data for factory
  const productionData = [
    { product: 'Sugar', target: 150, actual: 142, variance: -5.3, unit: 'MT' },
    { product: 'Ethanol', target: 50000, actual: 52000, variance: 4.0, unit: 'L' },
    { product: 'Power', target: 25, actual: 24.5, variance: -2.0, unit: 'MW' },
    { product: 'Feed', target: 80, actual: 85, variance: 6.25, unit: 'MT' },
  ];

  const productionColumns = [
    { key: 'product', label: 'Product' },
    { key: 'target', label: 'Daily Target' },
    { key: 'actual', label: 'Actual Production' },
    { 
      key: 'variance', 
      label: 'Variance %',
      render: (value: number) => (
        <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}%
        </span>
      )
    },
    { key: 'unit', label: 'Unit' },
  ];

  // Mock equipment status
  const equipmentStatus = [
    { name: 'Mill #1', status: 'Operational', efficiency: 94.5, lastMaintenance: '5 days ago' },
    { name: 'Mill #2', status: 'Operational', efficiency: 92.3, lastMaintenance: '12 days ago' },
    { name: 'Boiler #1', status: 'Maintenance', efficiency: 0, lastMaintenance: 'In progress' },
    { name: 'Turbine #1', status: 'Operational', efficiency: 89.7, lastMaintenance: '20 days ago' },
  ];

  const equipmentColumns = [
    { key: 'name', label: 'Equipment' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <span className={`status-badge ${value === 'Operational' ? 'active' : 'inactive'}`}>
          {value}
        </span>
      )
    },
    { 
      key: 'efficiency', 
      label: 'Efficiency %',
      render: (value: number) => value > 0 ? `${value}%` : '-'
    },
    { key: 'lastMaintenance', label: 'Last Maintenance' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {currentFactoryDetails?.name || 'Factory'} Dashboard
        </h2>
        
        {/* Factory KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            label="Today's Revenue"
            value={`₹${((dashboardData?.kpis?.revenue || 0) / 100000).toFixed(2)}L`}
            trend={{ direction: 'up', value: 'On track' }}
            variant="success"
          />
          <KPICard
            label="Production Efficiency"
            value="91.8%"
            trend={{ direction: 'up', value: '2.3% improvement' }}
          />
          <KPICard
            label="Cane Crushed Today"
            value="4,250 MT"
            trend={{ direction: 'neutral', value: 'Target: 4,500 MT' }}
            variant="warning"
          />
          <KPICard
            label="Safety Score"
            value="98.5"
            trend={{ direction: 'up', value: '15 days accident-free' }}
          />
        </div>

        {/* Production Summary */}
        <DataTable
          title="Today's Production Summary"
          columns={productionColumns}
          data={productionData}
          actions={
            <button className="btn">View Details</button>
          }
        />

        {/* Equipment and Operations */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <DataTable
            title="Equipment Status"
            columns={equipmentColumns}
            data={equipmentStatus}
            actions={
              <button className="btn">Maintenance Schedule</button>
            }
          />

          <div className="data-panel">
            <h3 className="text-lg font-semibold mb-4">Shift Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Morning Shift (6 AM - 2 PM)</span>
                  <span className="font-medium">95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded h-2">
                  <div className="bg-green-600 h-2 rounded" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Afternoon Shift (2 PM - 10 PM)</span>
                  <span className="font-medium">88%</span>
                </div>
                <div className="w-full bg-gray-200 rounded h-2">
                  <div className="bg-yellow-600 h-2 rounded" style={{ width: '88%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Night Shift (10 PM - 6 AM)</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded h-2">
                  <div className="bg-green-600 h-2 rounded" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="data-panel mt-6">
          <h3 className="text-lg font-semibold mb-4">Quality Metrics - Last 24 Hours</h3>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <div className="text-2xl font-bold">45.2</div>
              <div className="text-sm text-gray-600">Sugar ICUMSA</div>
              <div className="text-xs text-green-600">Within spec</div>
            </div>
            <div>
              <div className="text-2xl font-bold">99.8%</div>
              <div className="text-sm text-gray-600">Ethanol Purity</div>
              <div className="text-xs text-green-600">Above target</div>
            </div>
            <div>
              <div className="text-2xl font-bold">11.2%</div>
              <div className="text-sm text-gray-600">Sugar Recovery</div>
              <div className="text-xs text-yellow-600">Slightly below</div>
            </div>
            <div>
              <div className="text-2xl font-bold">86.5%</div>
              <div className="text-sm text-gray-600">Fermentation Eff.</div>
              <div className="text-xs text-green-600">On target</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}