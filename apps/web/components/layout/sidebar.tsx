'use client';

import { useRouter, usePathname } from 'next/navigation';
import { 
  ChevronRight, 
  ChevronDown,
  ChevronLeft,
  LayoutDashboard,
  Database,
  DollarSign,
  Package,
  Factory,
  Users,
  UserCheck,
  FolderOpen,
  BarChart3,
  Shield,
  Wrench,
  FlaskConical,
  ShoppingCart,
  Briefcase,
  ClipboardList,
  Settings,
  Network,
  Lock,
  UserCog,
  Building2
} from 'lucide-react';
import { useState } from 'react';

interface SidebarItem {
  id: string;
  label: string;
  badge?: number;
  active?: boolean;
  href?: string;
  items?: SidebarItem[];
  icon?: React.ReactNode;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
  icon?: React.ReactNode;
}

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  selectedModule?: string;
}

// Comprehensive ERP navigation structure based on erp-navigation-structure.md
const defaultSections: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
      { id: 'master-data', label: 'Master Data', href: '/master-data', icon: <Database size={18} /> },
    ]
  },
  {
    title: 'Operations',
    icon: <Package size={16} />,
    items: [
      { 
        id: 'sales-distribution', 
        label: 'Sales & Distribution',
        icon: <Briefcase size={18} />,
        items: [
          { id: 'sales-orders', label: 'Sales Orders', href: '/operations/sales/orders' },
          { id: 'customers', label: 'Customers', href: '/operations/sales/customers' },
          { id: 'distribution', label: 'Distribution', href: '/operations/sales/distribution' },
        ]
      },
      { 
        id: 'production', 
        label: 'Production',
        icon: <Factory size={18} />,
        items: [
          { id: 'production-planning', label: 'Production Planning', href: '/operations/production/planning' },
          { id: 'shop-floor', label: 'Shop Floor', href: '/operations/production/shop-floor' },
          { id: 'quality-control', label: 'Quality Control', href: '/operations/production/quality' },
        ]
      },
      { 
        id: 'procurement', 
        label: 'Procurement',
        icon: <ShoppingCart size={18} />,
        items: [
          { id: 'purchase-orders', label: 'Purchase Orders', href: '/operations/procurement/orders' },
          { id: 'suppliers', label: 'Suppliers', href: '/operations/procurement/suppliers' },
          { id: 'rfq', label: 'RFQ Management', href: '/operations/procurement/rfq' },
        ]
      },
    ]
  },
  {
    title: 'Finance Module',
    icon: <DollarSign size={16} />,
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
    title: 'Human Resources',
    icon: <Users size={16} />,
    items: [
      { id: 'core-hr', label: 'Core HR', href: '/hr/core', icon: <UserCheck size={18} /> },
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
    title: 'Supply Chain',
    icon: <Package size={16} />,
    items: [
      { 
        id: 'procurement', 
        label: 'Procurement',
        items: [
          { id: 'purchase-orders', label: 'Purchase Orders', href: '/supply-chain/procurement' },
          { id: 'requisitions', label: 'Requisitions', href: '/supply-chain/procurement#requisitions' },
          { id: 'vendor-management', label: 'Vendor Management', href: '/supply-chain/procurement#vendors' },
        ]
      },
      { 
        id: 'inventory', 
        label: 'Inventory Management',
        items: [
          { id: 'stock-levels', label: 'Stock Levels', href: '/supply-chain/inventory' },
          { id: 'item-master', label: 'Item Master', href: '/supply-chain/inventory#items' },
          { id: 'transactions', label: 'Transactions', href: '/supply-chain/inventory#transactions' },
        ]
      },
      { id: 'warehouse', label: 'Warehouse Management', href: '/supply-chain/warehouse' },
      { id: 'transportation', label: 'Transportation', href: '/supply-chain/transportation' },
      { id: 'demand-planning', label: 'Demand Planning', href: '/supply-chain/demand-planning' },
      { id: 'supply-planning', label: 'Supply Planning', href: '/supply-chain/supply-planning' },
    ]
  },
  {
    title: 'Manufacturing',
    icon: <Factory size={16} />,
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
    title: 'CRM',
    icon: <UserCheck size={16} />,
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
    icon: <FolderOpen size={16} />,
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
    icon: <Wrench size={16} />,
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
    icon: <ClipboardList size={16} />,
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
    icon: <BarChart3 size={16} />,
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
    icon: <Shield size={16} />,
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
    icon: <Settings size={16} />,
    items: [
      { id: 'system-test', label: 'System Test', href: '/system-test', icon: <FlaskConical size={18} /> },
      { id: 'integration', label: 'Integration Platform', href: '/system/integration', icon: <Network size={18} /> },
      { id: 'workflow', label: 'Workflow Management', href: '/system/workflow' },
      { id: 'security', label: 'Security Management', href: '/system/security', icon: <Lock size={18} /> },
      { id: 'admin', label: 'System Administration', href: '/system/admin', icon: <UserCog size={18} /> },
    ]
  }
];

