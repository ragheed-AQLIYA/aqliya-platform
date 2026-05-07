const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  try {
    const users = await p.$queryRawUnsafe("SELECT email, CASE WHEN \"passwordHash\" IS NULL THEN 'NO_HASH' ELSE 'HAS_HASH' END as pw FROM \"User\" WHERE email LIKE '%pilot%' OR email LIKE '%other%'");
    console.log(JSON.stringify(users, null, 2));
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await p.$disconnect();
  }
}
main();
