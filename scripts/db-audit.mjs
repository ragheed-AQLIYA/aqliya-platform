import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function audit() {
  try {
    console.log('=== DATABASE AUDIT REPORT ===\n');

    // 1. DATABASE_URL (redacted)
    const url = process.env.DATABASE_URL || 'NOT SET';
    const masked = url.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
    console.log('1. DATABASE_URL:', masked);

    console.log('');

    // 2. pgvector extension
    const extResult = await prisma.$queryRawUnsafe(
      "SELECT extname FROM pg_extension WHERE extname='vector';"
    );
    console.log("2. pgvector extension status (SELECT extname FROM pg_extension WHERE extname='vector'):");
    if (extResult.length > 0) {
      console.log('   FOUND: extname =', extResult[0].extname);
    } else {
      console.log('   NOT FOUND - vector extension is NOT installed');
    }

    console.log('');

    // 3. DocumentChunk table
    const tableResult = await prisma.$queryRawUnsafe(
      "SELECT table_name FROM information_schema.tables WHERE table_name='DocumentChunk';"
    );
    console.log("3. DocumentChunk table (SELECT table_name FROM information_schema.tables WHERE table_name='DocumentChunk'):");
    if (tableResult.length > 0) {
      console.log('   FOUND: table_name =', tableResult[0].table_name);
    } else {
      console.log('   NOT FOUND');
    }

    console.log('');

    // 4. Current database name
    const dbResult = await prisma.$queryRawUnsafe('SELECT current_database();');
    console.log('4. Current database:', dbResult[0].current_database);

    console.log('\n=== END AUDIT ===');
  } catch (err) {
    console.error('AUDIT ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

audit();
