require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
console.log('DATABASE_URL:', process.env.DATABASE_URL)

const { PrismaClient } = require('@prisma/client')
console.log('PrismaClient loaded')

try {
  const prisma = new PrismaClient()
  console.log('PrismaClient created successfully')
} catch (e) {
  console.error('Error creating PrismaClient:', e.message)
}
