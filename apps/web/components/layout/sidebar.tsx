'use client';

import { useRouter, usePathname } from 'next/navigation';

interface SidebarItem {
  id: string;
  label: string;
  badge?: number;
  active?: boolean;
  href?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

const defaultSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'master-data', label: 'Master Data', href: '/master-data' },
    ]
  },
  {
    title: 'Production',
    items: [
      { id: 'production-planning', label: 'Production Planning' },
      { id: 'work-orders', label: 'Work Orders' },
      { id: 'inventory', label: 'Inventory Management' },
      { id: 'quality-control', label: 'Quality Control' },
    ]
  },
  {
    title: 'Sales & Distribution',
    items: [
      { id: 'sales-orders', label: 'Sales Orders' },
      { id: 'customers', label: 'Customer Management' },
      { id: 'pricing', label: 'Pricing & Discounts' },
      { id: 'delivery', label: 'Delivery Schedule' },
    ]
  },
  {
    title: 'Procurement',
    items: [
      { id: 'purchase-orders', label: 'Purchase Orders' },
      { id: 'vendors', label: 'Vendor Management' },
      { id: 'rfq', label: 'Request for Quotation' },
      { id: 'contracts', label: 'Contracts' },
    ]
  },
  {
    title: 'Finance',
    items: [
      { id: 'accounts-payable', label: 'Accounts Payable' },
      { id: 'accounts-receivable', label: 'Accounts Receivable' },
      { id: 'general-ledger', label: 'General Ledger' },
      { id: 'financial-reports', label: 'Financial Reports' },
    ]
  },
  {
    title: 'Human Resources',
    items: [
      { id: 'employees', label: 'Employee Management' },
      { id: 'attendance', label: 'Attendance' },
      { id: 'payroll', label: 'Payroll' },
      { id: 'leave-management', label: 'Leave Management' },
    ]
  },
  {
    title: 'Reports & Analytics',
    items: [
      { id: 'dashboards', label: 'Analytics Dashboard' },
      { id: 'custom-reports', label: 'Custom Reports' },
      { id: 'scheduled-reports', label: 'Scheduled Reports' },
    ]
  }
];

export function Sidebar({ activeItem = 'dashboard', onItemClick }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  return (
    <div className="sidebar">
      {defaultSections.map((section) => (
        <div key={section.title} className="sidebar-section">
          <div className="sidebar-title">{section.title}</div>
          {section.items.map((item) => {
            const isActive = item.href ? pathname === item.href : activeItem === item.id;
            
            return (
              <div
                key={item.id}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (item.href) {
                    router.push(item.href);
                  } else {
                    onItemClick?.(item.id);
                  }
                }}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}