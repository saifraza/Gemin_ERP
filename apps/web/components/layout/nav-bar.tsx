'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

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

// Module-specific navigation tabs
const moduleTabsConfig: Record<string, string[]> = {
  'master-data': ['Overview', 'Companies', 'Users', 'Business Units', 'Import/Export', 'Settings'],
  'financial-management': ['Dashboard', 'General Ledger', 'Accounts', 'Transactions', 'Reports', 'Budget'],
  'supply-chain-management': ['Dashboard', 'Inventory', 'Procurement', 'Warehouse', 'Logistics', 'Analytics'],
  'manufacturing': ['Dashboard', 'Production', 'Shop Floor', 'Quality', 'Planning', 'Reports'],
  'human-resources': ['Dashboard', 'Employees', 'Payroll', 'Time & Attendance', 'Benefits', 'Reports'],
  'customer-relationship-management': ['Dashboard', 'Contacts', 'Opportunities', 'Sales', 'Service', 'Analytics'],
  'project-management': ['Dashboard', 'Projects', 'Resources', 'Timeline', 'Budget', 'Reports'],
  'asset-management': ['Dashboard', 'Assets', 'Maintenance', 'Tracking', 'Lifecycle', 'Reports'],
  'quality-management': ['Dashboard', 'Inspections', 'Non-Conformance', 'CAPA', 'Audits', 'Reports'],
  'business-intelligence-and-analytics': ['Dashboards', 'Reports', 'Data Explorer', 'Visualizations', 'Insights'],
  'specialized-modules': ['Overview', 'Compliance', 'Documents', 'Contracts', 'Energy', 'Settings'],
  'default': ['Dashboard', 'Transactions', 'Reports', 'Analytics', 'Settings']
};

export function NavBar({ activeTab = 'Dashboard', onTabChange, onModuleSelect }: NavBarProps) {
  const pathname = usePathname();
  const [showModuleSelector, setShowModuleSelector] = useState(false);

  // Detect current module from pathname
  const detectCurrentModule = () => {
    if (pathname.includes('/master-data')) return modules.find(m => m.id === 'master-data');
    if (pathname.includes('/finance')) return modules.find(m => m.id === 'finance');
    if (pathname.includes('/scm') || pathname.includes('/supply-chain')) return modules.find(m => m.id === 'scm');
    if (pathname.includes('/manufacturing')) return modules.find(m => m.id === 'manufacturing');
    if (pathname.includes('/hr')) return modules.find(m => m.id === 'hr');
    if (pathname.includes('/crm')) return modules.find(m => m.id === 'crm');
    if (pathname.includes('/project')) return modules.find(m => m.id === 'projects');
    if (pathname.includes('/asset')) return modules.find(m => m.id === 'assets');
    if (pathname.includes('/quality')) return modules.find(m => m.id === 'quality');
    if (pathname.includes('/analytics')) return modules.find(m => m.id === 'analytics');
    if (pathname.includes('/specialized')) return modules.find(m => m.id === 'specialized');
    return modules[0]; // Default to master-data
  };

  const [selectedModule, setSelectedModule] = useState(detectCurrentModule());

  // Update selected module when pathname changes
  useEffect(() => {
    setSelectedModule(detectCurrentModule());
  }, [pathname]);

  // Get tabs for current module
  const currentTabs = moduleTabsConfig[selectedModule?.moduleKey || 'default'] || moduleTabsConfig['default'];

  return (
    <div className="nav-bar">
      <div className="relative">
        <div 
          className="module-selector"
          onClick={() => setShowModuleSelector(!showModuleSelector)}
        >
          <span>{selectedModule?.icon || '📋'}</span>
          <span>{selectedModule?.name || 'Select Module'}</span>
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
                  selectedModule?.id === module.id ? 'bg-blue-50 text-blue-700' : ''
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
      
      {currentTabs.map((tab) => (
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