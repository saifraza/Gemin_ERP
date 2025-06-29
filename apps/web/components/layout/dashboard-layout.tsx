'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { TopHeader } from '@/components/layout/top-header';
import { NavBar } from '@/components/layout/nav-bar';
import { Sidebar } from '@/components/layout/sidebar';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, companyName } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarItem, setSidebarItem] = useState('dashboard');

  return (
    <div className="h-screen flex flex-col">
      <TopHeader 
        companyName={companyName || 'MSPIL'}
        companyCode="🏭"
        userName={user?.name || 'Guest'}
        userRole={user?.role || 'VIEWER'}
        userId={user?.username || 'guest'}
      />
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeItem={sidebarItem} onItemClick={setSidebarItem} />
        
        <div className="content-area">
          {children}
        </div>
      </div>
      
      <div className="footer">
        <div>© 2024 {companyName || 'MSPIL'} | ERP System v3.2.4</div>
        <div>Last Update: {new Date().toLocaleTimeString()} | User: {user?.username || 'Guest'} | Role: {user?.role || 'N/A'}</div>
      </div>
    </div>
  );
}