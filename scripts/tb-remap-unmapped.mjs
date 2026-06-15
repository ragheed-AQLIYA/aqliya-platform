/**
 * Classify and create mappings for TB lines missing account mappings.
 *
 * Usage:
 *   npx tsx -r ./scripts/mock-server-only.cjs scripts/tb-remap-unmapped.mjs [engagementId] [tbXlsxPath]
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5434/aqliya?schema=public";

import XLSX from "xlsx";

const engagementId = process.argv[2] ?? "eng-gulf-2025";
const tbFile =
  process.env.TB_FILE ?? process.argv[3];
if (!tbFile) {
  console.error("TB file required: set TB_FILE env or pass as third CLI argument.");
  process.exit(1);
}

const { prisma } = await import("../src/lib/prisma.ts");
const { classifyTrialBalanceRows } = await import(
  "../src/lib/tb-intelligence/engine.ts"
);
const { confirmAllSuggestedMappings } = await import(
  "../src/lib/audit/services.ts"
);

const engagement = await prisma.auditEngagement.findUnique({
  where: { id: engagementId },
  select: { organizationId: true },
});
if (!engagement) {
  console.error(`Engagement not found: ${engagementId}`);
  process.exit(1);
}

const auditOrg = await prisma.auditOrganization.findUnique({
  where: { id: engagement.organizationId },
  select: { platformOrganizationId: true },
});
const orgId = auditOrg?.platformOrganizationId ?? engagement.organizationId;

const mappedCodes = new Set(
  (
    await prisma.auditAccountMapping.findMany({
      where: { engagementId },
      select: { sourceAccountCode: true },
    })
  ).map((m) => m.sourceAccountCode),
);

const tb = await prisma.auditTrialBalance.findFirst({
  where: { engagementId },
  orderBy: { createdAt: "desc" },
  include: { lines: true },
});
if (!tb) {
  console.error("No trial balance found");
  process.exit(1);
}

const wb = XLSX.readFile(tbFile);
const sheetRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
  defval: "",
});
const hintKeys = Object.keys(sheetRows[0] ?? {}).filter((k) =>
  /^mapping\s*\d/i.test(k.trim()),
);
const hintsByCode = new Map();
for (const r of sheetRows) {
  const code = String(r["رقم الحساب"] ?? "").trim();
  if (!code) continue;
  hintsByCode.set(
    code,
    hintKeys.map((k) => String(r[k] ?? "").trim()).filter(Boolean),
  );
}

const unmappedLines = tb.lines.filter((l) => !mappedCodes.has(l.accountCode));
console.log(`Remapping ${unmappedLines.length} unmapped accounts...`);

const rows = unmappedLines.map((l) => ({
  accountCode: l.accountCode,
  accountName: l.accountName,
  debitAmount: l.debitAmount,
  creditAmount: l.creditAmount,
  classificationHints: hintsByCode.get(l.accountCode) ?? [],
}));

const classified = await classifyTrialBalanceRows(orgId, engagementId, rows, {
  enableCloudAi: false,
});

let created = 0;
let stillUnmapped = 0;
for (const item of classified) {
  if (!item.classification?.canonicalAccountId) {
    stillUnmapped++;
    console.log(
      `  skip ${item.row.accountCode} — ${item.row.accountName} (no classification)`,
    );
    continue;
  }
  const canonical = await prisma.auditCanonicalAccount.findUnique({
    where: { id: item.classification.canonicalAccountId },
  });
  await prisma.auditAccountMapping.create({
    data: {
      engagementId,
      sourceAccountId: `src-${engagementId}-${item.row.accountCode}`,
      sourceAccountCode: item.row.accountCode,
      sourceAccountName: item.row.accountName,
      debitAmount: item.row.debitAmount,
      creditAmount: item.row.creditAmount,
      canonicalAccountId: item.classification.canonicalAccountId,
      confidence: item.classification.confidence,
      mappingType: "ai_suggested",
      status: "pending",
      statementClassification: canonical?.category ?? null,
    },
  });
  created++;
}

console.log(`Created ${created} mappings, ${stillUnmapped} still unmapped`);

const { confirmedCount } = await confirmAllSuggestedMappings(engagementId);
console.log(`Confirmed ${confirmedCount} pending mappings`);

await prisma.$disconnect();
