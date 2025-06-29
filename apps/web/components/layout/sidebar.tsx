'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SidebarItem {
  id: string;
  label: string;
  badge?: number;
  active?: boolean;
  href?: string;
  items?: SidebarItem[];
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

// Comprehensive ERP navigation structure based on erp-navigation-structure.md
const defaultSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
      { id: 'master-data', label: 'Master Data', href: '/master-data' },
    ]
  },
  {
    title: 'Financial Management',
    items: [
      { 
        id: 'general-ledger', 
        label: 'General Ledger',
        items: [
          { id: 'chart-of-accounts', label: 'Chart of Accounts', href: '/finance/gl/chart-of-accounts' },
          { id: 'journal-entries', label: 'Journal Entries', href: '/finance/gl/journal-entries' },
          { id: 'financial-periods', label: 'Financial Periods', href: '/finance/gl/periods' },
        ]
      },
      { 
        id: 'accounts-payable', 
        label: 'Accounts Payable',
        items: [
          { id: 'vendor-management', label: 'Vendor Management', href: '/finance/ap/vendors' },
          { id: 'invoice-processing', label: 'Invoice Processing', href: '/finance/ap/invoices' },
          { id: 'payment-processing', label: 'Payment Processing', href: '/finance/ap/payments' },
        ]
      },
      { 
        id: 'accounts-receivable', 
        label: 'Accounts Receivable',
        items: [
          { id: 'customer-management', label: 'Customer Management', href: '/finance/ar/customers' },
          { id: 'billing-invoicing', label: 'Billing & Invoicing', href: '/finance/ar/invoices' },
          { id: 'collections', label: 'Collections', href: '/finance/ar/collections' },
        ]
      },
      { id: 'fixed-assets', label: 'Fixed Assets', href: '/finance/fixed-assets' },
      { id: 'cash-management', label: 'Cash Management', href: '/finance/cash' },
      { id: 'financial-reporting', label: 'Financial Reporting', href: '/finance/reports' },
      { id: 'budgeting', label: 'Budgeting & Planning', href: '/finance/budgeting' },
      { id: 'cost-accounting', label: 'Cost Accounting', href: '/finance/cost-accounting' },
      { id: 'tax-management', label: 'Tax Management', href: '/finance/tax' },
    ]
  },
  {
    title: 'Supply Chain',
    items: [
      { 
        id: 'procurement', 
        label: 'Procurement',
        items: [
          { id: 'purchase-requisitions', label: 'Purchase Requisitions', href: '/scm/procurement/requisitions' },
          { id: 'purchase-orders', label: 'Purchase Orders', href: '/scm/procurement/orders' },
          { id: 'supplier-management', label: 'Supplier Management', href: '/scm/procurement/suppliers' },
        ]
      },
      { 
        id: 'inventory', 
        label: 'Inventory Management',
        items: [
          { id: 'item-master', label: 'Item Master', href: '/scm/inventory/items' },
          { id: 'stock-control', label: 'Stock Control', href: '/scm/inventory/stock' },
          { id: 'inventory-transactions', label: 'Transactions', href: '/scm/inventory/transactions' },
        ]
      },
      { id: 'warehouse', label: 'Warehouse Management', href: '/scm/warehouse' },
      { id: 'transportation', label: 'Transportation', href: '/scm/transportation' },
      { id: 'demand-planning', label: 'Demand Planning', href: '/scm/demand-planning' },
      { id: 'supply-planning', label: 'Supply Planning', href: '/scm/supply-planning' },
    ]
  },
  {
    title: 'Manufacturing',
    items: [
      { id: 'production-planning', label: 'Production Planning', href: '/manufacturing/planning' },
      { id: 'mes', label: 'Manufacturing Execution', href: '/manufacturing/mes' },
      { id: 'mrp', label: 'Material Requirements', href: '/manufacturing/mrp' },
      { id: 'shop-floor', label: 'Shop Floor Control', href: '/manufacturing/shop-floor' },
      { id: 'bom', label: 'Bill of Materials', href: '/manufacturing/bom' },
      { id: 'plm', label: 'Product Lifecycle', href: '/manufacturing/plm' },
      { id: 'quality-control', label: 'Quality Control', href: '/manufacturing/quality' },
    ]
  },
  {
    title: 'Human Resources',
    items: [
      { id: 'core-hr', label: 'Core HR', href: '/hr/core' },
      { id: 'payroll', label: 'Payroll Processing', href: '/hr/payroll' },
      { id: 'time-attendance', label: 'Time & Attendance', href: '/hr/time' },
      { id: 'talent-management', label: 'Talent Management', href: '/hr/talent' },
      { id: 'benefits', label: 'Benefits Administration', href: '/hr/benefits' },
      { id: 'compensation', label: 'Compensation', href: '/hr/compensation' },
      { id: 'employee-self-service', label: 'Employee Self-Service', href: '/hr/ess' },
      { id: 'hr-analytics', label: 'HR Analytics', href: '/hr/analytics' },
    ]
  },
  {
    title: 'CRM',
    items: [
      { id: 'sales-automation', label: 'Sales Force Automation', href: '/crm/sales' },
      { id: 'marketing', label: 'Marketing Automation', href: '/crm/marketing' },
      { id: 'customer-service', label: 'Customer Service', href: '/crm/service' },
      { id: 'sales-analytics', label: 'Sales Analytics', href: '/crm/analytics' },
      { id: 'quote-order', label: 'Quote & Order Management', href: '/crm/quotes' },
    ]
  },
  {
    title: 'Project Management',
    items: [
      { id: 'project-planning', label: 'Project Planning', href: '/projects/planning' },
      { id: 'resource-management', label: 'Resource Management', href: '/projects/resources' },
      { id: 'project-budgeting', label: 'Project Budgeting', href: '/projects/budgeting' },
      { id: 'portfolio-management', label: 'Portfolio Management', href: '/projects/portfolio' },
      { id: 'time-billing', label: 'Time & Billing', href: '/projects/time-billing' },
    ]
  },
  {
    title: 'Asset Management',
    items: [
      { id: 'asset-tracking', label: 'Asset Tracking', href: '/assets/tracking' },
      { id: 'maintenance', label: 'Maintenance Management', href: '/assets/maintenance' },
      { id: 'asset-lifecycle', label: 'Asset Lifecycle', href: '/assets/lifecycle' },
      { id: 'spare-parts', label: 'Spare Parts', href: '/assets/spare-parts' },
      { id: 'fleet-management', label: 'Fleet Management', href: '/assets/fleet' },
    ]
  },
  {
    title: 'Quality Management',
    items: [
      { id: 'quality-planning', label: 'Quality Planning', href: '/quality/planning' },
      { id: 'quality-control', label: 'Quality Control', href: '/quality/control' },
      { id: 'non-conformance', label: 'Non-Conformance', href: '/quality/ncr' },
      { id: 'capa', label: 'CAPA', href: '/quality/capa' },
      { id: 'audit-management', label: 'Audit Management', href: '/quality/audits' },
      { id: 'supplier-quality', label: 'Supplier Quality', href: '/quality/supplier' },
    ]
  },
  {
    title: 'Analytics & BI',
    items: [
      { id: 'data-warehouse', label: 'Data Warehouse', href: '/analytics/warehouse' },
      { id: 'advanced-analytics', label: 'Advanced Analytics', href: '/analytics/advanced' },
      { id: 'reporting', label: 'Reporting & Dashboards', href: '/analytics/reports' },
      { id: 'data-visualization', label: 'Data Visualization', href: '/analytics/visualization' },
      { id: 'performance-mgmt', label: 'Performance Management', href: '/analytics/performance' },
    ]
  },
  {
    title: 'Specialized Modules',
    items: [
      { id: 'compliance-risk', label: 'Compliance & Risk', href: '/specialized/compliance' },
      { id: 'document-mgmt', label: 'Document Management', href: '/specialized/documents' },
      { id: 'ehs', label: 'Environmental Health & Safety', href: '/specialized/ehs' },
      { id: 'service-mgmt', label: 'Service Management', href: '/specialized/service' },
      { id: 'contract-mgmt', label: 'Contract Management', href: '/specialized/contracts' },
      { id: 'real-estate', label: 'Real Estate Management', href: '/specialized/real-estate' },
      { id: 'energy-mgmt', label: 'Energy Management', href: '/specialized/energy' },
    ]
  },
  {
    title: 'System',
    items: [
      { id: 'system-test', label: 'System Test', href: '/system-test' },
      { id: 'integration', label: 'Integration Platform', href: '/system/integration' },
      { id: 'workflow', label: 'Workflow Management', href: '/system/workflow' },
      { id: 'security', label: 'Security Management', href: '/system/security' },
      { id: 'admin', label: 'System Administration', href: '/system/admin' },
    ]
  }
];