export function Sidebar({ activeItem = 'dashboard', onItemClick, selectedModule }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Main', 'System']));
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // Define Master Data as a module structure
  const masterDataSection: SidebarSection = {
    title: 'Master Data',
    icon: <Database size={16} />,
    items: [
      { id: 'companies', label: 'Companies', href: '/master-data?tab=companies', icon: <Building2 size={18} /> },
      { id: 'users', label: 'Users', href: '/master-data?tab=users', icon: <Users size={18} /> },
      { id: 'business', label: 'Business Units', href: '/master-data?tab=factories', icon: <Factory size={18} /> },
      { id: 'divisions', label: 'Divisions', href: '/master-data?tab=divisions', icon: <Network size={18} /> },
      { id: 'access-control', label: 'Access Control', href: '/master-data?tab=access', icon: <Shield size={18} /> },
    ]
  };
  
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
            <div className="flex items-center gap-2">
              {item.icon && <span className="text-gray-500">{item.icon}</span>}
              <span className={depth > 0 ? 'text-sm' : ''}>{item.label}</span>
            </div>
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
  
  // Determine which sections to show
  let sectionsToShow: SidebarSection[] = [];
  
  if (selectedModule === 'master-data') {
    // Show only Master Data sub-modules
    sectionsToShow = [masterDataSection];
  } else if (selectedModule) {
    // Find the selected module and show only its content
    const moduleSection = defaultSections.find(section => {
      const sectionKey = section.title.toLowerCase().replace(/\s+/g, '-').replace('&', 'and');
      return sectionKey === selectedModule || 
             section.items.some(item => item.id === selectedModule);
    });
    
    if (moduleSection) {
      sectionsToShow = [moduleSection];
    } else {
      // If module not found, show default sections
      sectionsToShow = defaultSections;
    }
  } else {
    // Show all sections when no module is selected
    sectionsToShow = defaultSections;
  }
  
  // Always expand the sections when showing module-specific view
  const effectiveExpandedSections = selectedModule 
    ? new Set(sectionsToShow.map(s => s.title))
    : expandedSections;
  
  return (
    <div className="sidebar">
      {/* Add a back button when in module view */}
      {selectedModule && (
        <div 
          className="sidebar-item mb-2 cursor-pointer hover:bg-gray-100"
          onClick={() => router.push('/dashboard')}
        >
          <div className="flex items-center gap-2 text-blue-600">
            <ChevronLeft size={18} />
            <span>Back to All Modules</span>
          </div>
        </div>
      )}
      
      {sectionsToShow.map((section) => {
        const isExpanded = effectiveExpandedSections.has(section.title);
        
        return (
          <div key={section.title} className="sidebar-section">
            <div 
              className="sidebar-title cursor-pointer flex items-center justify-between"
              onClick={() => !selectedModule && toggleSection(section.title)}
            >
              <div className="flex items-center gap-2">
                {section.icon && <span className="text-gray-500">{section.icon}</span>}
                <span>{section.title}</span>
              </div>
              {!selectedModule && (
                <span className="text-gray-400">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              )}
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