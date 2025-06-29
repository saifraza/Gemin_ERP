import React from 'react';
import { KPICard } from './kpi-card';

interface MasterDataOverviewProps {
  companiesCount: number;
  usersCount: number;
  factoriesCount: number;
}

export function MasterDataOverview({ companiesCount, usersCount, factoriesCount }: MasterDataOverviewProps) {
  return (
    <div className="mb-5">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Master Data Overview</h3>
      <div className="grid grid-cols-3 gap-4">
        <KPICard
          label="Companies"
          value={companiesCount.toString()}
          trend={{ direction: 'neutral', value: 'Active entities' }}
        />
        <KPICard
          label="Users"
          value={usersCount.toString()}
          trend={{ direction: 'neutral', value: 'System users' }}
        />
        <KPICard
          label="Business Units"
          value={factoriesCount.toString()}
          trend={{ direction: 'neutral', value: 'Operating units' }}
        />
      </div>
    </div>
  );
}