'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useWebSocket } from '@/hooks/use-websocket';

interface SystemStatus {
  sugar: {
    status: 'online' | 'offline' | 'maintenance';
    lastUpdate: string;
  };
  ethanol: {
    status: 'online' | 'offline' | 'maintenance';
    lastUpdate: string;
  };
  power: {
    status: 'online' | 'offline' | 'maintenance';
    lastUpdate: string;
  };
  mcp: {
    status: 'connected' | 'disconnected';
    activeModels: string[];
  };
}

export function RealtimeStatus() {
  const { isConnected, subscribe } = useWebSocket();
  const [status, setStatus] = useState<SystemStatus>({
    sugar: { status: 'offline', lastUpdate: '' },
    ethanol: { status: 'offline', lastUpdate: '' },
    power: { status: 'offline', lastUpdate: '' },
    mcp: { status: 'disconnected', activeModels: [] }
  });

  useEffect(() => {
    const unsubscribe = subscribe('system:status', (data) => {
      setStatus(data);
    });

    return unsubscribe;
  }, [subscribe]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
        return 'bg-green-500';
      case 'maintenance':
        return 'bg-yellow-500';
      case 'offline':
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">System Status</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Sugar Division</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(status.sugar.status)}`} />
            <span className="text-xs capitalize">{status.sugar.status}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Ethanol Division</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(status.ethanol.status)}`} />
            <span className="text-xs capitalize">{status.ethanol.status}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Power Division</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(status.power.status)}`} />
            <span className="text-xs capitalize">{status.power.status}</span>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm">AI System</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status.mcp.status)}`} />
              <span className="text-xs capitalize">{status.mcp.status}</span>
            </div>
          </div>
          {status.mcp.activeModels.length > 0 && (
            <div className="mt-1 text-xs text-muted-foreground">
              Models: {status.mcp.activeModels.join(', ')}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}