import { ToolRequestHandler } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ERP Help Tool - Provides guidance on how to use the ERP
const erpHelpSchema = z.object({
  topic: z.string().describe('What the user wants help with'),
  context: z.string().optional().describe('Additional context'),
});

const erpHelpHandler: ToolRequestHandler = {
  name: 'erp_help',
  description: 'Provides step-by-step instructions for common ERP tasks',
  inputSchema: erpHelpSchema,
  handler: async (request) => {
    const { topic, context } = request.arguments;
    
    // Help content database
    const helpContent: Record<string, any> = {
      'create user': {
        title: 'How to Create a New User',
        steps: [
          '1. Navigate to Master Data from the main menu',
          '2. Click on the "Users" tab',
          '3. Click the "Create User" button',
          '4. Fill in the required fields:',
          '   - Username (unique identifier)',
          '   - Email address',
          '   - Full name',
          '   - Password (min 8 characters)',
          '   - Select role (ADMIN, MANAGER, OPERATOR, or VIEWER)',
          '   - Select company (if you have access to multiple)',
          '5. Click "Save" to create the user',
        ],
        permissions: 'You need ADMIN or SUPER_ADMIN role to create users',
        tips: [
          '- Usernames must be unique across the system',
          '- Users login with username, not email',
          '- Assign appropriate roles based on job function',
          '- VIEWER role is read-only access',
        ],
        location: 'Master Data > Users',
      },
      'create company': {
        title: 'How to Create a New Company',
        steps: [
          '1. Navigate to Master Data from the main menu',
          '2. Click on the "Companies" tab',
          '3. Click "Create Company" button',
          '4. Fill in company details:',
          '   - Company name',
          '   - Company code (unique)',
          '   - GST number (optional)',
          '   - PAN number (optional)',
          '   - Address details',
          '   - Contact information',
          '5. Click "Save" to create the company',
        ],
        permissions: 'Only SUPER_ADMIN can create companies',
        tips: [
          '- Company code must be unique',
          '- Only one company is typically needed',
          '- All users must belong to a company',
        ],
        location: 'Master Data > Companies',
      },
      'create factory': {
        title: 'How to Create a New Factory',
        steps: [
          '1. Navigate to Master Data from the main menu',
          '2. Click on the "Factories" tab',
          '3. Click "Create Factory" button',
          '4. Fill in factory details:',
          '   - Factory name',
          '   - Factory code (unique)',
          '   - Type (INTEGRATED, SUGAR_ONLY, DISTILLERY, COGEN)',
          '   - Location details',
          '   - Production capacity for each division',
          '5. Click "Save" to create the factory',
        ],
        permissions: 'ADMIN or SUPER_ADMIN role required',
        tips: [
          '- Factory code must be unique',
          '- Select appropriate type based on operations',
          '- Set realistic capacity numbers',
        ],
        location: 'Master Data > Factories',
      },
      'view production': {
        title: 'How to View Production Data',
        steps: [
          '1. From the Dashboard, look at the Production Metrics section',
          '2. For detailed view:',
          '   - Navigate to Operations > Production',
          '   - Select division (Sugar, Ethanol, Power, Feed)',
          '   - Choose time range',
          '3. View real-time metrics and trends',
        ],
        permissions: 'All roles can view production data for their assigned factories',
        tips: [
          '- HQ users see consolidated data',
          '- Factory users see only their factory data',
          '- Use filters to focus on specific divisions',
        ],
        location: 'Dashboard or Operations > Production',
      },
      'navigation': {
        title: 'Modern ERP Navigation Guide - Comprehensive Module Structure',
        overview: 'Our ERP system has 11 major modules with extensive sub-modules:',
        modules: {
          '1. Financial Management': {
            'General Ledger': ['Chart of Accounts', 'Journal Entries', 'Financial Periods'],
            'Accounts Payable': ['Vendor Management', 'Invoice Processing', 'Payment Processing'],
            'Accounts Receivable': ['Customer Management', 'Billing & Invoicing', 'Collections'],
            'Fixed Assets': 'Asset tracking and depreciation',
            'Cash Management': 'Cash flow and treasury',
            'Financial Reporting': 'Financial statements and reports',
            'Budgeting & Planning': 'Budget creation and tracking',
            'Cost Accounting': 'Cost centers and profitability',
            'Tax Management': 'Tax compliance and reporting',
          },
          '2. Supply Chain Management': {
            'Inventory Management': ['Item Master', 'Stock Control', 'Transactions'],
            'Warehouse Management': 'Multi-location inventory',
            'Transportation': 'Logistics and shipping',
            'Demand Planning': 'Forecasting and planning',
            'Supply Planning': 'Material requirements',
          },
          '3. Manufacturing': {
            'Production Planning': 'Production schedules',
            'Manufacturing Execution': 'Shop floor management',
            'Material Requirements': 'MRP calculations',
            'Bill of Materials': 'Product structures',
            'Product Lifecycle': 'PLM features',
            'Quality Control': 'Quality inspections',
          },
          '4. Human Resources': {
            'Core HR': 'Employee records',
            'Payroll Processing': 'Salary management',
            'Time & Attendance': 'Time tracking',
            'Talent Management': 'Performance and skills',
            'Benefits Administration': 'Employee benefits',
            'Compensation': 'Compensation planning',
            'Employee Self-Service': 'ESS portal',
            'HR Analytics': 'HR metrics and reports',
          },
          '5. Customer Relationship Management': {
            'Sales Force Automation': 'Lead and opportunity management',
            'Marketing Automation': 'Campaign management',
            'Customer Service': 'Support tickets',
            'Sales Analytics': 'Sales insights',
            'Quote & Order Management': 'Quotations and orders',
          },
          '6. Project Management': {
            'Project Planning': 'Project creation and WBS',
            'Resource Management': 'Resource allocation',
            'Project Budgeting': 'Cost tracking',
            'Portfolio Management': 'Multi-project view',
            'Time & Billing': 'Time sheets and billing',
          },
          '7. Asset Management': {
            'Asset Tracking': 'Asset registry',
            'Maintenance Management': 'Preventive maintenance',
            'Asset Lifecycle': 'Acquisition to disposal',
            'Spare Parts': 'Parts inventory',
            'Fleet Management': 'Vehicle management',
          },
          '8. Quality Management': {
            'Quality Planning': 'Quality standards',
            'Quality Control': 'Inspections and testing',
            'Non-Conformance': 'NCR management',
            'CAPA': 'Corrective actions',
            'Audit Management': 'Quality audits',
            'Supplier Quality': 'Vendor quality',
          },
          '9. Business Intelligence & Analytics': {
            'Data Warehouse': 'Central data repository',
            'Advanced Analytics': 'Predictive analytics',
            'Reporting & Dashboards': 'Custom reports',
            'Data Visualization': 'Charts and graphs',
            'Performance Management': 'KPI tracking',
          },
          '10. Specialized Modules': {
            'Compliance & Risk': 'Regulatory compliance',
            'Document Management': 'Document control',
            'Environmental Health & Safety': 'EHS management',
            'Service Management': 'Service operations',
            'Contract Management': 'Contract lifecycle',
            'Real Estate Management': 'Property management',
            'Energy Management': 'Energy monitoring',
          },
          '11. Integration & Technical': {
            'Integration Platform': 'API management',
            'Workflow Management': 'Process automation',
            'Security Management': 'Access control',
            'System Administration': 'System configuration',
            'System Test': 'Health monitoring',
          },
        },
        currentlyImplemented: ['Dashboard', 'Master Data', 'System Test'],
        underDevelopment: ['Financial Management', 'Supply Chain Management'],
      },
    };
    
    // Find matching help content
    const lowerTopic = topic.toLowerCase();
    let helpInfo = null;
    
    // Check for module count questions
    if (lowerTopic.includes('how many modules') || lowerTopic.includes('module count') || lowerTopic.includes('modules in erp')) {
      helpInfo = {
        title: 'ERP Module Count',
        answer: 'The Modern ERP system has 11 major modules',
        modules: [
          '1. Financial Management (9 sub-modules)',
          '2. Supply Chain Management (5 sub-modules)',
          '3. Manufacturing (6 sub-modules)',
          '4. Human Resources Management (8 sub-modules)',
          '5. Customer Relationship Management (5 sub-modules)',
          '6. Project Management (5 sub-modules)',
          '7. Asset Management (5 sub-modules)',
          '8. Quality Management (6 sub-modules)',
          '9. Business Intelligence & Analytics (5 sub-modules)',
          '10. Specialized Modules (7 sub-modules)',
          '11. Integration & Technical Modules (5 sub-modules)',
        ],
        totalSubModules: 'Total: 11 major modules with 66 sub-modules',
        implementationStatus: {
          'Currently Live': ['Dashboard', 'Master Data', 'System Test'],
          'Under Development': ['Financial Management', 'Supply Chain Management'],
          'Planned': 'Remaining modules will be implemented in phases',
        },
        note: 'This is a comprehensive enterprise-grade ERP system designed to handle all aspects of business operations.',
      };
    } else {
      for (const [key, content] of Object.entries(helpContent)) {
        if (lowerTopic.includes(key) || key.includes(lowerTopic)) {
          helpInfo = content;
          break;
        }
      }
    }
    
    // If no exact match, provide general guidance
    if (!helpInfo) {
      helpInfo = {
        title: 'General ERP Help',
        message: `I couldn't find specific help for "${topic}". Here are some general tips:`,
        tips: [
          'Use Master Data to manage core entities (users, companies, factories)',
          'Dashboard provides overview of all operations',
          'Each module has its own section in the navigation',
          'Your role determines what features you can access',
          'Contact admin if you need additional permissions',
        ],
        suggestion: 'Try asking about: create user, create company, view production, or navigation',
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(helpInfo, null, 2),
        },
      ],
    };
  },
};

