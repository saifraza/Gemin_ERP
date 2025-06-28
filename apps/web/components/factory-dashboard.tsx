'use client';

import { Card } from '@/components/ui/card';

interface FactoryDashboardProps {
  metrics: any;
}

export function FactoryDashboard({ metrics }: FactoryDashboardProps) {
  if (!metrics) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          Loading factory data...
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sugar Division</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-medium">{metrics.divisions?.sugar?.status || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Production:</span>
            <span className="font-medium">{metrics.divisions?.sugar?.production?.current || 0} T/Hr</span>
          </div>
          <div className="flex justify-between">
            <span>Efficiency:</span>
            <span className="font-medium">{metrics.divisions?.sugar?.production?.efficiency || 0}%</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ethanol Division</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-medium">{metrics.divisions?.ethanol?.status || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Production:</span>
            <span className="font-medium">{metrics.divisions?.ethanol?.production?.current || 0} L/Day</span>
          </div>
          <div className="flex justify-between">
            <span>Efficiency:</span>
            <span className="font-medium">{metrics.divisions?.ethanol?.production?.efficiency || 0}%</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Power Division</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-medium">{metrics.divisions?.power?.status || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Output:</span>
            <span className="font-medium">{metrics.divisions?.power?.output?.current || 0} MW</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
        <div className="space-y-2">
          {metrics.alerts && metrics.alerts.length > 0 ? (
            metrics.alerts.map((alert: any, index: number) => (
              <div key={index} className="text-sm">
                <span className={`font-medium ${alert.level === 'WARNING' ? 'text-yellow-600' : 'text-blue-600'}`}>
                  {alert.level}:
                </span> {alert.message}
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">No active alerts</div>
          )}
        </div>
      </Card>
    </div>
  );
}