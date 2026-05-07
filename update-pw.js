const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const users = [
    { email: 'admin@pilot.local', pw: 'admin123' },
    { email: 'viewer@pilot.local', pw: 'viewer123' },
    { email: 'viewer@other.local', pw: 'other123' }
  ]
  
  for (const u of users) {
    const hash = await bcrypt.hash(u.pw, 10)
    const result = await prisma.$executeRaw`
      UPDATE "User" SET "passwordHash" = ${hash} WHERE email = ${u.email}
    `
    console.log(u.email, 'updated:', result)
  }
  
  // Verify
  const check = await prisma.$queryRaw`
    SELECT email, "passwordHash" FROM "User" WHERE email LIKE '%pilot%' OR email LIKE '%other%'
  `
  console.log('Verification:', check)
  
  await prisma.$disconnect()
}

main().catch(e => console.error(e))
