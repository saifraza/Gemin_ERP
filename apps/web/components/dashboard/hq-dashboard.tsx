'use client';

import { useEffect, useState } from 'react';
import { KPICard } from './kpi-card';
import { DataTable } from './data-table';
import { useFactoryApi } from '@/lib/factory-api';
import { useAuthStore } from '@/stores/auth';

export function HQDashboard() {
  const api = useFactoryApi();
  const { allowedFactories } = useAuthStore();
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const financial = await api.get('/api/finance/dashboard');
      setFinancialData(financial);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading HQ dashboard...</div>;
  }

  // Factory comparison data
  const factoryComparison = financialData?.profitLoss?.factories || [];

  const factoryColumns = [
    { key: 'factoryName', label: 'Factory' },
    { key: 'factoryCode', label: 'Code' },
    { 
      key: 'revenue', 
      label: 'Revenue',
      render: (value: number) => `₹${(value / 100000).toFixed(2)}L`
    },
    { 
      key: 'grossProfit', 
      label: 'Gross Profit',
      render: (value: number) => `₹${(value / 100000).toFixed(2)}L`
    },
    { 
      key: 'netProfit', 
      label: 'Net Profit',
      render: (value: number) => `₹${(value / 100000).toFixed(2)}L`
    },
    {
      key: 'netMargin',
      label: 'Net Margin %',
      render: (_: any, row: any) => `${((row.netProfit / row.revenue) * 100).toFixed(2)}%`
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Consolidated Performance - All Factories</h2>
        
        {/* Consolidated KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            label="Total Revenue"
            value={`₹${((financialData?.kpis?.revenue || 0) / 10000000).toFixed(2)}Cr`}
            trend={{ direction: 'up', value: '12.5% vs last month' }}
            variant="success"
          />
          <KPICard
            label="Net Profit"
            value={`₹${((financialData?.kpis?.netProfit || 0) / 10000000).toFixed(2)}Cr`}
            trend={{ direction: 'up', value: '8.3% increase' }}
          />
          <KPICard
            label="Accounts Receivable"
            value={`₹${((financialData?.kpis?.arTotal || 0) / 10000000).toFixed(2)}Cr`}
            trend={{ direction: 'down', value: '15% reduction' }}
            variant="warning"
          />
          <KPICard
            label="Cash Balance"
            value={`₹${((financialData?.kpis?.cashBalance || 0) / 10000000).toFixed(2)}Cr`}
            trend={{ direction: 'up', value: 'Healthy liquidity' }}
          />
        </div>

        {/* Factory Comparison Table */}
        <DataTable
          title="Factory-wise Performance"
          columns={factoryColumns}
          data={factoryComparison}
          actions={
            <button className="btn btn-primary">Export Report</button>
          }
        />

        {/* Profitability Analysis */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="data-panel">
            <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Sugar Sales</span>
                <span className="font-medium">60%</span>
              </div>
              <div className="flex justify-between">
                <span>Ethanol Sales</span>
                <span className="font-medium">25%</span>
              </div>
              <div className="flex justify-between">
                <span>Power Generation</span>
                <span className="font-medium">10%</span>
              </div>
              <div className="flex justify-between">
                <span>By-products</span>
                <span className="font-medium">5%</span>
              </div>
            </div>
          </div>

          <div className="data-panel">
            <h3 className="text-lg font-semibold mb-4">Top Performing Units</h3>
            <div className="space-y-3">
              {factoryComparison
                .sort((a: any, b: any) => b.netProfit - a.netProfit)
                .slice(0, 3)
                .map((factory: any, index: number) => (
                  <div key={factory.factoryId} className="flex justify-between items-center">
                    <span>
                      <span className="text-lg font-medium mr-2">{index + 1}.</span>
                      {factory.factoryName}
                    </span>
                    <span className="text-green-600 font-medium">
                      ₹{(factory.netProfit / 100000).toFixed(2)}L
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}