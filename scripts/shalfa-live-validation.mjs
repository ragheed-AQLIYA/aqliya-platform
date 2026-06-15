/**
 * Live Factory Accuracy for eng-shalfa-2025 (DB-backed + Map1 enrichment).
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";
process.env.FF_AUDIT_FS_V2 = "true";

import fs from "node:fs";
import path from "node:path";

const ENGAGEMENT_ID = process.env.ENGAGEMENT_ID ?? "eng-shalfa-2025";

const { prisma } = await import("../src/lib/prisma.ts");
const { enrichMappingsWithErpMap1 } = await import(
  "../src/lib/audit/presentation/enrich-mapping-map1.ts"
);
const { loadEngagementPresentationContext } = await import(
  "../src/lib/audit/presentation/engagement-presentation-config.ts"
);
const { buildStatementLinesFromMappings } = await import(
  "../src/lib/audit/db/statement-builder.ts"
);
const { buildPresentationIncomeStatementTotals } = await import(
  "../src/lib/audit/db/income-statement-presentation.ts"
);
const { computeIncomeStatementNetProfit } = await import(
  "../src/lib/audit/db/income-statement-amount.ts"
);

const SHALFA_AUDITED = {
  client: "Shalfa Facilities (pilot)",
  revenue: 451_412_506,
  costOfRevenue: 384_959_315,
  grossProfit: 66_453_191,
  operatingExpenses: 26_627_726,
  operatingProfit: 39_825_465,
  financeCosts: 12_901_271,
  otherIncome: 735_915,
  netProfit: 25_084_852,
  totalAssets: 376_138_426,
  totalEquity: 112_586_721,
  cash: 62_819_989,
};

function lineAmount(lines, label) {
  const needle = label.toLowerCase();
  const exact = lines.find((l) => l.label.trim().toLowerCase() === needle);
  if (exact) return exact.amount;
  const fuzzy = lines.find((l) => l.label.toLowerCase().includes(needle));
  return fuzzy?.amount ?? null;
}

function pctVariance(auditos, reference) {
  if (auditos == null || reference == null || reference === 0) return null;
  return ((auditos - reference) / Math.abs(reference)) * 100;
}

function withinPct(auditos, reference, tolerancePct = 5) {
  const v = pctVariance(auditos, reference);
  if (v == null) return false;
  return Math.abs(v) <= tolerancePct;
}

const ctx = await loadEngagementPresentationContext(ENGAGEMENT_ID);
const rawMappings = await prisma.auditAccountMapping.findMany({
  where: { engagementId: ENGAGEMENT_ID, status: "confirmed" },
  include: { canonicalAccount: true },
});
const mappings = await enrichMappingsWithErpMap1(ENGAGEMENT_ID, rawMappings);

const incomeLines = buildStatementLinesFromMappings(
  ENGAGEMENT_ID,
  "income_statement",
  mappings,
  { presentationPolicy: ctx.policy },
);
const balanceLines = buildStatementLinesFromMappings(
  ENGAGEMENT_ID,
  "balance_sheet",
  mappings,
  { presentationPolicy: ctx.policy },
);
const equityLines = buildStatementLinesFromMappings(
  ENGAGEMENT_ID,
  "equity",
  mappings,
  { presentationPolicy: ctx.policy },
);
const presentation = buildPresentationIncomeStatementTotals(
  mappings,
  ctx.policy,
);
const signedNet = computeIncomeStatementNetProfit(mappings);

const auditos = {
  revenue: presentation.revenueTotal,
  costOfRevenue: presentation.costOfRevenueTotal,
  grossProfit: presentation.grossProfit,
  operatingExpenses: presentation.operatingExpensesTotal,
  operatingProfit: presentation.operatingProfit,
  financeCosts: presentation.financeCostsTotal,
  otherIncome: presentation.otherIncomeTotal,
  netProfit: signedNet,
  totalAssets: lineAmount(balanceLines, "TOTAL ASSETS"),
  totalEquity:
    lineAmount(equityLines, "Total Equity") ??
    lineAmount(balanceLines, "TOTAL LIABILITIES AND EQUITY"),
  cash: lineAmount(balanceLines, "Cash and cash equivalents"),
  signedIsNet: signedNet,
  renderedLines: {
    revenue:
      lineAmount(incomeLines, "Operating Revenue") ??
      lineAmount(incomeLines, "Revenue"),
    costOfRevenue:
      lineAmount(incomeLines, "Cost of Sales") ??
      lineAmount(incomeLines, "Cost of revenue"),
  },
};

const lineChecks = [
  ["Revenue", auditos.revenue, SHALFA_AUDITED.revenue],
  ["Cost of revenue", auditos.costOfRevenue, SHALFA_AUDITED.costOfRevenue],
  ["Gross profit", auditos.grossProfit, SHALFA_AUDITED.grossProfit],
  [
    "Operating expenses",
    auditos.operatingExpenses,
    SHALFA_AUDITED.operatingExpenses,
  ],
  [
    "Operating profit",
    auditos.operatingProfit,
    SHALFA_AUDITED.operatingProfit,
  ],
  ["Finance costs", auditos.financeCosts, SHALFA_AUDITED.financeCosts],
  ["Other income", auditos.otherIncome, SHALFA_AUDITED.otherIncome],
  ["Net profit", auditos.netProfit, SHALFA_AUDITED.netProfit],
  ["Total assets", auditos.totalAssets, SHALFA_AUDITED.totalAssets],
  ["Total equity", auditos.totalEquity, SHALFA_AUDITED.totalEquity],
  ["Cash", auditos.cash, SHALFA_AUDITED.cash],
].filter(([, , ref]) => ref != null);

const matched = lineChecks.filter(([, a, b]) => withinPct(a, b, 5)).length;
const lineItemScore = Math.round((matched / lineChecks.length) * 100);
const structuralScore =
  auditos.totalAssets != null &&
  withinPct(auditos.totalAssets, SHALFA_AUDITED.totalAssets, 1)
    ? 98
    : auditos.totalAssets != null
      ? 70
      : 40;
const economicChecks = [
  withinPct(auditos.netProfit, SHALFA_AUDITED.netProfit, 1),
  withinPct(auditos.totalEquity, SHALFA_AUDITED.totalEquity, 1),
  withinPct(auditos.cash, SHALFA_AUDITED.cash, 1),
  withinPct(auditos.revenue, SHALFA_AUDITED.revenue, 5),
];
const economicScore = Math.round(
  (economicChecks.filter(Boolean).length / economicChecks.length) * 100,
);
const factoryAccuracy = Math.round(
  structuralScore * 0.2 +
    economicScore * 0.35 +
    lineItemScore * 0.2 +
    lineItemScore * 0.25,
);

const report = {
  engagementId: ENGAGEMENT_ID,
  policySlug: ctx.policy.slug,
  mappingCount: mappings.length,
  auditos,
  variances: {
    netProfitPct: pctVariance(auditos.netProfit, SHALFA_AUDITED.netProfit),
    revenuePct: pctVariance(auditos.revenue, SHALFA_AUDITED.revenue),
    costOfRevenuePct: pctVariance(
      auditos.costOfRevenue,
      SHALFA_AUDITED.costOfRevenue,
    ),
    operatingProfitPct: pctVariance(
      auditos.operatingProfit,
      SHALFA_AUDITED.operatingProfit,
    ),
  },
  scores: {
    structural: structuralScore,
    economic: economicScore,
    lineItem: lineItemScore,
    factoryAccuracy,
  },
  lineChecks: lineChecks.map(([label, a, b]) => ({
    label,
    auditos: a,
    reference: b,
    variancePct: pctVariance(a, b),
    match: withinPct(a, b, 5),
  })),
  pass: factoryAccuracy >= 85,
};

const out = path.join("docs", "audits", "evidence", "shalfa-live-validation.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(report, null, 2));

console.log(JSON.stringify(report, null, 2));
await prisma.$disconnect();
process.exit(report.pass ? 0 : 1);
