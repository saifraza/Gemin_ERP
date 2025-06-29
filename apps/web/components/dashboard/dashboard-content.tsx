import React from 'react';
import { HQDashboard } from './hq-dashboard';
import { FactoryDashboard } from './factory-dashboard';
import { AIChat } from '../ai-chat';

interface DashboardContentProps {
  currentFactory: string;
  canAccessAllFactories: () => boolean;
}

export function DashboardContent({ currentFactory, canAccessAllFactories }: DashboardContentProps) {
  return (
    <>
      {/* Conditionally render HQ or Factory dashboard */}
      {currentFactory === 'all' && canAccessAllFactories() ? (
        <HQDashboard />
      ) : (
        <FactoryDashboard />
      )}
      
      {/* AI Chat Component */}
      <div className="mt-6">
        <AIChat />
      </div>
    </>
  );
}