// User Management Tool - Actually performs user operations
const userManagementSchema = z.object({
  action: z.enum(['list', 'create', 'update', 'delete', 'get']),
  userId: z.string().optional(),
  data: z.object({
    username: z.string().optional(),
    email: z.string().optional(),
    name: z.string().optional(),
    password: z.string().optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']).optional(),
    companyId: z.string().optional(),
  }).optional(),
});

const userManagementHandler: ToolRequestHandler = {
  name: 'user_management',
  description: 'Manage users in the ERP system (list, create, update, delete)',
  inputSchema: userManagementSchema,
  handler: async (request) => {
    const { action, userId, data } = request.arguments;
    
    try {
      let result;
      
      switch (action) {
        case 'list':
          result = await prisma.user.findMany({
            select: {
              id: true,
              username: true,
              email: true,
              name: true,
              role: true,
              isActive: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
              createdAt: true,
            },
          });
          break;
          
        case 'get':
          if (!userId) throw new Error('userId required for get action');
          result = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              username: true,
              email: true,
              name: true,
              role: true,
              isActive: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });
          break;
          
        case 'create':
          if (!data?.username || !data?.email || !data?.name || !data?.password) {
            throw new Error('Username, email, name, and password are required');
          }
          
          // Simple hash for demo - in production use bcrypt
          const passwordHash = Buffer.from(data.password).toString('base64');
          
          result = await prisma.user.create({
            data: {
              username: data.username,
              email: data.email,
              name: data.name,
              passwordHash,
              role: data.role || 'VIEWER',
              companyId: data.companyId || (await prisma.company.findFirst())?.id || '',
            },
            select: {
              id: true,
              username: true,
              email: true,
              name: true,
              role: true,
            },
          });
          break;
          
        case 'update':
          if (!userId) throw new Error('userId required for update action');
          
          const updateData: any = {};
          if (data?.name) updateData.name = data.name;
          if (data?.email) updateData.email = data.email;
          if (data?.role) updateData.role = data.role;
          if (data?.companyId) updateData.companyId = data.companyId;
          
          result = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
              id: true,
              username: true,
              email: true,
              name: true,
              role: true,
            },
          });
          break;
          
        case 'delete':
          if (!userId) throw new Error('userId required for delete action');
          
          result = await prisma.user.delete({
            where: { id: userId },
            select: {
              id: true,
              username: true,
            },
          });
          break;
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              action,
              result,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              action,
              error: error instanceof Error ? error.message : 'Unknown error',
            }, null, 2),
          },
        ],
      };
    } finally {
      await prisma.$disconnect();
    }
  },
};

