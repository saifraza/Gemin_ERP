import React from 'react';

interface DashboardHeaderProps {
  currentFactory: string;
  canAccessAllFactories: boolean;
}

export function DashboardHeader({ currentFactory, canAccessAllFactories }: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-normal text-gray-800 mb-2">
        {currentFactory === 'all' ? 'Consolidated' : 'Factory'} Operations Dashboard
      </h1>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Home</span>
        <span>›</span>
        <span>Operations</span>
        <span>›</span>
        <span>{currentFactory === 'all' ? 'All Factories' : 'Factory Dashboard'}</span>
      </div>
    </div>
  );
}