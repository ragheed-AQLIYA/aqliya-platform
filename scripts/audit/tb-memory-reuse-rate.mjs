#!/usr/bin/env node
/**
 * TB Firm Memory — reuse rate KPI scaffold.
 *
 * memory_reuse_rate = classifications_with_firm_memory_hit / total_classifications
 *
 * Usage:
 *   node scripts/tb-memory-reuse-rate.mjs [--engagement eng-shalfa-2025]
 */
import { config } from "dotenv";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../.env") });

process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";

const args = process.argv.slice(2);
const engagementIdx = args.indexOf("--engagement");
const ENGAGEMENT_ID =
  engagementIdx >= 0 ? args[engagementIdx + 1] : process.env.ENGAGEMENT_ID ?? "eng-shalfa-2025";

async function main() {
  const { prisma } = await import("../../src/lib/prisma.ts");

  const history = await prisma.tBClassificationHistory.findMany({
    where: { engagementId: ENGAGEMENT_ID },
    orderBy: { createdAt: "desc" },
    select: { accountCode: true, source: true, createdAt: true },
  });

  const latestByCode = new Map();
  for (const row of history) {
    if (!latestByCode.has(row.accountCode)) latestByCode.set(row.accountCode, row);
  }

  let total = latestByCode.size;
  let memoryHits = 0;
  for (const row of latestByCode.values()) {
    if (row.source === "firm_memory") memoryHits++;
  }

  const reuseRate = total > 0 ? memoryHits / total : 0;

  const artifact = {
    kpi: "memory_reuse_rate",
    engagementId: ENGAGEMENT_ID,
    measuredAt: new Date().toISOString(),
    totalClassifiedAccounts: total,
    firmMemoryHits: memoryHits,
    reuseRate,
    note: "Uses latest TBClassificationHistory source per account. Client 2+ baseline TBD.",
  };

  const outDir = resolve(__dirname, "../../docs/audits/evidence");
  mkdirSync(outDir, { recursive: true });
  const jsonPath = resolve(outDir, "tb-memory-reuse-rate.json");
  writeFileSync(jsonPath, JSON.stringify(artifact, null, 2));

  console.log("=== TB Memory Reuse Rate ===");
  console.log(`engagement: ${ENGAGEMENT_ID}`);
  console.log(`reuse rate: ${(reuseRate * 100).toFixed(1)}% (${memoryHits}/${total})`);
  console.log(`artifact: ${jsonPath}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
