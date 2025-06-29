'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { TopHeader } from '@/components/layout/top-header';
import { NavBar } from '@/components/layout/nav-bar';
import { Toolbar } from '@/components/layout/toolbar';
import { Sidebar } from '@/components/layout/sidebar';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { CommandPalette } from '@/components/command-palette';
import { AIAssistant } from '@/components/ai-assistant';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { MasterDataOverview } from '@/components/dashboard/master-data-overview';
import { usePrefetchMasterData, useMasterDataSummary } from '@/hooks/use-prefetch-data';

export default function DashboardPage() {
  const router = useRouter();
  const { user, companyName, isAuthenticated, currentFactory, canAccessAllFactories } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarItem, setSidebarItem] = useState('operations-overview');
  const [aiOpen, setAiOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Prefetch master data for dashboard
  usePrefetchMasterData();
  const { companiesCount, usersCount, factoriesCount } = useMasterDataSummary();

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token && !isAuthenticated) {
        router.push('/auth/login');
      } else {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [isAuthenticated, router]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleCommand = (commandId: string) => {
    switch (commandId) {
      case 'ai-assistant':
        setAiOpen(!aiOpen);
        break;
      case 'refresh':
        showNotification('Data refreshed successfully');
        break;
      case 'new-transaction':
        showNotification('Opening new transaction form...');
        break;
      case 'export':
        showNotification('Exporting data...');
        break;
      case 'shortcuts':
        setShortcutsOpen(true);
        break;
      default:
        showNotification(`Action: ${commandId}`);
    }
  };


  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

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
      <Toolbar
        onNewTransaction={() => handleCommand('new-transaction')}
        onAIAssistant={() => setAiOpen(!aiOpen)}
        onRefresh={() => handleCommand('refresh')}
        onExport={() => handleCommand('export')}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeItem={sidebarItem} onItemClick={setSidebarItem} />
        
        <div className="content-area">
          <DashboardHeader 
            currentFactory={currentFactory} 
            canAccessAllFactories={canAccessAllFactories()} 
          />
          
          <QuickActions onAction={handleCommand} />
          
          <DashboardContent 
            currentFactory={currentFactory} 
            canAccessAllFactories={canAccessAllFactories} 
          />
          
          <MasterDataOverview 
            companiesCount={companiesCount}
            usersCount={usersCount}
            factoriesCount={factoriesCount}
          />
        </div>
      </div>
      
      <div className="footer">
        <div>© 2024 {companyName || 'MSPIL'} | ERP System v3.2.4</div>
        <div>Last Update: {new Date().toLocaleTimeString()} | User: {user?.username || 'Guest'} | Role: {user?.role || 'N/A'}</div>
      </div>
      
      <CommandPalette onCommand={handleCommand} />
      <AIAssistant isOpen={aiOpen} onClose={() => setAiOpen(false)} />
      <KeyboardShortcuts isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
    </div>
  );
}