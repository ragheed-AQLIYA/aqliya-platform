const { Client } = require('pg')
const bcrypt = require('bcryptjs')

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/aqliya'
})

async function main() {
  await client.connect()
  
  const users = [
    { email: 'admin@pilot.local', password: 'admin123' },
    { email: 'viewer@pilot.local', password: 'viewer123' },
    { email: 'viewer@other.local', password: 'other123' },
  ]
  
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10)
    const res = await client.query(
      `UPDATE "User" SET "passwordHash" = $1 WHERE email = $2`,
      [hash, u.email]
    )
    if (res.rowCount > 0) {
      console.log(`✅ Set password for ${u.email}`)
    } else {
      console.log(`❌ User not found: ${u.email}`)
    }
  }
  
  await client.end()
}

main().catch(err => { console.error(err); process.exit(1) })
