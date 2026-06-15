/**
 * Reclassify all TB lines (ERP hints first) and rebuild mappings from scratch.
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5434/aqliya?schema=public";

import XLSX from "xlsx";

const engagementId = process.argv[2] ?? "eng-gulf-2025";
const tbFile =
  process.argv[3] ?? "c:\\Users\\PC\\Downloads\\TB 31-12-2025 Final.xlsx";

const { prisma } = await import("../src/lib/prisma.ts");
const { classifyTrialBalanceRows, parseErpStatementSide } = await import(
  "../src/lib/tb-intelligence/engine.ts"
);
const { confirmAllSuggestedMappings } = await import(
  "../src/lib/audit/services.ts"
);

const engagement = await prisma.auditEngagement.findUnique({
  where: { id: engagementId },
  select: { organizationId: true },
});
if (!engagement) process.exit(1);

const auditOrg = await prisma.auditOrganization.findUnique({
  where: { id: engagement.organizationId },
  select: { platformOrganizationId: true },
});
const orgId = auditOrg?.platformOrganizationId ?? engagement.organizationId;

const tb = await prisma.auditTrialBalance.findFirst({
  where: { engagementId },
  orderBy: { createdAt: "desc" },
  include: { lines: true },
});
if (!tb) process.exit(1);

const wb = XLSX.readFile(tbFile);
const sheetRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
  defval: "",
});
const hintKeys = Object.keys(sheetRows[0] ?? {}).filter((k) =>
  /^mapping\s*\d/i.test(k.trim()),
);
const bsKey = Object.keys(sheetRows[0] ?? {}).find((k) => k.includes("BS/IS"));
const hintsByCode = new Map();
for (const r of sheetRows) {
  const code = String(r["رقم الحساب"] ?? "").trim();
  if (!code) continue;
  hintsByCode.set(code, {
    hints: hintKeys.map((k) => String(r[k] ?? "").trim()).filter(Boolean),
    erpStatementSide: parseErpStatementSide(bsKey ? String(r[bsKey] ?? "") : ""),
  });
}

await prisma.auditAccountMapping.deleteMany({ where: { engagementId } });
await prisma.leadScheduleLine.deleteMany({
  where: { leadSchedule: { engagementId } },
});
await prisma.leadSchedule.deleteMany({ where: { engagementId } });

const rows = tb.lines.map((l) => {
  const meta = hintsByCode.get(l.accountCode) ?? { hints: [], erpStatementSide: undefined };
  return {
    accountCode: l.accountCode,
    accountName: l.accountName,
    debitAmount: l.debitAmount,
    creditAmount: l.creditAmount,
    classificationHints: meta.hints,
    erpStatementSide: meta.erpStatementSide,
  };
});

const classified = await classifyTrialBalanceRows(orgId, engagementId, rows, {
  enableCloudAi: false,
});

let created = 0;
let unmapped = 0;
for (const item of classified) {
  if (!item.classification?.canonicalAccountId) {
    unmapped++;
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

const { confirmedCount } = await confirmAllSuggestedMappings(engagementId);
console.log(
  JSON.stringify({ lines: tb.lines.length, created, unmapped, confirmedCount }, null, 2),
);

await prisma.$disconnect();
