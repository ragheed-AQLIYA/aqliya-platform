SELECT email, CASE WHEN "passwordHash" IS NULL THEN 'NULL' ELSE 'SET' END as hash_status FROM "User" WHERE email LIKE '%pilot%';