export function Sidebar({ activeItem = 'dashboard', onItemClick }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Main']));
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  const toggleSection = (sectionTitle: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionTitle)) {
      newExpanded.delete(sectionTitle);
    } else {
      newExpanded.add(sectionTitle);
    }
    setExpandedSections(newExpanded);
  };

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderItem = (item: SidebarItem, depth: number = 0) => {
    const isActive = item.href ? pathname === item.href : activeItem === item.id;
    const hasSubItems = item.items && item.items.length > 0;
    const isExpanded = expandedItems.has(item.id);
    
    return (
      <div key={item.id}>
        <div
          className={`sidebar-item ${isActive ? 'active' : ''} ${depth > 0 ? 'ml-4' : ''}`}
          onClick={() => {
            if (hasSubItems) {
              toggleItem(item.id);
            } else if (item.href) {
              router.push(item.href);
            } else {
              onItemClick?.(item.id);
            }
          }}
        >
          <div className="flex items-center justify-between flex-1">
            <span className={depth > 0 ? 'text-sm' : ''}>{item.label}</span>
            <div className="flex items-center gap-2">
              {item.badge && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
              {hasSubItems && (
                <span className="text-gray-400">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              )}
            </div>
          </div>
        </div>
        {hasSubItems && isExpanded && (
          <div className="mt-1">
            {item.items!.map(subItem => renderItem(subItem, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="sidebar">
      {defaultSections.map((section) => {
        const isExpanded = expandedSections.has(section.title);
        
        return (
          <div key={section.title} className="sidebar-section">
            <div 
              className="sidebar-title cursor-pointer flex items-center justify-between"
              onClick={() => toggleSection(section.title)}
            >
              <span>{section.title}</span>
              <span className="text-gray-400">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            </div>
            {isExpanded && (
              <div className="mt-1">
                {section.items.map(item => renderItem(item))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}