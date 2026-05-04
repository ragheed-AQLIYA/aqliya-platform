require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
console.log('DATABASE_URL:', process.env.DATABASE_URL)

const { PrismaClient } = require('@prisma/client')

// Try different options
const options = [
  { url: process.env.DATABASE_URL },
  { datasourceUrl: process.env.DATABASE_URL },
  { datasourceUrl: { url: process.env.DATABASE_URL } },
]

for (const opt of options) {
  try {
    console.log('Trying:', JSON.stringify(opt))
    const prisma = new PrismaClient(opt)
    console.log('Success with:', JSON.stringify(opt))
    break
  } catch (e) {
    console.log('Failed:', e.message.substring(0, 100))
  }
}
