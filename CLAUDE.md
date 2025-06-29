# Claude AI Assistant Context

## MCP Integration Status

### API Keys Configured
- **Gemini API Key**: ✅ [Configured in Railway environment]
- **Claude API Key**: ✅ [Configured in Railway environment]
- **OpenAI API Key**: ✅ [Configured in Railway environment]
- **DeepSeek API Key**: ✅ [Configured in Railway environment]

### LLM Router Implementation
- Multi-model support (Gemini, Claude, GPT-4, DeepSeek)
- Intelligent auto-selection based on task type
- DeepSeek selected for code generation and cost optimization
- Fallback mechanisms for reliability
- Cost optimization logic

### MCP Tools Status
- `factory_status`: ✅ Implemented with real data
- `production_forecast`: 🚧 Mock implementation
- `anomaly_detector`: 🚧 Mock implementation
- Additional tools pending implementation

### AI Chat Component
- Added to dashboard at `/dashboard`
- Supports model selection (auto, gemini, claude)
- WebSocket ready for real-time communication
- Context-aware conversations

## Railway Deployment Rules

### IMPORTANT: Use Railway Environment Variables
1. **Always use environment variables** - Set service URLs in Railway dashboard
2. **Railway handles internal URLs** - Just set `CORE_API_URL=http://core-api:8080`
3. **Don't hardcode Railway URLs** - Let Railway manage the internal networking
4. **Localhost fallbacks are OK** - Use `|| 'http://localhost:3000'` for local dev

### Railway Internal Networking
- Railway uses IPv6 for internal networking
- Internal hostnames follow pattern: `service-name.railway.internal`
- No port specification needed for internal URLs
- Service names in Railway dashboard determine the internal hostname
- **IMPORTANT**: All services must bind to `::` (IPv6) instead of `0.0.0.0` (IPv4)
  - Hono: `hostname: '::'`
  - Express: `app.listen(port, '::', ...)`

### Example (CORRECT):
```javascript
const services = {
  core: process.env.CORE_API_URL || 'http://localhost:3001',
  mcp: process.env.MCP_ORCHESTRATOR_URL || 'http://localhost:3000',
  eventProcessor: process.env.EVENT_PROCESSOR_URL || 'http://localhost:3006',
};
```

### Example (WRONG):
```javascript
// DON'T DO THIS - Don't hardcode Railway URLs!
const services = {
  core: process.env.RAILWAY_ENVIRONMENT ? 'http://core-api.railway.internal:8080' : 'http://localhost:3001',
  mcp: process.env.RAILWAY_ENVIRONMENT ? 'http://mcp-orchestrator.railway.internal:8080' : 'http://localhost:3000',
};
```

## Project Architecture

### Microservices
1. **API Gateway** (`/services/api-gateway`) - Express server that proxies requests
2. **Core API** (`/services/core-api`) - Main business logic, user/company management
3. **MCP Orchestrator** (`/services/mcp-orchestrator`) - AI assistant integration
4. **Event Processor** (`/services/event-processor`) - Event handling and processing
5. **Web App** (`/apps/web`) - Next.js frontend

### Database
- PostgreSQL with Prisma ORM
- Shared schema across services
- PostgreSQL-based cache implementation (replaced Redis)

### Frontend
- Next.js with TypeScript
- Tailwind CSS for styling
- Professional UI design (no dark mode)
- Fast keyboard navigation with command palette

## ERP Module Implementation Guidelines

### IMPORTANT: Follow the erp-navigation-structure.md
We have a comprehensive ERP structure defined in `erp-navigation-structure.md` with 11 major modules:
1. Financial Management
2. Supply Chain Management
3. Manufacturing
4. Human Resources Management
5. Customer Relationship Management
6. Project Management
7. Asset Management
8. Quality Management
9. Business Intelligence & Analytics
10. Specialized Modules
11. Integration & Technical Modules

### Module Implementation Process
When implementing new modules, follow this process:

#### 1. Check Navigation Structure
- Always refer to `erp-navigation-structure.md` for the exact module hierarchy
- Maintain consistent naming and URL patterns
- Example: `/finance/gl/chart-of-accounts` for Chart of Accounts under General Ledger

#### 2. Create Module Components
- **IMPORTANT**: All module pages MUST use the `DashboardLayout` component
- Copy the template from `apps/web/MODULE_PAGE_TEMPLATE.tsx`
- This ensures consistent navigation (sidebar, top header, nav bar) across all pages

```typescript
// Standard module page structure with DashboardLayout
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function ModulePage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Module Title</h1>
          <p className="text-gray-600 mt-1">Module description</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Module content */}
        </div>
      </div>
    </DashboardLayout>
  );
}
```

#### 3. Use Consistent UI Components
- Use existing card components from dashboard/master-data
- Maintain consistent styling with Tailwind classes
- Follow the professional, clean design pattern

#### 4. API Integration Pattern
```typescript
// Use the standard API fetch pattern
const response = await fetch('/api/module-endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

#### 5. State Management
- Use React hooks for local state
- Consider context for module-wide state
- Integrate with existing auth context

### Current Implementation Status
- ✅ Dashboard - Main landing page with KPIs
- ✅ Master Data - Central data management
- ✅ System Test - Health monitoring
- ✅ Navigation Structure - All modules in sidebar
- 🚧 Financial Management - To be implemented
- 🚧 Supply Chain - To be implemented
- 🚧 Manufacturing - To be implemented
- 🚧 HR Management - To be implemented
- 🚧 CRM - To be implemented
- 🚧 Other modules - To be implemented

### Module Priority Order
Based on typical ERP implementation:
1. Financial Management (GL, AP, AR)
2. Supply Chain (Procurement, Inventory)
3. Manufacturing (Production, Quality)
4. HR Management (Core HR, Payroll)
5. CRM (Sales, Service)
6. Others as needed

## Testing Commands
When code changes are made, run these commands to ensure quality:
- `npm run lint` - Check code style
- `npm run typecheck` - Check TypeScript types
- `npm test` - Run tests
- `npm run build` - Ensure build passes

## Key Decisions Made
1. **Removed Redis entirely** - Using PostgreSQL cache instead
2. **No hardcoded ports or URLs** - Everything through environment variables
3. **Express for API Gateway** - Simpler than Hono for proxy functionality
4. **Railway internal networking** - Fast communication between services
5. **Username-based login** - Users login with username, not email
6. **Company name display** - Company name shown throughout the UI where appropriate
7. **Comprehensive ERP structure** - Following industry-standard modules
8. **Professional UI** - Clean, light theme without dark mode
9. **Collapsible navigation** - Organized hierarchy with expand/collapse