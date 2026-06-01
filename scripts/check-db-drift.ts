import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg(process.env.DATABASE_URL!),
  });

  try {
    const cols = await prisma.$queryRaw<
      { column_name: string }[]
    >`SELECT column_name FROM information_schema.columns WHERE table_name = 'SunbulClient' ORDER BY column_name`;
    console.log("SunbulClient columns:", cols.map((c) => c.column_name).join(", "));

    const sales = await prisma.$queryRaw<
      { tablename: string }[]
    >`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'Sales%' ORDER BY tablename`;
    console.log("Sales tables:", sales.map((t) => t.tablename).join(", "));

    try {
      const mig = await prisma.$queryRaw<
        { c: number }[]
      >`SELECT COUNT(*)::int as c FROM _prisma_migrations`;
      console.log("Migration history rows:", mig[0]?.c);
    } catch {
      console.log("Migration history: _prisma_migrations missing");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
