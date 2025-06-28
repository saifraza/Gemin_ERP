'use client';

import { useRouter } from 'next/navigation';
import { FileText, Users, BarChart3, Package, Building2, FlaskConical } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  onAction?: (actionId: string) => void;
}

const defaultActions: QuickAction[] = [
  { id: 'create-order', label: 'Create Order', icon: <FileText /> },
  { id: 'new-company', label: 'New Company', icon: <Building2 />, href: '/company/new' },
  { id: 'new-customer', label: 'New Customer', icon: <Users /> },
  { id: 'generate-report', label: 'Generate Report', icon: <BarChart3 /> },
  { id: 'test-backend', label: 'Test Backend', icon: <FlaskConical />, href: '/test' },
  { id: 'inventory-check', label: 'Inventory Check', icon: <Package /> },
];

export function QuickActions({ actions = defaultActions, onAction }: QuickActionsProps) {
  const router = useRouter();
  
  return (
    <div className="quick-actions">
      <div className="font-semibold mb-2">Quick Actions</div>
      <div className="quick-actions-grid">
        {actions.map((action) => (
          <div
            key={action.id}
            className="quick-action"
            onClick={() => {
              if (action.href) {
                router.push(action.href);
              } else {
                action.onClick?.();
                onAction?.(action.id);
              }
            }}
          >
            <div className="quick-action-icon">
              {action.icon}
            </div>
            <div className="text-xs">{action.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}