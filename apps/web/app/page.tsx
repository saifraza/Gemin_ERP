'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWebSocket } from '@/hooks/use-websocket';
import { useMCP } from '@/hooks/use-mcp';
import { FactoryDashboard } from '@/components/factory-dashboard';
import { AIAssistant } from '@/components/ai-assistant';
import { VoiceCommand } from '@/components/voice-command';
import { Activity, Brain, Mic, Zap, Factory, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const { isConnected, subscribe } = useWebSocket();
  const { askAI } = useMCP();
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    // Subscribe to real-time factory events
    const unsubscribe = subscribe('factory:metrics', (data) => {
      setMetrics(data);
    });

    // Get initial factory status
    askAI('Get current factory status for all divisions', { tool: 'factory_status' })
      .then(setMetrics)
      .catch((error) => toast.error('Failed to load factory status'));

    return unsubscribe;
  }, [subscribe, askAI]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Factory className="w-10 h-10" />
            Modern ERP Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time factory intelligence powered by AI
          </p>
        </div>
        <div className="flex items-center gap-4">
          <VoiceCommand />
          <AIAssistant />
        </div>
      </div>

      {/* Connection Status */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">
            {isConnected ? 'Connected to factory systems' : 'Connecting...'}
          </span>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Production Rate</p>
              <p className="text-2xl font-bold">450 T/Hr</p>
              <p className="text-xs text-green-500">↑ 5% from yesterday</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">AI Predictions</p>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs">Active forecasts</p>
            </div>
            <Brain className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Energy Output</p>
              <p className="text-2xl font-bold">28 MW</p>
              <p className="text-xs text-green-500">Grid stable</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Efficiency</p>
              <p className="text-2xl font-bold">92.5%</p>
              <p className="text-xs text-blue-500">Above target</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Main Dashboard */}
      <FactoryDashboard metrics={metrics} />

      {/* Keyboard Shortcuts */}
      <div className="text-sm text-muted-foreground text-center">
        Press <kbd className="px-2 py-1 bg-muted rounded">⌘K</kbd> for command palette • 
        <kbd className="px-2 py-1 bg-muted rounded ml-2">?</kbd> for help
      </div>
    </div>
  );
}