'use client';

import { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { TopHeader } from '@/components/layout/top-header';
import { NavBar } from '@/components/layout/nav-bar';
import { Sidebar } from '@/components/layout/sidebar';
import { PageAssistant } from '@/components/ai/page-assistant';
import { useState, useEffect } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  selectedModule?: string;
  aiAssistantData?: any; // Page-specific data for AI assistant
}

export function DashboardLayout({ children, selectedModule: propSelectedModule, aiAssistantData }: DashboardLayoutProps) {
  const { user, companyName } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarItem, setSidebarItem] = useState('dashboard');
  const [selectedModule, setSelectedModule] = useState(propSelectedModule);
  const pathname = usePathname();
  
  useEffect(() => {
    // Detect module from pathname
    if (pathname.includes('/master-data')) {
      setSelectedModule('master-data');
    } else if (pathname.includes('/finance')) {
      setSelectedModule('financial-management');
    } else if (pathname.includes('/scm')) {
      setSelectedModule('supply-chain-management');
    } else if (pathname.includes('/hr')) {
      setSelectedModule('human-resources');
    } else if (pathname.includes('/manufacturing')) {
      setSelectedModule('manufacturing');
    } else if (pathname.includes('/crm')) {
      setSelectedModule('customer-relationship-management');
    } else if (pathname.includes('/projects')) {
      setSelectedModule('project-management');
    } else if (pathname.includes('/assets')) {
      setSelectedModule('asset-management');
    } else if (pathname.includes('/quality')) {
      setSelectedModule('quality-management');
    } else if (pathname.includes('/analytics')) {
      setSelectedModule('business-intelligence-and-analytics');
    } else if (pathname.includes('/specialized')) {
      setSelectedModule('specialized-modules');
    } else if (pathname.includes('/system')) {
      setSelectedModule('system');
    } else if (pathname.includes('/dashboard') || pathname === '/') {
      setSelectedModule(undefined);
    }
  }, [pathname]);

  return (
    <div className="h-screen flex flex-col">
      <TopHeader 
        companyName={companyName || 'MSPIL'}
        companyCode="🏭"
        userName={user?.name || 'Guest'}
        userRole={user?.role || 'VIEWER'}
        userId={user?.username || 'guest'}
      />
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} onModuleSelect={setSelectedModule} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeItem={sidebarItem} onItemClick={setSidebarItem} selectedModule={selectedModule} />
        
        <div className="content-area">
          {children}
        </div>
      </div>
      
      <div className="footer">
        <div>© 2024 {companyName || 'MSPIL'} | ERP System v3.2.4</div>
        <div>Last Update: {new Date().toLocaleTimeString()} | User: {user?.username || 'Guest'} | Role: {user?.role || 'N/A'}</div>
      </div>
      
      {/* Page-specific AI Assistant */}
      <PageAssistant customData={aiAssistantData} />
    </div>
  );
}