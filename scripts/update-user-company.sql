-- First, let's see all companies
SELECT id, name, code FROM "Company";

-- Find the Mahakaushal company ID
-- Based on the Railway screenshot, it should be: cmcgica9700017nyhlw3r1kb1

-- Update saif user to the correct company
UPDATE "User" 
SET "companyId" = 'cmcgica9700017nyhlw3r1kb1'
WHERE username = 'saif';

-- Verify the update
SELECT u.id, u.username, u.name, u.email, c.name as company_name, c.code as company_code
FROM "User" u
JOIN "Company" c ON u."companyId" = c.id
WHERE u.username = 'saif';

-- Optional: Delete Test Company and all its users (BE CAREFUL!)
-- DELETE FROM "Company" WHERE code = 'TEST001';
-- This will cascade delete all users associated with Test Company