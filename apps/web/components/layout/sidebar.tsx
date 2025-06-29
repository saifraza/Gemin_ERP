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
    title: 'System',
    items: [
      { id: 'system-test', label: 'System Test', href: '/system-test' },
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