# RBAC Permission Issue Fix Summary

## Issue Description
The Master Data page was showing 0 companies, 0 users, and 0 business units even after refresh. This was caused by a mismatch between the permission codes used in the RBAC middleware and the actual permissions seeded in the database.

## Root Cause
1. The `company-paginated.ts` routes were using convenience methods like `requireRead()` which were hardcoded to check for `COMPANIES_READ` permission
2. The seed data creates permissions with the pattern `{MODULE_CODE}_{ACTION}` where companies is a sub-module under Master Data
3. The actual permission code in the database is `COMPANIES_READ` (for the sub-module), but the convenience methods were looking for the exact same code

## Changes Made

### 1. Updated Company Routes (`services/core-api/src/routes/company-paginated.ts`)
- Changed from using hardcoded convenience methods (`requireRead()`, `requireCreate()`, etc.)
- Now uses `requireModulePermission('COMPANIES', 'READ')` which correctly builds the permission code

### 2. Updated Division Routes (`services/core-api/src/routes/division.ts`)
- Added RBAC middleware import
- Added permission checks for all division endpoints using `requireModulePermission('DIVISIONS', 'READ')`

### 3. Created Debug Script (`debug-api.js`)
A debug script to help troubleshoot API and permission issues:
```bash
node debug-api.js YOUR_AUTH_TOKEN
```

## How the Permission System Works

### Permission Code Pattern
- Module permissions: `{MODULE_CODE}_{ACTION}` (e.g., `MASTER_DATA_READ`)
- Sub-module permissions: `{SUBMODULE_CODE}_{ACTION}` (e.g., `COMPANIES_READ`)

### Seed Data Creates These Permissions
- `MASTER_DATA_CREATE`, `MASTER_DATA_READ`, etc. (for the module)
- `COMPANIES_CREATE`, `COMPANIES_READ`, etc. (for the sub-module)
- `BUSINESS_UNITS_CREATE`, `BUSINESS_UNITS_READ`, etc.
- `DIVISIONS_CREATE`, `DIVISIONS_READ`, etc.
- `USERS_CREATE`, `USERS_READ`, etc.

### API Routes Now Use Correct Permissions
- `/api/companies` - requires `COMPANIES_READ`
- `/api/users` - requires `USERS_READ` 
- `/api/factories` - requires `BUSINESS_UNITS_READ`
- `/api/divisions` - requires `DIVISIONS_READ`

## Testing the Fix

1. Make sure all services are running:
   ```bash
   npm run dev
   ```

2. Login to the application

3. Navigate to Master Data page

4. If still seeing 0 records, use the debug script:
   ```bash
   # Get your auth token from browser DevTools > Application > Local Storage > auth_token
   node debug-api.js YOUR_AUTH_TOKEN
   ```

5. Check the output to see:
   - Which endpoints are returning data
   - What permissions the user has
   - Any error messages

## Common Issues and Solutions

### Issue: Still seeing 0 records
**Solution**: Check if the user has the required permissions. The debug script will show which permissions are missing.

### Issue: 403 Forbidden errors
**Solution**: The user doesn't have the required permission. Either:
1. Assign the appropriate role to the user
2. Grant the specific permission to the user
3. Check if the permission scope matches (GLOBAL, COMPANY, FACTORY, etc.)

### Issue: 401 Unauthorized
**Solution**: The JWT token is invalid or expired. Try logging out and logging in again.

## Next Steps

If the issue persists after these changes:

1. Check the database to ensure permissions are properly seeded:
   ```sql
   SELECT * FROM "Permission" WHERE code LIKE '%READ%';
   ```

2. Check user roles and permissions:
   ```sql
   SELECT u.email, r.name as role_name, p.code as permission_code
   FROM "User" u
   JOIN "UserRole" ur ON u.id = ur."userId"
   JOIN "RoleDefinition" r ON ur."roleId" = r.id
   JOIN "RolePermission" rp ON r.id = rp."roleId"
   JOIN "Permission" p ON rp."permissionId" = p.id
   WHERE u.email = 'your-email@example.com';
   ```

3. Use the RBAC management UI in the Access Control tab to assign roles and permissions to users.