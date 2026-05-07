const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Check if users exist and have password hash
  const users = await prisma.$queryRaw`
    SELECT id, email, "passwordHash" FROM "User" WHERE email LIKE '%pilot%' OR email LIKE '%other%'
  `
  
  console.log('Users found:', JSON.stringify(users, null, 2))
  
  // Update password hashes
  const passwords = [
    { email: 'admin@pilot.local', pw: 'admin123' },
    { email: 'viewer@pilot.local', pw: 'viewer123' },
    { email: 'viewer@other.local', pw: 'other123' }
  ]
  
  for (const u of passwords) {
    const hash = await bcrypt.hash(u.pw, 10)
    await prisma.$executeRaw`
      UPDATE "User" SET "passwordHash" = ${hash} WHERE email = ${u.email}
    `
    console.log(`Updated ${u.email}`)
  }
  
  // Verify
  const verify = await prisma.$queryRaw`
    SELECT email, CASE WHEN "passwordHash" IS NULL THEN 'NULL' ELSE 'SET' END as hash_status FROM "User" WHERE email LIKE '%pilot%' OR email LIKE '%other%'
  `
  console.log('Verification:', JSON.stringify(verify, null, 2))
  
  await prisma.$disconnect()
}

main().catch(e => console.error(e))
