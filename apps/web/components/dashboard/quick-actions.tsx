'use client';

import { FileText, Users, BarChart3, Package, DollarSign, TrendingUp } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  onAction?: (actionId: string) => void;
}

const defaultActions: QuickAction[] = [
  { id: 'create-order', label: 'Create Order', icon: <FileText /> },
  { id: 'new-customer', label: 'New Customer', icon: <Users /> },
  { id: 'generate-report', label: 'Generate Report', icon: <BarChart3 /> },
  { id: 'inventory-check', label: 'Inventory Check', icon: <Package /> },
  { id: 'process-invoice', label: 'Process Invoice', icon: <DollarSign /> },
  { id: 'view-analytics', label: 'View Analytics', icon: <TrendingUp /> },
];

export function QuickActions({ actions = defaultActions, onAction }: QuickActionsProps) {
  return (
    <div className="quick-actions">
      <div className="font-semibold mb-2">Quick Actions</div>
      <div className="quick-actions-grid">
        {actions.map((action) => (
          <div
            key={action.id}
            className="quick-action"
            onClick={() => {
              action.onClick?.();
              onAction?.(action.id);
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