'use client';

import { useRouter } from 'next/navigation';
import { FileText, Users, BarChart3, Package, Building2, FlaskConical, ShoppingCart, Truck } from 'lucide-react';

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
  { id: 'procurement', label: 'Procurement', icon: <ShoppingCart />, href: '/supply-chain/procurement' },
  { id: 'inventory', label: 'Inventory', icon: <Package />, href: '/supply-chain/inventory' },
  { id: 'transportation', label: 'Transportation', icon: <Truck />, href: '/supply-chain/transportation' },
  { id: 'generate-report', label: 'Generate Report', icon: <BarChart3 /> },
];

export function QuickActions({ actions = defaultActions, onAction }: QuickActionsProps) {
  const router = useRouter();
  
  return (
    <div className="quick-actions">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h2>
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
            <div className="text-sm text-center">{action.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}