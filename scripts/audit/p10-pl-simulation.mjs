/**
 * Phase 10 before/after simulation using TB XLSX + rule-based classification (no DB).
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const { CANONICAL_COA_ACCOUNTS } = await import(
  "../../src/lib/audit/coa/canonical-coa.ts"
);
const { matchSynonym } = await import("../../src/lib/tb-intelligence/synonyms.ts");
const { parseErpStatementSide } = await import(
  "../../src/lib/tb-intelligence/engine.ts"
);
const { buildStatementLinesFromMappings, getMappingDisplayAmount } =
  await import("../../src/lib/audit/db/statement-builder.ts");
const {
  classifyIncomeStatementMapping,
  computeIncomeStatementNetProfit,
} = await import("../../src/lib/audit/db/income-statement-amount.ts");

const tbFile = process.env.TB_FILE ?? process.argv[2];
if (!tbFile) {
  console.error("TB file required: set TB_FILE env or pass path as first CLI argument.");
  process.exit(1);
}

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
    (k) => k.includes("صافي الرصيد الحالي") && !k.includes("الافتتاحي"),
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
        map1: hints.find((h) =>
          /revenue|cost|finance|zakat|administrative|other income|affiliate/i.test(
            h,
          ),
        ) ?? hints[0] ?? "",
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

function buildMappings(tbRows) {
  return tbRows
    .map((row, index) => {
      const canonical = resolveCanonical(row);
      if (!canonical) return null;
      return {
        id: `sim-${index}`,
        engagementId: "eng-gulf-2025",
        sourceAccountId: `tb-${row.accountCode}`,
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
          displayOrder: CANONICAL_COA_ACCOUNTS.find((a) => a.id === canonical.id)
            ?.displayOrder ?? 0,
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

function legacyNetProfit(mappings) {
  const income = mappings.filter(
    (m) => m.canonicalAccount?.statementType === "income_statement",
  );
  const sumLegacy = (items) =>
    items.reduce((t, m) => t + getMappingDisplayAmount(m), 0);
  const revenue = income.filter(
    (m) =>
      m.canonicalAccount?.category === "Revenue" &&
      m.canonicalAccount?.name !== "Other Income",
  );
  const other = income.filter((m) => m.canonicalAccount?.name === "Other Income");
  const cos = income.filter((m) => m.canonicalAccount?.name === "Cost of Sales");
  const opex = income.filter(
    (m) =>
      m.canonicalAccount?.category === "Expenses" &&
      m.canonicalAccount?.name !== "Cost of Sales",
  );
  return (
    sumLegacy(revenue) -
    sumLegacy(cos) -
    sumLegacy(opex) +
    sumLegacy(other)
  );
}

const tbRows = parseTb(tbFile);
const mappings = buildMappings(tbRows);

// Legacy totals (gross closing on all income_statement canonical)
const legacyRevenue = mappings
  .filter(
    (m) =>
      m.canonicalAccount?.statementType === "income_statement" &&
      m.canonicalAccount?.category === "Revenue" &&
      m.canonicalAccount?.name !== "Other Income",
  )
  .reduce((s, m) => s + getMappingDisplayAmount(m), 0);

const legacyCos = mappings
  .filter((m) => m.canonicalAccount?.name === "Cost of Sales")
  .reduce((s, m) => s + getMappingDisplayAmount(m), 0);

const afterLines = buildStatementLinesFromMappings(
  "after",
  "income_statement",
  mappings,
);
const equityLines = buildStatementLinesFromMappings("eq", "equity", mappings);

const lineAmount = (lines, label) =>
  lines.find((l) => l.label === label)?.amount ?? null;
const lineAmountIncludes = (lines, fragment) =>
  lines.find((l) => l.label.includes(fragment))?.amount ?? null;

const after = {
  revenue: lineAmountIncludes(afterLines, "Operating Revenue"),
  revenueAffiliate: lineAmountIncludes(afterLines, "Affiliate Revenue"),
  revenueContract: lineAmountIncludes(afterLines, "Contract Revenue"),
  revenueOther: lineAmountIncludes(afterLines, "Other Revenue"),
  costOfRevenue: lineAmount(afterLines, "Cost of Sales"),
  grossProfit: lineAmount(afterLines, "Gross Profit"),
  operatingExpenses: lineAmount(afterLines, "Operating Expenses"),
  operatingProfit: lineAmount(afterLines, "Operating Profit"),
  financeCosts: lineAmount(afterLines, "Finance Costs"),
  otherIncome: lineAmountIncludes(afterLines, "Other Income"),
  profitBeforeZakat: lineAmount(afterLines, "Profit Before Zakat"),
  zakat: lineAmount(afterLines, "Zakat"),
  netProfit: lineAmount(afterLines, "Net Profit"),
  signedIsNet: computeIncomeStatementNetProfit(mappings),
  equityTotal: lineAmountIncludes(equityLines, "Total Equity"),
};

const audited = {
  revenue: 451_412_506,
  costOfRevenue: 384_959_315,
  grossProfit: 66_453_191,
  operatingProfit: 39_825_465,
  netProfit: 25_084_852,
};

const before = {
  revenue: legacyRevenue,
  costOfRevenue: legacyCos,
  grossProfit: legacyRevenue - legacyCos,
  netProfit: legacyNetProfit(mappings),
};

const out = {
  mappedCount: mappings.length,
  tbRowCount: tbRows.length,
  before,
  after,
  audited,
  netProfitVariancePctAfter:
    ((after.netProfit - audited.netProfit) / audited.netProfit) * 100,
};

const outFile = path.join(
  "docs",
  "audits",
  "evidence",
  "p10-before-after-simulation.json",
);
fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