// Navigation Guide Tool
const navigationGuideSchema = z.object({
  feature: z.string().describe('What feature or page the user is looking for'),
});

const navigationGuideHandler: ToolRequestHandler = {
  name: 'navigation_guide',
  description: 'Helps users find features and navigate the ERP system',
  inputSchema: navigationGuideSchema,
  handler: async (request) => {
    const { feature } = request.arguments;
    
    const navigationMap: Record<string, any> = {
      'user': {
        location: 'Master Data > Users',
        path: '/master-data',
        tab: 'users',
        description: 'Manage all system users',
        actions: ['View users', 'Create user', 'Edit user', 'Delete user'],
      },
      'company': {
        location: 'Master Data > Companies',
        path: '/master-data',
        tab: 'companies',
        description: 'Manage company information',
        actions: ['View companies', 'Create company', 'Edit company'],
      },
      'factory': {
        location: 'Master Data > Factories',
        path: '/master-data',
        tab: 'factories',
        description: 'Manage factory locations',
        actions: ['View factories', 'Create factory', 'Edit factory'],
      },
      'production': {
        location: 'Dashboard > Production Metrics',
        path: '/dashboard',
        section: 'production',
        description: 'Monitor real-time production data',
        alternativeLocations: ['Operations > Production'],
      },
      'inventory': {
        location: 'Supply Chain > Inventory',
        path: '/inventory',
        description: 'Manage stock levels and warehouse operations',
        actions: ['View stock', 'Stock movements', 'Reorder management'],
      },
      'finance': {
        location: 'Finance',
        path: '/finance',
        description: 'Financial management and accounting',
        submodules: ['Accounting', 'Costing', 'Budgeting', 'Reports'],
      },
      'maintenance': {
        location: 'Operations > Maintenance',
        path: '/maintenance',
        description: 'Equipment maintenance management',
        actions: ['Schedule maintenance', 'View history', 'Create work orders'],
      },
    };
    
    // Find matching navigation info
    const lowerFeature = feature.toLowerCase();
    let navInfo = null;
    
    for (const [key, info] of Object.entries(navigationMap)) {
      if (lowerFeature.includes(key) || key.includes(lowerFeature)) {
        navInfo = info;
        break;
      }
    }
    
    if (!navInfo) {
      navInfo = {
        message: `I couldn't find the exact location for "${feature}"`,
        suggestion: 'Try checking these main areas:',
        mainAreas: [
          'Dashboard - Overview and KPIs',
          'Master Data - Core system configuration',
          'Operations - Production, Quality, Maintenance',
          'Supply Chain - Procurement, Inventory, Logistics',
          'Finance - Accounting and financial management',
          'Sales - Customer and order management',
          'Reports - Analytics and reporting',
        ],
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(navInfo, null, 2),
        },
      ],
    };
  },
};

export const erpHelpTools = [
  erpHelpHandler,
  userManagementHandler,
  navigationGuideHandler,
];