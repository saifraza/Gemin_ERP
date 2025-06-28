'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { TopHeader } from '@/components/layout/top-header';
import { NavBar } from '@/components/layout/nav-bar';
import { Toolbar } from '@/components/layout/toolbar';
import { Sidebar } from '@/components/layout/sidebar';
import { KPICard } from '@/components/dashboard/kpi-card';
import { DataTable } from '@/components/dashboard/data-table';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { CommandPalette } from '@/components/command-palette';
import { AIAssistant } from '@/components/ai-assistant';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { HQDashboard } from '@/components/dashboard/hq-dashboard';
import { FactoryDashboard } from '@/components/dashboard/factory-dashboard';

// Sample data
const transactionData = [
  {
    id: 'TRX-2024-8471',
    date: '2024-01-15',
    customer: 'Global Tech Solutions',
    type: 'Sales Order',
    amount: '$45,280',
    department: 'Sales',
    status: 'Processing',
    assignedTo: 'Mike Chen',
    priority: 'High'
  },
  {
    id: 'TRX-2024-8472',
    date: '2024-01-15',
    customer: 'Premier Manufacturing',
    type: 'Purchase Order',
    amount: '$32,150',
    department: 'Procurement',
    status: 'Approved',
    assignedTo: 'Lisa Wong',
    priority: 'Normal'
  },
  {
    id: 'TRX-2024-8473',
    date: '2024-01-15',
    customer: 'Apex Logistics',
    type: 'Invoice',
    amount: '$18,750',
    department: 'Finance',
    status: 'Pending',
    assignedTo: 'David Park',
    priority: 'Critical'
  },
  {
    id: 'TRX-2024-8474',
    date: '2024-01-14',
    customer: 'Retail Partners Inc',
    type: 'Sales Order',
    amount: '$67,890',
    department: 'Sales',
    status: 'Shipped',
    assignedTo: 'Emma Davis',
    priority: 'Normal'
  },
  {
    id: 'TRX-2024-8475',
    date: '2024-01-14',
    customer: 'Industrial Supply Co',
    type: 'Return',
    amount: '$5,420',
    department: 'Customer Service',
    status: 'Under Review',
    assignedTo: 'Tom Wilson',
    priority: 'High'
  }
];

const departmentData = [
  { department: 'Sales', efficiency: '94.2%', tasks: 247, completion: '89%' },
  { department: 'Operations', efficiency: '91.8%', tasks: 186, completion: '92%' },
  { department: 'Finance', efficiency: '88.5%', tasks: 142, completion: '87%' },
  { department: 'HR', efficiency: '92.7%', tasks: 98, completion: '95%' },
  { department: 'IT', efficiency: '90.3%', tasks: 173, completion: '88%' },
  { department: 'Procurement', efficiency: '87.9%', tasks: 124, completion: '91%' },
];

const resourceData = [
  { resource: 'Workforce', allocated: 450, used: 412, available: 38, status: 'Optimal' },
  { resource: 'Equipment', allocated: 85, used: 78, available: 7, status: 'High Usage' },
  { resource: 'Vehicles', allocated: 32, used: 28, available: 4, status: 'Available' },
];

