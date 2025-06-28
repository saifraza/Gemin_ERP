-- Make saif user a SUPER_ADMIN
-- This will allow seeing all companies and users across the system

UPDATE "User" 
SET role = 'SUPER_ADMIN'
WHERE username = 'saif';

-- Verify the update
SELECT id, username, name, email, role, "companyId"
FROM "User"
WHERE username = 'saif';

-- After running this, log out and log back in to see all companies