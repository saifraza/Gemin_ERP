'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface NavBarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const modules = [
  { id: 'operations', name: 'Operations Module', icon: '📦' },
  { id: 'sales', name: 'Sales & Distribution', icon: '💼' },
  { id: 'finance', name: 'Finance Module', icon: '💰' },
  { id: 'hr', name: 'Human Resources', icon: '👥' },
  { id: 'procurement', name: 'Procurement', icon: '🛒' },
  { id: 'production', name: 'Production', icon: '🏭' },
  { id: 'inventory', name: 'Inventory Management', icon: '📊' },
  { id: 'quality', name: 'Quality Management', icon: '✅' },
  { id: 'maintenance', name: 'Maintenance', icon: '🔧' },
  { id: 'crm', name: 'Customer Relations', icon: '🤝' },
  { id: 'analytics', name: 'Analytics & BI', icon: '📈' },
  { id: 'assets', name: 'Asset Management', icon: '🏢' },
];

const tabs = [
  'Dashboard',
  'Transactions', 
  'Reports',
  'Analytics',
  'Settings'
];

export function NavBar({ activeTab = 'Dashboard', onTabChange }: NavBarProps) {
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