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
    title: 'Quick Links',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', badge: 5 },
      { id: 'new-company', label: 'Company Setup', href: '/company/new' },
      { id: 'test-backend', label: 'Test Backend', href: '/test' },
    ]
  },
  {
    title: 'Favorites',
    items: [
      { id: 'operations-overview', label: 'Operations Overview' },
      { id: 'daily-summary', label: 'Daily Summary' },
      { id: 'team-performance', label: 'Team Performance' },
      { id: 'resource-status', label: 'Resource Status' },
      { id: 'quality-metrics', label: 'Quality Metrics' },
    ]
  },
  {
    title: 'Departments',
    items: [
      { id: 'production', label: 'Production' },
      { id: 'sales-distribution', label: 'Sales & Distribution' },
      { id: 'procurement', label: 'Procurement' },
      { id: 'finance', label: 'Finance' },
      { id: 'human-resources', label: 'Human Resources' },
      { id: 'it-services', label: 'IT Services' },
    ]
  },
  {
    title: 'Quick Reports',
    items: [
      { id: 'performance-analysis', label: 'Performance Analysis' },
      { id: 'cost-center-report', label: 'Cost Center Report' },
      { id: 'efficiency-metrics', label: 'Efficiency Metrics' },
      { id: 'variance-analysis', label: 'Variance Analysis' },
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