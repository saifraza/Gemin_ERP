'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BusinessUnitSelector } from './business-unit-selector';
import { LogOut } from 'lucide-react';

interface TopHeaderProps {
  companyName?: string;
  companyCode?: string;
  erpVersion?: string;
  location?: string;
  userName?: string;
  userRole?: string;
  userId?: string;
}

export function TopHeader({
  companyName = "ACME CORPORATION",
  companyCode = "🏢",
  erpVersion = "v3.2.4",
  location = "HQ-Main",
  userName = "Sarah Johnson",
  userRole = "Operations Manager",
  userId = "SJ2847"
}: TopHeaderProps) {
  const router = useRouter();
  const [serverStatus, setServerStatus] = useState({ server: 'PROD-01', responseTime: 87 });
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize on client side only
    setLastSync(new Date());
    
    // Update last sync time every second
    const interval = setInterval(() => {
      setLastSync(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
  
  const handleLogout = () => {
    router.push('/auth/logout');
  };

  return (
    <div className="top-header">
      <div className="flex items-center gap-5">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => router.push('/dashboard')}
          title="Go to Dashboard"
        >
          <span className="text-lg">{companyCode}</span>
          <span className="font-semibold text-base">{companyName}</span>
        </div>
        <div className="text-xs opacity-80">
          ERP System {erpVersion} | Location: {location}
        </div>
      </div>
      
      <div className="flex items-center gap-8 text-xs">
        <BusinessUnitSelector />
        <div>Server: {serverStatus.server} | Response: {serverStatus.responseTime}ms</div>
        <div>Last Sync: {lastSync ? lastSync.toTimeString().slice(0, 8) : '--:--:--'}</div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-[11px] opacity-80">{userRole}</div>
          <div className="text-sm">{userName} ({userId})</div>
        </div>
        <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center font-semibold text-sm">
          {userInitials}
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 hover:bg-slate-700 rounded transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}