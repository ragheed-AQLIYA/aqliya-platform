/**
 * Export AuditOS FS + compute factory accuracy metrics (read-only).
 *
 * Usage:
 *   node -r ./scripts/mock-server-only.cjs --import tsx scripts/factory-accuracy-export.mjs [engagementId]
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5434/aqliya?schema=public";

import fs from "node:fs";
import path from "node:path";

const engagementId = process.argv[2] ?? "eng-gulf-2025";
const { prisma } = await import("../src/lib/prisma.ts");
const { buildStatementLinesFromMappings, getMappingDisplayAmount } =
  await import("../src/lib/audit/db/statement-builder.ts");
const { buildCashFlowLinesFromContext, deriveCashFlowContext } = await import(
  "../src/lib/audit/fs-engine/cash-flow-builder.ts"
);

const mappings = await prisma.auditAccountMapping.findMany({
  where: { engagementId, status: "confirmed" },
  include: { canonicalAccount: true },
  orderBy: { sourceAccountCode: "asc" },
});

function buildLines(type) {
  return buildStatementLinesFromMappings(`export-${type}`, type, mappings);
}

const incomeLines = buildLines("income_statement");
const balanceLines = buildLines("balance_sheet");
const equityLines = buildLines("equity");

const cashCtx = deriveCashFlowContext({
  mappings,
  incomeStatementLines: incomeLines,
});
const cashLines = buildCashFlowLinesFromContext("export-cf", cashCtx);

function lineAmount(lines, label) {
  const exact = lines.find((l) => l.label === label);
  if (exact) return exact.amount;
  const fuzzy = lines.find((l) =>
    l.label.toLowerCase().includes(label.toLowerCase()),
  );
  return fuzzy?.amount ?? null;
}

const canonicalSums = {};
for (const m of mappings) {
  const code = m.canonicalAccount?.code;
  if (!code) continue;
  canonicalSums[code] = (canonicalSums[code] ?? 0) + getMappingDisplayAmount(m);
}

const audited = {
  revenue: 451_412_506,
  costOfRevenue: 384_959_315,
  grossProfit: 66_453_191,
  gna: 26_627_726,
  operatingProfit: 39_825_465,
  financeCosts: 12_901_271,
  otherIncome: 735_915,
  profitBeforeZakat: 27_660_109,
  zakat: 2_575_257,
  netProfit: 25_084_852,
  totalAssets: 376_138_426,
  totalEquity: 112_586_721,
  cash: 62_819_989,
};

const auditos = {
  revenue: lineAmount(incomeLines, "Revenue"),
  costOfRevenue: lineAmount(incomeLines, "Cost of Sales"),
  grossProfit: lineAmount(incomeLines, "Gross Profit"),
  operatingExpenses: lineAmount(incomeLines, "Operating Expenses"),
  operatingProfit: lineAmount(incomeLines, "Operating Profit"),
  financeCosts: lineAmount(incomeLines, "Finance Costs"),
  otherIncome: lineAmount(incomeLines, "Other Income"),
  profitBeforeZakat: lineAmount(incomeLines, "Profit Before Zakat"),
  zakat: lineAmount(incomeLines, "Zakat"),
  netProfit: lineAmount(incomeLines, "Net Profit"),
  totalAssets: lineAmount(balanceLines, "TOTAL ASSETS"),
  totalEquity: lineAmount(balanceLines, "TOTAL LIABILITIES AND EQUITY"),
  cash: lineAmount(cashLines, "Cash at End of Period"),
  plug: lineAmount(balanceLines, "TB Closing Classification Adjustments"),
};

function pctVariance(auditosVal, auditedVal) {
  if (auditedVal === 0) return null;
  return ((auditosVal - auditedVal) / Math.abs(auditedVal)) * 100;
}

function matchScore(auditosVal, auditedVal, tolerancePct = 1) {
  if (auditosVal == null || auditedVal == null) return false;
  return Math.abs(pctVariance(auditosVal, auditedVal) ?? 999) <= tolerancePct;
}

const metrics = {
  netProfitVariancePct: pctVariance(auditos.netProfit, audited.netProfit),
  netProfitMatch1Pct: matchScore(auditos.netProfit, audited.netProfit, 1),
  revenueVariancePct: pctVariance(auditos.revenue, audited.revenue),
  costVariancePct: pctVariance(auditos.costOfRevenue, audited.costOfRevenue),
};

const materialLines = [
  ["Total Assets", auditos.totalAssets, audited.totalAssets],
  ["Total Equity", auditos.totalEquity, audited.totalEquity],
  ["Cash", auditos.cash, audited.cash],
  ["Revenue", auditos.revenue, audited.revenue],
  ["Cost of Revenue", auditos.costOfRevenue, audited.costOfRevenue],
  ["Gross Profit", auditos.grossProfit, audited.grossProfit],
  ["Operating Profit", auditos.operatingProfit, audited.operatingProfit],
  ["Net Profit", auditos.netProfit, audited.netProfit],
  ["Zakat", auditos.zakat, audited.zakat],
];

const matched = materialLines.filter(([, a, b]) => matchScore(a, b, 0.5)).length;
const lineItemAccuracy = Math.round((matched / materialLines.length) * 100);

const exportPayload = {
  engagementId,
  exportedAt: new Date().toISOString(),
  engineVersion: "p10-signed-net-is",
  statements: {
    income_statement: { title: "Statement of Profit or Loss", lines: incomeLines },
    balance_sheet: { title: "Statement of Financial Position", lines: balanceLines },
    equity: { title: "Statement of Changes in Equity", lines: equityLines },
    cash_flow: { title: "Statement of Cash Flows", lines: cashLines },
  },
  canonicalSums,
  auditedReference: audited,
  auditosSummary: auditos,
  metrics,
  lineItemAccuracyPct: lineItemAccuracy,
};

const outDir = path.join("docs", "audits", "evidence");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "factory-accuracy-auditos-export-v2.json");
fs.writeFileSync(outFile, JSON.stringify(exportPayload, null, 2));

console.log(JSON.stringify({ auditos, audited, metrics, lineItemAccuracyPct: lineItemAccuracy }, null, 2));
console.log(`\nWrote ${outFile}`);

await prisma.$disconnect();
