import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg("postgresql://postgres:postgres@localhost:5432/aqliya?schema=public");
const prisma = new PrismaClient({ adapter });

const tables = await prisma.$queryRawUnsafe(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
);
console.log(tables.map(t => t.table_name).join("\n"));
await prisma.$disconnect();
