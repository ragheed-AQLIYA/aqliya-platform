/**
 * Read-only analysis for TB Closing Classification Adjustments (RC-003 plug).
 * Output: JSON for TB_CLOSING_ADJUSTMENT_ANALYSIS.md
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5434/aqliya?schema=public";

import XLSX from "xlsx";

const engagementId = "eng-gulf-2025";
const tbFile = process.env.TB_FILE ?? process.argv[2];
if (!tbFile) {
  console.error("TB file required: set TB_FILE env or pass path as first CLI argument.");
  process.exit(1);
}

const { prisma } = await import("../../src/lib/prisma.ts");
const { getMappingDisplayAmount } = await import(
  "../../src/lib/audit/db/statement-builder.ts"
);

const mappings = await prisma.auditAccountMapping.findMany({
  where: { engagementId, status: "confirmed" },
  include: { canonicalAccount: true },
  orderBy: { sourceAccountCode: "asc" },
});

const tb = await prisma.auditTrialBalance.findFirst({
  where: { engagementId },
  orderBy: { createdAt: "desc" },
  include: { lines: true },
});

const wb = XLSX.readFile(tbFile);
const sheetRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
  defval: "",
});
const map1Key = Object.keys(sheetRows[0] ?? {}).find((k) => k.trim() === "Mapping 1");
const bsKey = Object.keys(sheetRows[0] ?? {}).find((k) => k.includes("BS/IS"));
const netKey = Object.keys(sheetRows[0] ?? {}).find((k) =>
  k.includes("صافي الرصيد الحالي"),
);
const cdk = Object.keys(sheetRows[0] ?? {}).find((k) =>
  k.includes("الرصيد الحالي مدين"),
);
const cck = Object.keys(sheetRows[0] ?? {}).find((k) =>
  k.includes("الرصيد الحالي دائن"),
);

function closingBalance(r) {
  const cd = Number(String(r[cdk]).replace(/,/g, "")) || 0;
  const cc = Number(String(r[cck]).replace(/,/g, "")) || 0;
  if (cd || cc) return { debit: cd, credit: cc, net: cd - cc };
  const n = Number(String(r[netKey]).replace(/,/g, "")) || 0;
  return n >= 0
    ? { debit: n, credit: 0, net: n }
    : { debit: 0, credit: Math.abs(n), net: n };
}

const xlsxByCode = new Map();
for (const r of sheetRows) {
  const code = String(r["رقم الحساب"] ?? "").trim();
  if (!code) continue;
  xlsxByCode.set(code, {
    name: String(r["اسم الحساب"] ?? "").trim(),
    map1: String(r[map1Key] ?? "").trim(),
    bsIs: String(r[bsKey] ?? "").trim(),
    ...closingBalance(r),
  });
}

const byCanonical = {};
const byStatementType = { balance_sheet: 0, income_statement: 0 };
const byCategory = {};
const equityAccounts = [];
const isAccounts = [];
const bsAccounts = [];

for (const m of mappings) {
  const amt = getMappingDisplayAmount(m);
  const code = m.canonicalAccount?.code ?? "?";
  const cat = m.statementClassification ?? m.canonicalAccount?.category ?? "?";
  const st = m.canonicalAccount?.statementType ?? "?";
  byCanonical[code] = (byCanonical[code] ?? 0) + amt;
  byStatementType[st] = (byStatementType[st] ?? 0) + amt;
  byCategory[cat] = (byCategory[cat] ?? 0) + amt;

  const x = xlsxByCode.get(m.sourceAccountCode);
  const row = {
    code: m.sourceAccountCode,
    name: m.sourceAccountName,
    map1: x?.map1 ?? "",
    bsIs: x?.bsIs ?? "",
    tbNet: x?.net ?? m.debitAmount - m.creditAmount,
    fsAmount: amt,
    canonicalCode: m.canonicalAccount?.code,
    canonicalName: m.canonicalAccount?.name,
    category: cat,
    statementType: st,
  };

  if (cat === "Equity" || m.canonicalAccount?.name?.includes("Retained")) {
    equityAccounts.push(row);
  }
  if (st === "income_statement") isAccounts.push(row);
  if (st === "balance_sheet") bsAccounts.push(row);
}

let currentAssets = 0,
  nonCurrentAssets = 0,
  currentLiab = 0,
  nonCurrentLiab = 0,
  equity = 0;
for (const m of mappings) {
  const amt = getMappingDisplayAmount(m);
  const cat = m.statementClassification ?? m.canonicalAccount?.category ?? "";
  if (cat === "Current Assets") currentAssets += amt;
  else if (cat === "Non-Current Assets") nonCurrentAssets += amt;
  else if (cat === "Current Liabilities") currentLiab += amt;
  else if (cat === "Non-Current Liabilities") nonCurrentLiab += amt;
  else if (cat === "Equity") equity += amt;
}

const totalAssets = currentAssets + nonCurrentAssets;
const liabilitiesTotal = currentLiab + nonCurrentLiab;
const plug = totalAssets - (liabilitiesTotal + equity);

// IS components
let revenue = 0,
  cos = 0,
  opex = 0,
  otherIncome = 0;
for (const m of mappings) {
  const amt = getMappingDisplayAmount(m);
  const name = m.canonicalAccount?.name ?? "";
  const cat = m.canonicalAccount?.category ?? "";
  if (cat === "Revenue" && name !== "Other Income") revenue += amt;
  else if (name === "Cost of Sales") cos += amt;
  else if (name === "Other Income") otherIncome += amt;
  else if (cat === "Expenses" && name !== "Cost of Sales") opex += amt;
}
const computedNetProfit = revenue - cos - opex + otherIncome;

// TB-level BS vs IS net sums (from xlsx)
let tbBsNet = 0,
  tbIsNet = 0;
for (const [code, x] of xlsxByCode) {
  if (x.bsIs === "Balance Sheet") tbBsNet += x.net;
  else if (x.bsIs === "Income Statement") tbIsNet += x.net;
}

// Accounts where ERP says BS but mapped to IS or vice versa
const crossClass = [];
for (const m of mappings) {
  const x = xlsxByCode.get(m.sourceAccountCode);
  if (!x) continue;
  const erpBs = x.bsIs === "Balance Sheet";
  const mapBs = m.canonicalAccount?.statementType === "balance_sheet";
  if (erpBs !== mapBs) {
    crossClass.push({
      code: m.sourceAccountCode,
      name: m.sourceAccountName,
      erpBsIs: x.bsIs,
      map1: x.map1,
      canonical: `${m.canonicalAccount?.code} ${m.canonicalAccount?.name}`,
      tbNet: x.net,
      fsAmount: getMappingDisplayAmount(m),
    });
  }
}

// Sum IS-mapped accounts that ERP tags as Balance Sheet (balance trapped on wrong side)
const bsTaggedMappedToIs = crossClass.filter((c) => c.erpBsIs === "Balance Sheet");
const isTaggedMappedToBs = crossClass.filter((c) => c.erpBsIs === "Income Statement");

const sumBsTaggedAsIs = bsTaggedMappedToIs.reduce((s, c) => s + c.fsAmount, 0);
const sumIsTaggedAsBs = isTaggedMappedToBs.reduce((s, c) => s + c.fsAmount, 0);

// Equity-related Mapping 1 labels
const equityMap1Labels = {};
for (const e of equityAccounts) {
  const k = e.map1 || "(none)";
  equityMap1Labels[k] = (equityMap1Labels[k] ?? 0) + e.fsAmount;
}

console.log(
  JSON.stringify(
    {
      plug,
      totalAssets,
      liabilitiesTotal,
      equityCore: equity,
      currentAssets,
      nonCurrentAssets,
      currentLiab,
      nonCurrentLiab,
      computedNetProfit,
      tbBsNet,
      tbIsNet,
      byCategory,
      equityMap1Labels,
      equityAccounts,
      crossClassCount: crossClass.length,
      sumBsTaggedAsIs,
      sumIsTaggedAsBs,
      bsTaggedMappedToIs: bsTaggedMappedToIs.slice(0, 30),
      isTaggedMappedToBs: isTaggedMappedToBs.slice(0, 30),
      zakatAccounts: mappings
        .filter(
          (m) =>
            /zakat|زكاة/i.test(
              `${m.sourceAccountName} ${xlsxByCode.get(m.sourceAccountCode)?.map1 ?? ""}`,
            ),
        )
        .map((m) => ({
          code: m.sourceAccountCode,
          name: m.sourceAccountName,
          map1: xlsxByCode.get(m.sourceAccountCode)?.map1,
          canonical: m.canonicalAccount?.name,
          amount: getMappingDisplayAmount(m),
        })),
      actuarialReserve: mappings.filter((m) =>
        /actuarial|اكتواري/i.test(m.sourceAccountName),
      ).map((m) => ({
        code: m.sourceAccountCode,
        name: m.sourceAccountName,
        canonical: m.canonicalAccount?.name,
        amount: getMappingDisplayAmount(m),
      })),
      generalReserve: mappings.filter((m) =>
        /general reserve|احتياط/i.test(
          `${m.sourceAccountName} ${xlsxByCode.get(m.sourceAccountCode)?.map1 ?? ""}`,
        ),
      ).map((m) => ({
        code: m.sourceAccountCode,
        name: m.sourceAccountName,
        canonical: m.canonicalAccount?.name,
        amount: getMappingDisplayAmount(m),
      })),
      retainedEarnings: mappings.filter(
        (m) => m.canonicalAccount?.name === "Retained Earnings",
      ).map((m) => ({
        code: m.sourceAccountCode,
        name: m.sourceAccountName,
        map1: xlsxByCode.get(m.sourceAccountCode)?.map1,
        amount: getMappingDisplayAmount(m),
      })),
      unmappedTbLines: tb.lines
        .filter(
          (l) => !mappings.some((m) => m.sourceAccountCode === l.accountCode),
        )
        .map((l) => ({
          code: l.accountCode,
          name: l.accountName,
          debit: l.debitAmount,
          credit: l.creditAmount,
        })),
    },
    null,
    2,
  ),
);

await prisma.$disconnect();
