SELECT email, CASE WHEN "passwordHash" IS NULL THEN 'NO_HASH' ELSE 'HAS_HASH' END as pw FROM "User" WHERE email LIKE '%pilot%' OR email LIKE '%other%';
