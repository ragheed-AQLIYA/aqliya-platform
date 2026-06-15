/**
 * Phase 8.1 — upsert canonical COA expansion + optional pilot remaps.
 *
 * Usage:
 *   node scripts/coa-phase-81-upsert.mjs
 *   node scripts/coa-phase-81-upsert.mjs --remap eng-gulf-2025
 */
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const PHASE_81_ACCOUNTS = [
  {
    id: "ca-24",
    code: "CA-1070",
    name: "Right-of-Use Assets",
    category: "Non-Current Assets",
    statementType: "balance_sheet",
    displayOrder: 215,
  },
  {
    id: "ca-25",
    code: "CA-1071",
    name: "ROU Accumulated Depreciation",
    category: "Non-Current Assets",
    statementType: "balance_sheet",
    displayOrder: 216,
  },
  {
    id: "ca-26",
    code: "CA-1080",
    name: "Contract Assets",
    category: "Current Assets",
    statementType: "balance_sheet",
    displayOrder: 135,
  },
  {
    id: "ca-31",
    code: "CA-2035",
    name: "Zakat Provision",
    category: "Current Liabilities",
    statementType: "balance_sheet",
    displayOrder: 325,
  },
  {
    id: "ca-27",
    code: "CA-2110",
    name: "Lease Liabilities - Current",
    category: "Current Liabilities",
    statementType: "balance_sheet",
    displayOrder: 335,
  },
  {
    id: "ca-28",
    code: "CA-2120",
    name: "Lease Liabilities - Non-Current",
    category: "Non-Current Liabilities",
    statementType: "balance_sheet",
    displayOrder: 350,
  },
  {
    id: "ca-29",
    code: "CA-2130",
    name: "Long-Term Debt",
    category: "Non-Current Liabilities",
    statementType: "balance_sheet",
    displayOrder: 360,
  },
  {
    id: "ca-30",
    code: "CA-2140",
    name: "Deferred Tax",
    category: "Non-Current Liabilities",
    statementType: "balance_sheet",
    displayOrder: 370,
  },
  {
    id: "ca-32",
    code: "CA-3030",
    name: "Actuarial Reserve",
    category: "Equity",
    statementType: "balance_sheet",
    displayOrder: 415,
  },
  {
    id: "ca-33",
    code: "CA-3040",
    name: "OCI Reserve",
    category: "Equity",
    statementType: "balance_sheet",
    displayOrder: 420,
  },
];

/** Known pilot mis-maps from TB closing adjustment analysis. */
const PILOT_REMAPS = {
  "1301010011": "CA-1070",
  "2302010009": "CA-1071",
  "2108020001": "CA-2130",
  "2104010001": "CA-2020",
  "1106010021": "CA-1080",
  "3101020005": "CA-5070",
  "3101070021": "CA-2050",
  "3101070045": "CA-2050",
  "3204010091": "CA-5010",
  "2303010003": "CA-2035",
  "2303020009": "CA-3030",
};

async function upsertAccounts() {
  let upserted = 0;
  for (const row of PHASE_81_ACCOUNTS) {
    await prisma.auditCanonicalAccount.upsert({
      where: { code: row.code },
      create: row,
      update: {
        name: row.name,
        category: row.category,
        statementType: row.statementType,
        displayOrder: row.displayOrder,
      },
    });
    upserted += 1;
  }
  return upserted;
}

async function remapEngagement(engagementId) {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
  });
  if (!engagement) {
    console.warn(`Engagement not found: ${engagementId}`);
    return 0;
  }

  const canonicalByCode = new Map(
    (
      await prisma.auditCanonicalAccount.findMany({
        where: { code: { in: Object.values(PILOT_REMAPS) } },
      })
    ).map((a) => [a.code, a]),
  );

  let updated = 0;
  for (const [sourceCode, targetCode] of Object.entries(PILOT_REMAPS)) {
    const canonical = canonicalByCode.get(targetCode);
    if (!canonical) {
      console.warn(`Missing canonical ${targetCode} — run upsert first`);
      continue;
    }
    const result = await prisma.auditAccountMapping.updateMany({
      where: { engagementId, sourceAccountCode: sourceCode },
      data: {
        canonicalAccountId: canonical.id,
        statementClassification: canonical.category,
        mappingType: "manual_reclass",
        status: "confirmed",
      },
    });
    updated += result.count;
  }
  return updated;
}

async function main() {
  const remapArg = process.argv.includes("--remap");
  const engagementId = process.argv[process.argv.indexOf("--remap") + 1];

  const count = await upsertAccounts();
  console.log(`Phase 8.1: upserted ${count} canonical accounts.`);

  if (remapArg && engagementId) {
    const remapped = await remapEngagement(engagementId);
    console.log(`Remapped ${remapped} mapping rows on ${engagementId}.`);
  }

  const total = await prisma.auditCanonicalAccount.count();
  console.log(`Total canonical accounts in DB: ${total}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
