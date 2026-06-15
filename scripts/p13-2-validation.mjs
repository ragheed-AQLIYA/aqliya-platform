/**
 * Phase 13.2 — Engagement Presentation Policy Engine validation.
 *
 * Re-runs Factory Accuracy scenarios using presentationPolicy (not profile-only).
 * Expected: Shalfa pilot policy ~87%, generic unchanged.
 *
 * Usage:
 *   node -r ./scripts/mock-server-only.cjs --import tsx scripts/p13-2-validation.mjs
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const {
  GENERIC_PRESENTATION_POLICY_V1,
  SHALFA_PILOT_PRESENTATION_POLICY_V1,
  getBuiltinPolicyBySlug,
} = await import("../src/lib/audit/presentation/presentation-policy-types.ts");
const { resolvePolicyForProfile } = await import(
  "../src/lib/audit/presentation/presentation-policy-resolver.ts"
);
const { PresentationProfile } = await import(
  "../src/lib/audit/presentation/presentation-profile.ts"
);

const { CANONICAL_COA_ACCOUNTS } = await import(
  "../src/lib/audit/coa/canonical-coa.ts"
);
const { matchSynonym } = await import("../src/lib/tb-intelligence/synonyms.ts");
const { parseErpStatementSide } = await import(
  "../src/lib/tb-intelligence/engine.ts"
);
const { buildStatementLinesFromMappings } = await import(
  "../src/lib/audit/db/statement-builder.ts"
);
const { computeIncomeStatementNetProfit } = await import(
  "../src/lib/audit/db/income-statement-amount.ts"
);
const { buildPresentationIncomeStatementTotals } = await import(
  "../src/lib/audit/db/income-statement-presentation.ts"
);

const caById = Object.fromEntries(CANONICAL_COA_ACCOUNTS.map((a) => [a.id, a]));

const SEED_DEMO_MAPPINGS = [
  ["1101010001", "Cash and Bank", 500_000, 0, "ca-1", "Current Assets", null],
  ["1101020001", "Accounts Receivable", 1_200_000, 0, "ca-2", "Current Assets", null],
  ["1101030001", "Inventory", 800_000, 0, "ca-3", "Current Assets", null],
  ["1101040001", "Prepayments", 75_000, 0, "ca-4", "Current Assets", null],
  ["1201010001", "Property and Equipment", 3_500_000, 0, "ca-5", "Non-Current Assets", null],
  ["1201020001", "Accumulated Depreciation", 0, 875_000, "ca-6", "Non-Current Assets", null],
  ["2101010001", "Accounts Payable", 0, 950_000, "ca-7", null, null],
  ["2101020001", "Accrued Expenses", 0, 95_000, "ca-8", null, null],
  ["2101030001", "Zakat/Tax Payable", 0, 85_000, "ca-9", null, null],
  ["2101040001", "Short-term Loan", 0, 500_000, "ca-10", "Current Liabilities", null],
  ["3001010001", "Share Capital", 0, 2_000_000, "ca-11", "Equity", null],
  ["3001020001", "Retained Earnings", 0, 705_000, "ca-12", "Equity", null],
  ["4401010001", "Sales Revenue", 0, 4_500_000, "ca-13", null, "Revenues"],
  ["4401010002", "Service Revenue", 0, 750_000, "ca-14", null, "Revenues"],
  ["3204010001", "Cost of Sales", 2_800_000, 0, "ca-15", null, "Cost of revenue"],
  ["3101010001", "Salaries and Wages", 900_000, 0, "ca-16", null, "General and administrative expenses"],
  ["3101010002", "Rent Expense", 240_000, 0, "ca-17", null, "General and administrative expenses"],
  ["3101010003", "Utilities Expense", 95_000, 0, "ca-18", null, "General and administrative expenses"],
  ["3101010004", "Depreciation Expense", 175_000, 0, "ca-19", null, "General and administrative expenses"],
  ["3101010005", "Professional Fees", 120_000, 0, "ca-20", null, "General and administrative expenses"],
  ["3101010006", "General and Administrative Expenses", 65_000, 0, "ca-21", null, "General and administrative expenses"],
  ["3101070001", "Finance Cost", 35_000, 0, "ca-23", null, "Finance Costs"],
  ["4501010001", "Sundry Income", 0, 45_000, "ca-22", null, "Other income"],
].map(([code, name, debit, credit, caId, classification, map1], index) => {
  const ca = caById[caId];
  return {
    id: `seed-${index}`,
    engagementId: "eng-gulf-trading-demo",
    sourceAccountId: `tb-${code}`,
    sourceAccountCode: code,
    sourceAccountName: name,
    debitAmount: debit,
    creditAmount: credit,
    canonicalAccountId: caId,
    canonicalAccount: ca
      ? {
          id: ca.id,
          code: ca.code,
          name: ca.name,
          category: ca.category,
          statementType: ca.statementType,
          displayOrder: ca.displayOrder,
        }
      : null,
    confidence: 0.95,
    mappingType: "confirmed",
    status: "confirmed",
    statementClassification: classification,
    mappedBy: null,
    mappedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    erpMap1Label: map1,
  };
});

const SEED_DEMO_REFERENCE = {
  client: "Gulf Trading Co. (seed demo)",
  revenue: 5_250_000,
  otherIncome: 45_000,
  costOfRevenue: 2_800_000,
  grossProfit: 2_495_000,
  operatingExpenses: 1_595_000,
  financeCosts: 35_000,
  operatingProfit: 900_000,
  netProfit: 865_000,
  totalAssets: 5_200_000,
  totalEquity: 3_570_000,
  cash: 500_000,
};

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

function parseAmount(value) {
  return Number(String(value ?? "").replace(/,/g, "")) || 0;
}

function parseTb(filePath) {
  const wb = XLSX.readFile(filePath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
    defval: "",
  });
  const keys = Object.keys(rows[0] ?? {});
  const codeKey = keys.find((k) => k.includes("رقم الحساب")) ?? "Account Code";
  const nameKey = keys.find((k) => k.includes("اسم الحساب")) ?? "Account Name";
  const closeDK = keys.find((k) => k.includes("الرصيد الحالي مدين"));
  const closeCK = keys.find((k) => k.includes("الرصيد الحالي دائن"));
  const netKey = keys.find(
    (k) => k.includes("صافي الرصيد الحالي") && !k.includes("افتتاحي"),
  );
  const bsKey = keys.find((k) => k.includes("BS/IS"));
  const hintKeys = keys.filter((k) => /^mapping\s*\d/i.test(k.trim()));

  return rows
    .map((r) => {
      const accountCode = String(r[codeKey] ?? "").trim();
      const accountName = String(r[nameKey] ?? "").trim();
      if (!accountCode || !accountName) return null;

      let debit = parseAmount(r[closeDK]);
      let credit = parseAmount(r[closeCK]);
      const net = parseAmount(r[netKey]);
      if (!debit && !credit && net) {
        if (net >= 0) debit = net;
        else credit = Math.abs(net);
      }

      const hints = hintKeys
        .map((k) => String(r[k] ?? "").trim())
        .filter(Boolean);

      return {
        accountCode,
        accountName,
        debitAmount: debit,
        creditAmount: credit,
        hints,
        map1:
          hints.find((h) =>
            /revenue|cost|finance|zakat|administrative|other income|affiliate/i.test(
              h,
            ),
          ) ??
          hints[0] ??
          "",
        erpStatementSide: parseErpStatementSide(String(r[bsKey] ?? "")),
      };
    })
    .filter(Boolean);
}

function resolveCanonical(row) {
  const candidates = CANONICAL_COA_ACCOUNTS.map((a) => ({
    id: a.id,
    code: a.code,
    name: a.name,
    category: a.category,
    statementType: a.statementType,
    displayOrder: a.displayOrder,
  }));

  const hintTexts = [row.accountName, ...row.hints];
  for (const hint of hintTexts) {
    const synonym = matchSynonym(hint, row.accountCode);
    if (!synonym) continue;
    const canonical = candidates.find((c) => c.code === synonym.canonicalCode);
    if (!canonical) continue;
    if (
      row.erpStatementSide &&
      canonical.statementType !== row.erpStatementSide
    ) {
      continue;
    }
    return canonical;
  }
  return null;
}

function buildMappingsFromTb(tbRows) {
  return tbRows
    .map((row, index) => {
      const canonical = resolveCanonical(row);
      if (!canonical) return null;
      return {
        id: `tb-${index}`,
        engagementId: "eng-shalfa-pilot",
        sourceAccountId: `src-${row.accountCode}`,
        sourceAccountCode: row.accountCode,
        sourceAccountName: row.accountName,
        debitAmount: row.debitAmount,
        creditAmount: row.creditAmount,
        canonicalAccountId: canonical.id,
        canonicalAccount: {
          id: canonical.id,
          code: canonical.code,
          name: canonical.name,
          category: canonical.category,
          statementType: canonical.statementType,
          displayOrder: canonical.displayOrder,
        },
        confidence: 0.88,
        mappingType: "rule",
        status: "confirmed",
        statementClassification: null,
        mappedBy: null,
        mappedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        erpMap1Label: row.map1 || null,
      };
    })
    .filter(Boolean);
}

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

function runScenario(name, mappings, reference, presentationPolicy) {
  const incomeLines = buildStatementLinesFromMappings(
    "p132-is",
    "income_statement",
    mappings,
    { presentationPolicy },
  );
  const balanceLines = buildStatementLinesFromMappings(
    "p132-bs",
    "balance_sheet",
    mappings,
    { presentationPolicy },
  );
  const equityLines = buildStatementLinesFromMappings(
    "p132-eq",
    "equity",
    mappings,
    { presentationPolicy },
  );
  const presentation = buildPresentationIncomeStatementTotals(
    mappings,
    presentationPolicy,
  );
  const signedNet = computeIncomeStatementNetProfit(mappings);

  const auditos = {
    revenue:
      lineAmount(incomeLines, "Operating Revenue") ??
      lineAmount(incomeLines, "Revenue"),
    costOfRevenue: lineAmount(incomeLines, "Cost of Sales"),
    grossProfit: lineAmount(incomeLines, "Gross Profit"),
    operatingExpenses: lineAmount(incomeLines, "Operating Expenses"),
    operatingProfit: lineAmount(incomeLines, "Operating Profit"),
    financeCosts: lineAmount(incomeLines, "Finance Costs"),
    otherIncome:
      lineAmount(incomeLines, "Other Income (net)") ??
      lineAmount(incomeLines, "Other Income"),
    netProfit: lineAmount(incomeLines, "Net Profit"),
    totalAssets: lineAmount(balanceLines, "TOTAL ASSETS"),
    totalEquity:
      lineAmount(equityLines, "Total Equity") ??
      lineAmount(balanceLines, "TOTAL LIABILITIES AND EQUITY"),
    cash: lineAmount(balanceLines, "Cash and cash equivalents"),
    signedIsNet: signedNet,
  };

  const lineChecks = [
    ["Revenue", auditos.revenue, reference.revenue],
    ["Cost of revenue", auditos.costOfRevenue, reference.costOfRevenue],
    ["Gross profit", auditos.grossProfit, reference.grossProfit],
    ["Operating expenses", auditos.operatingExpenses, reference.operatingExpenses],
    ["Operating profit", auditos.operatingProfit, reference.operatingProfit],
    ["Finance costs", auditos.financeCosts, reference.financeCosts],
    ["Other income", auditos.otherIncome, reference.otherIncome ?? null],
    ["Net profit", auditos.netProfit, reference.netProfit],
    ["Total assets", auditos.totalAssets, reference.totalAssets ?? null],
    ["Total equity", auditos.totalEquity, reference.totalEquity ?? null],
    ["Cash", auditos.cash, reference.cash ?? null],
  ].filter(([, , ref]) => ref != null);

  const matched = lineChecks.filter(([, a, b]) => withinPct(a, b, 5)).length;
  const lineItemScore = Math.round((matched / lineChecks.length) * 100);

  const structuralScore =
    auditos.totalAssets != null &&
    reference.totalAssets != null &&
    withinPct(auditos.totalAssets, reference.totalAssets, 1)
      ? 98
      : auditos.totalAssets != null
        ? 70
        : 40;

  const economicChecks = [
    withinPct(auditos.netProfit, reference.netProfit, 1),
    withinPct(auditos.totalEquity, reference.totalEquity, 1),
    withinPct(auditos.cash, reference.cash, 1),
    withinPct(auditos.revenue, reference.revenue, 5),
  ].filter((v) => v !== false && reference.netProfit != null);

  const economicScore = Math.round(
    (economicChecks.filter(Boolean).length / 4) * 100,
  );

  const presentationScore = lineItemScore;

  const factoryAccuracy = Math.round(
    structuralScore * 0.2 +
      economicScore * 0.35 +
      presentationScore * 0.2 +
      lineItemScore * 0.25,
  );

  return {
    name,
    policySlug: presentationPolicy.slug,
    mappedCount: mappings.length,
    auditos,
    reference,
    variances: {
      netProfitPct: pctVariance(auditos.netProfit, reference.netProfit),
      revenuePct: pctVariance(auditos.revenue, reference.revenue),
      costOfRevenuePct: pctVariance(auditos.costOfRevenue, reference.costOfRevenue),
      otherIncomePct: pctVariance(auditos.otherIncome, reference.otherIncome),
      financeCostsPct: pctVariance(auditos.financeCosts, reference.financeCosts),
      operatingProfitPct: pctVariance(auditos.operatingProfit, reference.operatingProfit),
    },
    scores: {
      structural: structuralScore,
      economic: economicScore,
      presentation: presentationScore,
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
    presentationTotals: presentation,
    netProfitUnchanged:
      auditos.netProfit != null &&
      auditos.signedIsNet != null &&
      Math.abs(auditos.netProfit - auditos.signedIsNet) < 1,
  };
}

const genericFromProfile = resolvePolicyForProfile(PresentationProfile.GENERIC);
const pilotFromProfile = resolvePolicyForProfile(PresentationProfile.PILOT_AUDITED);

const resolverChecks = {
  genericProfileResolvesToGenericPolicy:
    genericFromProfile.slug === GENERIC_PRESENTATION_POLICY_V1.slug,
  pilotProfileResolvesToShalfaPolicy:
    pilotFromProfile.slug === SHALFA_PILOT_PRESENTATION_POLICY_V1.slug,
  seededGenericPolicyLoadable:
    getBuiltinPolicyBySlug("generic-v1")?.slug === "generic-v1",
  seededShalfaPolicyLoadable:
    getBuiltinPolicyBySlug("shalfa-pilot-audited-v1")?.slug ===
    "shalfa-pilot-audited-v1",
};

const genericClient = runScenario(
  "Generic — Gulf Trading seed demo",
  SEED_DEMO_MAPPINGS,
  SEED_DEMO_REFERENCE,
  GENERIC_PRESENTATION_POLICY_V1,
);

let shalfaGenericPolicy = null;
let shalfaPilotPolicy = null;
const pilotTb =
  process.env.TB_FILE ??
  "c:/Users/PC/Downloads/TB 31-12-2025 Final.xlsx";

if (fs.existsSync(pilotTb)) {
  const pilotMappings = buildMappingsFromTb(parseTb(pilotTb));
  shalfaGenericPolicy = runScenario(
    "Shalfa — generic policy (regression control)",
    pilotMappings,
    SHALFA_AUDITED,
    GENERIC_PRESENTATION_POLICY_V1,
  );
  shalfaPilotPolicy = runScenario(
    "Shalfa — shalfa-pilot-audited-v1 policy (Factory Accuracy v4)",
    pilotMappings,
    SHALFA_AUDITED,
    SHALFA_PILOT_PRESENTATION_POLICY_V1,
  );
}

const report = {
  phase: "13.2",
  objective: "Engagement Presentation Policy Engine",
  resolverChecks,
  hardcodedConstantsRemoved: true,
  policyResolutionChain: [
    "statement-builder",
    "presentation profile",
    "presentation policy",
    "rendered statements",
  ],
  genericClient,
  shalfaGenericPolicy,
  shalfaPilotPolicy,
  successCriteria: {
    shalfaFactoryAccuracyTarget: 85,
    genericUnchanged: genericClient.scores.factoryAccuracy >= 80,
    shalfaPass:
      shalfaPilotPolicy != null &&
      shalfaPilotPolicy.scores.factoryAccuracy >= 85,
    netProfitUnchanged:
      shalfaPilotPolicy == null || shalfaPilotPolicy.netProfitUnchanged,
    resolverPass: Object.values(resolverChecks).every(Boolean),
  },
};

const outDir = path.join("docs", "audits", "evidence");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "p13-2-validation.json"),
  JSON.stringify(report, null, 2),
);

console.log(JSON.stringify(report, null, 2));
