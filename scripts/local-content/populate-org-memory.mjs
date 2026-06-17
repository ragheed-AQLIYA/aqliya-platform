// Populate org memory for existing rejected suggestions
// npx tsx --env-file .env scripts/local-content/populate-org-memory.mjs

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const p = new PrismaClient({
  adapter: new PrismaPg("postgresql://postgres:postgres@localhost:5432/aqliya?schema=public"),
});

const ORG_ID = "cmqhcenx40000fopq7rpt4o31";

// Get the workbook line codes from rejected suggestions
const codes = await p.lcPatternSuggestion.findMany({
  where: { organizationId: ORG_ID },
  distinct: ["workbookLineCode"],
  select: { workbookLineCode: true },
});

console.log("Distinct workbook line codes:", codes.length);
let ok = 0;
let fail = 0;

for (const c of codes) {
  const code = c.workbookLineCode || "UNKNOWN";
  try {
    const result = await p.lcOrganizationMatchMemory.upsert({
      where: {
        organizationId_workbookLineCode_accountCode: {
          organizationId: ORG_ID,
          workbookLineCode: code,
          accountCode: code,
        },
      },
      update: {
        manualOverride: true,
        overrideReason: "Batch: all suggestions rejected (generic AI content)",
      },
      create: {
        organizationId: ORG_ID,
        workbookLineCode: code,
        accountCode: code,
        accountName: "Workbook line: " + code,
        previousResult: "Generic AI output — all suggestions rejected",
        manualOverride: true,
        overrideReason: "Batch: all suggestions rejected (generic AI content)",
      },
    });
    console.log("OK " + code + ": id=" + result.id);
    ok++;
  } catch (err) {
    console.error("FAIL " + code + ": " + (err instanceof Error ? err.message : String(err)));
    fail++;
  }
}

console.log("\nSummary: " + ok + " ok, " + fail + " fail");

const count = await p.lcOrganizationMatchMemory.count({ where: { organizationId: ORG_ID } });
console.log("Total org memory: " + count);

await p.$disconnect();