const inventoryData = [
  { category: 'Raw Materials', stock: '8,450 units', min: '5,000 units', reorder: '6,000 units', status: 'Sufficient' },
  { category: 'Components', stock: '3,200 units', min: '3,000 units', reorder: '3,500 units', status: 'Low Stock' },
  { category: 'Finished Goods', stock: '12,750 units', min: '8,000 units', reorder: '10,000 units', status: 'Sufficient' },
  { category: 'Packaging', stock: '15,420 units', min: '10,000 units', reorder: '12,000 units', status: 'Sufficient' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, companyName, isAuthenticated, currentFactory, canAccessAllFactories } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarItem, setSidebarItem] = useState('operations-overview');
  const [aiOpen, setAiOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  const transactionColumns = [
    { key: 'id', label: 'Transaction ID', render: (value: string) => <strong>{value}</strong> },
    { key: 'date', label: 'Date' },
    { key: 'customer', label: 'Customer' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount' },
    { key: 'department', label: 'Department' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => {
        const statusClass = value === 'Processing' || value === 'Approved' || value === 'Shipped' 
          ? 'active' 
          : value === 'Pending' 
          ? 'pending' 
          : 'inactive';
        return <span className={`status-badge ${statusClass}`}>{value}</span>;
      }
    },
    { key: 'assignedTo', label: 'Assigned To' },
    { key: 'priority', label: 'Priority' },
    { 
      key: 'actions', 
      label: 'Actions',
      render: () => <button className="btn" style={{ padding: '4px 8px', fontSize: '11px' }}>View</button>
    }
  ];

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
          
          <QuickActions onAction={handleCommand} />
          
          {/* Conditionally render HQ or Factory dashboard */}
          {currentFactory === 'all' && canAccessAllFactories() ? (
            <HQDashboard />
          ) : (
            <FactoryDashboard />
          )}
          
          {/* Keep original dashboard content hidden for now */}
          <div className="hidden">
            <div className="kpi-grid">
              <KPICard
                label="Total Revenue"
                value="$4.28M"
                trend={{ direction: 'up', value: '12.5% vs last month' }}
                variant="success"
              />
            <KPICard
              label="Active Orders"
              value="1,847"
              trend={{ direction: 'up', value: '8.3% increase' }}
            />
            <KPICard
              label="Pending Tasks"
              value="42"
              trend={{ direction: 'neutral', value: '8 critical, 12 high priority' }}
              variant="warning"
            />
            <KPICard
              label="Customer Satisfaction"
              value="94.7%"
              trend={{ direction: 'up', value: '2.1% improvement' }}
            />
            <KPICard
              label="Outstanding Invoices"
              value="$287K"
              trend={{ direction: 'down', value: '15% reduction' }}
              variant="danger"
            />
            <KPICard
              label="Efficiency Rate"
              value="89.3%"
              trend={{ direction: 'up', value: '3.7% optimized' }}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-5">
            <DataTable
              title="Recent Transactions"
              columns={transactionColumns}
              data={transactionData}
              actions={
                <>
                  <button className="btn">Filter</button>
                  <button className="btn">Sort</button>
                  <button className="btn btn-primary">New Transaction</button>
                </>
              }
              onRowSelect={(row) => showNotification(`Opening transaction: ${row.id}`)}
            />
            
            <div className="grid grid-cols-2 gap-5">
              <DataTable
                title="Department Performance"
                columns={[
                  { key: 'department', label: 'Department' },
                  { key: 'efficiency', label: 'Efficiency' },
                  { key: 'tasks', label: 'Tasks' },
                  { key: 'completion', label: 'Completion' }
                ]}
                data={departmentData}
                actions={<button className="btn">Details</button>}
              />
              
              <DataTable
                title="Resource Utilization"
                columns={[
                  { key: 'resource', label: 'Resource' },
                  { key: 'allocated', label: 'Allocated' },
                  { key: 'used', label: 'Used' },
                  { key: 'available', label: 'Available' },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (value: string) => {
                      const statusClass = value === 'Optimal' || value === 'Available'
                        ? 'active'
                        : value === 'High Usage'
                        ? 'pending'
                        : 'inactive';
                      return <span className={`status-badge ${statusClass}`}>{value}</span>;
                    }
                  }
                ]}
                data={resourceData}
                actions={<button className="btn">View All</button>}
              />
            </div>
            
            <div className="data-panel">
              <div className="tabs">
                <div className="tab active">Performance Trends</div>
                <div className="tab">Financial Summary</div>
                <div className="tab">Resource Analytics</div>
                <div className="tab">Quality Metrics</div>
                <div className="tab">AI Insights</div>
              </div>
              <div className="chart-container">
                📊 Performance Trend Analysis - Last 90 Days
              </div>
            </div>
            
            <DataTable
              title="Inventory Status"
              columns={[
                { key: 'category', label: 'Item Category' },
                { key: 'stock', label: 'Current Stock' },
                { key: 'min', label: 'Minimum Level' },
                { key: 'reorder', label: 'Reorder Point' },
                {
                  key: 'status',
                  label: 'Status',
                  render: (value: string) => {
                    const statusClass = value === 'Sufficient' ? 'active' : 'pending';
                    return <span className={`status-badge ${statusClass}`}>{value}</span>;
                  }
                }
              ]}
              data={inventoryData}
              actions={<button className="btn">Warehouse Details</button>}
            />
          </div>
          </div> {/* End of hidden div */}
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