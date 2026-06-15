/**
 * Phase 14 — G&A mapping gap analysis (Shalfa TB).
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const { CANONICAL_COA_ACCOUNTS } = await import(
  "../src/lib/audit/coa/canonical-coa.ts"
);
const { matchSynonym } = await import("../src/lib/tb-intelligence/synonyms.ts");
const { parseErpStatementSide } = await import(
  "../src/lib/tb-intelligence/engine.ts"
);
const {
  classifyPresentationMapping,
  getPresentationPeriodAmount,
  isPresentationOperatingExpenseMapping,
} = await import("../src/lib/audit/db/income-statement-presentation.ts");
const { buildPresentationIncomeStatementTotals } = await import(
  "../src/lib/audit/db/income-statement-presentation.ts"
);
const { SHALFA_PILOT_PRESENTATION_POLICY_V1 } = await import(
  "../src/lib/audit/presentation/presentation-policy-types.ts"
);

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

  for (const hint of [row.accountName, ...row.hints]) {
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
        id: `tb-${index}`,
        engagementId: "eng-p14",
        sourceAccountId: `src-${row.accountCode}`,
        sourceAccountCode: row.accountCode,
        sourceAccountName: row.accountName,
        debitAmount: row.debitAmount,
        creditAmount: row.creditAmount,
        canonicalAccountId: canonical.id,
        canonicalAccount: canonical,
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

const AUDITED_GA = 26_627_726;
const rows = parseTb(tbFile);
const mappings = buildMappings(rows);

const map1GaRows = rows.filter((r) =>
  /^general and administrative expenses$/i.test(r.map1.trim()),
);

function tbExpense(r) {
  return r.debitAmount || Math.abs(r.creditAmount - r.debitAmount);
}

const map1GaTotal = map1GaRows.reduce((s, r) => s + tbExpense(r), 0);

const gaMisclassified = [];
const gaIncluded = [];
let engineGa = 0;

for (const m of mappings) {
  const map1 = (m.erpMap1Label ?? "").trim();
  if (!/^general and administrative expenses$/i.test(map1)) continue;

  const kind = classifyPresentationMapping(m);
  const amt = getPresentationPeriodAmount(m, kind);
  const isOp = isPresentationOperatingExpenseMapping(m);

  if (kind === "operating_expense") {
    gaIncluded.push({
      code: m.sourceAccountCode,
      name: m.sourceAccountName,
      amount: amt,
      kind,
    });
    engineGa += amt;
  } else {
    gaMisclassified.push({
      code: m.sourceAccountCode,
      name: m.sourceAccountName,
      map1,
      kind,
      amount: getPresentationPeriodAmount(m, kind),
      tbAmount: tbExpense(rows.find((r) => r.accountCode === m.sourceAccountCode)),
      isOpFlag: isOp,
    });
  }
}

const unmappedGa = map1GaRows.filter(
  (r) => !mappings.some((m) => m.sourceAccountCode === r.accountCode),
);

const presentation = buildPresentationIncomeStatementTotals(
  mappings,
  SHALFA_PILOT_PRESENTATION_POLICY_V1,
);

const report = {
  auditedGa: AUDITED_GA,
  map1GaAccountCount: map1GaRows.length,
  map1GaTotal,
  engineOperatingExpenses: presentation.operatingExpensesTotal,
  engineGaFromMap1Included: engineGa,
  gapVsAudited: presentation.operatingExpensesTotal - AUDITED_GA,
  gapMap1VsEngine: map1GaTotal - presentation.operatingExpensesTotal,
  misclassifiedFromMap1Ga: gaMisclassified.sort(
    (a, b) => b.tbAmount - a.tbAmount,
  ),
  misclassifiedTotal: gaMisclassified.reduce((s, x) => s + x.tbAmount, 0),
  unmappedGaAccounts: unmappedGa.map((r) => ({
    code: r.accountCode,
    name: r.accountName,
    amount: tbExpense(r),
  })),
  unmappedGaTotal: unmappedGa.reduce((s, r) => s + tbExpense(r), 0),
  topIncludedGa: gaIncluded.sort((a, b) => b.amount - a.amount).slice(0, 10),
};

const outDir = path.join("docs", "audits", "evidence");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "p14-ga-mapping-gap.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
