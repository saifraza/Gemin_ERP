# Modern ERP Architecture

## Overview
This document describes the current architecture of the Modern ERP system after simplification and cleanup.

## Current State

### Frontend (Web Application)
The frontend has been simplified to focus on core functionality:

1. **Dashboard** (`/dashboard`)
   - Main landing page after login
   - Shows key performance indicators (KPIs)
   - Professional UI with grid layout
   - AI Assistant integration (MCP)

2. **Master Data** (`/master-data`)
   - Central hub for managing all reference data
   - Includes: Products, Customers, Suppliers, etc.
   - Clean tabular interface with search and filters

3. **System Test** (`/system-test`)
   - Health check page for all microservices
   - Shows real-time status of:
     - API Gateway
     - Core API
     - MCP Orchestrator
     - Database Connection
   - Architecture overview display

### Removed Modules
The following modules were removed to simplify the system:
- Production
- Quality
- Maintenance
- Procurement
- Finance
- Sales
- Inventory
- HR

These can be re-added in the future as needed.

## Microservices Architecture

### 1. API Gateway (Port 4000)
- Central entry point for all API requests
- Handles authentication and authorization
- Routes requests to appropriate services
- WebSocket support for real-time updates
- PostgreSQL-based rate limiting

### 2. Core API (Port 3001)
- Main business logic service
- User and company management
- Authentication (JWT-based)
- Master data operations
- PostgreSQL database operations

### 3. MCP Orchestrator (Port 3000)
- AI/LLM integration service
- Model Context Protocol implementation
- Multi-model support (Gemini, Claude, GPT-4, DeepSeek)
- Factory-specific AI tools
- Cost-optimized model selection

### 4. Event Processor (Port 3006)
- Asynchronous event handling
- Background job processing
- Scheduled tasks
- Event-driven architecture

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **State Management**: React hooks and context
- **API Communication**: Fetch API with JWT authentication

### Backend
- **Runtime**: Node.js
- **Framework**: Hono (lightweight, fast)
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: PostgreSQL-based cache (Redis removed)
- **Authentication**: JWT tokens
- **API Documentation**: OpenAPI/Swagger ready

### Infrastructure
- **Deployment**: Railway
- **Database**: Railway PostgreSQL
- **Environment**: Production-ready with proper env configuration

## Key Features

### Authentication & Security
- JWT-based authentication
- Role-based access control (Admin, Manager, User)
- Multi-tenant support (Company-based isolation)
- Secure password hashing

### UI/UX
- Professional, clean design
- Fast keyboard navigation
- Responsive layout
- Consistent styling across pages
- Light theme (no dark mode)

### System Health
- Built-in health check endpoints
- System test page for monitoring
- Real-time service status
- Database connectivity checks

## Testing the System

### Access the System Test Page
1. Login to the ERP system
2. Navigate to System > System Test in the sidebar
3. View real-time health status of all services
4. Click "Rerun Health Checks" to refresh

### API Health Endpoints
- API Gateway: `/health`
- Core API: `/api/health`
- MCP Orchestrator: `/api/mcp/health`
- Database Status: `/api/system/database`

## Future Enhancements

### Planned Features
1. Re-introduce modules based on business needs
2. Advanced reporting and analytics
3. Mobile application
4. Integration with external systems
5. Advanced AI features for predictive analytics

### Architecture Improvements
1. Implement message queue for better scalability
2. Add caching layer for improved performance
3. Implement GraphQL for flexible data queries
4. Add comprehensive logging and monitoring

## Development Guidelines

### Code Organization
- Keep modules focused and single-purpose
- Use TypeScript for type safety
- Follow consistent naming conventions
- Write clean, self-documenting code

### API Design
- RESTful endpoints
- Consistent error handling
- Proper HTTP status codes
- JSON request/response format

### Database Design
- Normalized schema
- Proper indexes for performance
- Use migrations for schema changes
- Regular backups

## Deployment

### Railway Configuration
- Each service deployed as separate Railway service
- Environment variables properly configured
- Internal networking for service communication
- Automatic deployments from GitHub

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection
- `JWT_SECRET`: Authentication secret
- `NEXT_PUBLIC_API_URL`: API endpoint for frontend
- Service-specific URLs for internal communication

## Conclusion

The Modern ERP system has been simplified to focus on core functionality while maintaining a scalable microservices architecture. The system is production-ready with proper authentication, health monitoring, and a clean professional UI. Additional modules can be added as business requirements evolve.