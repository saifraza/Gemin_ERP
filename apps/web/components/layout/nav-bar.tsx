'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface NavBarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onModuleSelect?: (module: string | undefined) => void;
}

const modules = [
  { id: 'master-data', name: 'Master Data', icon: '🗄️', moduleKey: 'master-data' },
  { id: 'finance', name: 'Financial Management', icon: '💰', moduleKey: 'financial-management' },
  { id: 'scm', name: 'Supply Chain', icon: '📦', moduleKey: 'supply-chain-management' },
  { id: 'manufacturing', name: 'Manufacturing', icon: '🏭', moduleKey: 'manufacturing' },
  { id: 'hr', name: 'Human Resources', icon: '👥', moduleKey: 'human-resources' },
  { id: 'crm', name: 'Customer Relations', icon: '🤝', moduleKey: 'customer-relationship-management' },
  { id: 'projects', name: 'Project Management', icon: '📋', moduleKey: 'project-management' },
  { id: 'assets', name: 'Asset Management', icon: '🏢', moduleKey: 'asset-management' },
  { id: 'quality', name: 'Quality Management', icon: '✅', moduleKey: 'quality-management' },
  { id: 'analytics', name: 'Analytics & BI', icon: '📈', moduleKey: 'business-intelligence-and-analytics' },
  { id: 'specialized', name: 'Specialized Modules', icon: '🛡️', moduleKey: 'specialized-modules' },
];

const tabs = [
  'Dashboard',
  'Transactions', 
  'Reports',
  'Analytics',
  'Settings'
];

export function NavBar({ activeTab = 'Dashboard', onTabChange, onModuleSelect }: NavBarProps) {
  const [selectedModule, setSelectedModule] = useState(modules[0]);
  const [showModuleSelector, setShowModuleSelector] = useState(false);

  return (
    <div className="nav-bar">
      <div className="relative">
        <div 
          className="module-selector"
          onClick={() => setShowModuleSelector(!showModuleSelector)}
        >
          <span>{selectedModule.icon}</span>
          <span>{selectedModule.name}</span>
          <ChevronDown className="w-4 h-4" />
        </div>
        
        {showModuleSelector && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded shadow-lg py-2 min-w-[250px] max-h-[400px] overflow-y-auto z-50 border border-gray-200">
            <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Select Module
            </div>
            {modules.map((module) => (
              <div
                key={module.id}
                className={`px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-gray-700 transition-colors ${
                  selectedModule.id === module.id ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => {
                  setSelectedModule(module);
                  setShowModuleSelector(false);
                  onModuleSelect?.(module.moduleKey);
                }}
              >
                <span className="text-lg">{module.icon}</span>
                <span className="text-sm font-medium">{module.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`nav-item ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onTabChange?.(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  );
}