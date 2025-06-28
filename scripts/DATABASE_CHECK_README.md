# Database Check Scripts

This directory contains scripts to inspect and verify the PostgreSQL database for the MSPIL ERP system.

## Available Scripts

### 1. check-db.sh (Quick Check)
A simple bash script that provides a quick overview of the database contents.

```bash
./scripts/check-db.sh
```

Features:
- Checks database connection
- Counts companies, users, and factories
- Lists basic company and user information
- Verifies environment configuration

### 2. check-database.ts (TypeScript Version)
A TypeScript implementation with type safety and detailed output.

```bash
# Run with ts-node
cd services/core-api
npx ts-node ../../scripts/check-database.ts
```

Features:
- Full type safety with TypeScript
- Detailed company, user, and factory information
- Shows relationships between entities
- Includes error handling with specific error codes

### 3. check-database.js (JavaScript Version)
A JavaScript implementation that can be run directly with Node.js.

```bash
node scripts/check-database.js
```

Features:
- No compilation required
- Comprehensive entity checking
- Summary statistics
- Admin user identification

### 4. inspect-database.js (Comprehensive Inspector)
The most detailed inspection tool with colored output and analytics.

```bash
node scripts/inspect-database.js
```

Features:
- Colored terminal output for better readability
- Database statistics dashboard
- User role distribution analysis
- Equipment status monitoring
- System health checks
- Recent activity tracking
- Time-based analytics

## Prerequisites

1. **PostgreSQL Database**: Must be running and accessible
2. **Environment Configuration**: DATABASE_URL must be set in `services/core-api/.env`
3. **Node.js**: Required for running the scripts
4. **Dependencies**: Install with `npm install` in the core-api directory

## Setting Up

1. Ensure your `.env` file exists in `services/core-api/` with:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/mspil_erp
   ```

2. Run database migrations if not already done:
   ```bash
   cd services/core-api
   npx prisma migrate deploy
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

## Expected Output

When companies exist in the database, you'll see:

```
✅ Successfully connected to database

📊 Checking Companies:
==================================================
✅ Found 1 company(ies):

1. Company: Mahakali Sugar & Power Industries Ltd
   - Code: MSPIL
   - Email: info@mspil.com
   - Phone: +977-099-520244
   - Users: 2
   - Factories: 1

📊 All Users in Database:
==================================================
✅ Found 2 user(s):

1. User: Admin User
   - Email: admin@mspil.com
   - Role: ADMIN
   - Company: Mahakali Sugar & Power Industries Ltd (MSPIL)
```

## Troubleshooting

### Database Connection Failed
- Check if PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env` file
- Check network/firewall settings

### No Companies Found
- Run the company setup through the web interface
- Check if migrations have been applied
- Verify the database name in DATABASE_URL

### Permission Errors
- Ensure database user has proper permissions
- Check file permissions on scripts (should be executable)

### Module Not Found
- Run `npm install` in the services/core-api directory
- Generate Prisma client: `npx prisma generate`

## Use Cases

1. **After Initial Setup**: Verify company and admin user creation
2. **Before Deployment**: Ensure all required entities exist
3. **Debugging**: Check database state when issues occur
4. **Monitoring**: Regular health checks of the database

## Notes

- All scripts respect the DATABASE_URL from the environment
- Scripts are read-only and won't modify any data
- Colored output works best in terminals that support ANSI colors
- For production use, consider using the inspect-database.js script for comprehensive analysis