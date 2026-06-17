import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: resolve(__dirname, "../.env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

async function main() {
  console.log("DATABASE_URL host:", url.replace(/:[^:@]+@/, ":***@"));

  const migrations = await prisma.$queryRaw<
    { migration_name: string; finished: boolean; rolled_back: boolean }[]
  >`
    SELECT migration_name,
           finished_at IS NOT NULL AS finished,
           rolled_back_at IS NOT NULL AS rolled_back
    FROM "_prisma_migrations"
    ORDER BY started_at
  `;
  console.log("\n=== _prisma_migrations ===");
  for (const row of migrations) {
    console.log(
      `${row.migration_name}\tfinished=${row.finished}\trolled_back=${row.rolled_back}`,
    );
  }

  const userCols = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'User'
    ORDER BY ordinal_position
  `;
  console.log("\n=== User columns in DB ===");
  console.log(userCols.map((c) => c.column_name).join(", "));

  const mfa = ["mfaEnabled", "mfaSecret", "mfaBackupCodes"];
  for (const col of mfa) {
    const inDb = userCols.some((c) => c.column_name === col);
    console.log(`  ${col}: ${inDb ? "YES" : "MISSING"}`);
  }

  const salesTables = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name LIKE 'Sales%'
    ORDER BY table_name
  `;
  console.log("\n=== Sales* tables in DB ===");
  console.log(salesTables.map((t) => t.table_name).join(", ") || "(none)");

  const expectedSales = [
    "SalesPipeline",
    "SalesPipelineStage",
    "SalesAccount",
    "SalesDeal",
    "SalesInteraction",
    "SalesEvidenceLink",
    "SalesContact",
    "SalesProposal",
    "SalesReview",
    "SalesApproval",
    "SalesAuditEvent",
  ];
  for (const name of expectedSales) {
    const exists = salesTables.some((t) => t.table_name === name);
    if (!exists) console.log(`  MISSING table: ${name}`);
  }

  const l5Row = migrations.find(
    (m) => m.migration_name === "20260601180000_salesos_l5_governance",
  );
  console.log("\n=== l5_governance in _prisma_migrations ===");
  console.log(l5Row ?? "not found");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
