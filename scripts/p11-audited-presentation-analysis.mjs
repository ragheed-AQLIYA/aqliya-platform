/**
 * Phase 11 — Audited presentation alignment analysis (read-only TB drill-down).
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

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
  const movDK = keys.find(
    (k) => k.includes("حركة") && k.includes("مدين") && !k.includes("افتتاح"),
  );
  const movCK = keys.find(
    (k) => k.includes("حركة") && k.includes("دائن") && !k.includes("افتتاح"),
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
      const map1 = hints[0] ?? "";
      const map2 = hints[1] ?? "";
      const movDebit = parseAmount(r[movDK]);
      const movCredit = parseAmount(r[movCK]);
      const movNet = movCredit - movDebit;
      const closeNet = credit - debit;
      const bsIs = String(r[bsKey] ?? "").trim();

      return {
        accountCode,
        accountName,
        debitAmount: debit,
        creditAmount: credit,
        closeNet,
        movDebit,
        movCredit,
        movNet,
        map1,
        map2,
        bsIs,
        hints,
      };
    })
    .filter(Boolean);
}

function isIsRow(row) {
  return /income\s*statement/i.test(row.bsIs);
}

function displayExpense(amount) {
  return Math.abs(amount);
}

function displayRevenue(amount) {
  return Math.max(0, -amount) || Math.max(0, amount);
}

function sumRows(rows, field = "closeNet") {
  return rows.reduce((s, r) => s + r[field], 0);
}

function revDisplay(rows) {
  return rows.reduce((s, r) => s + (r.creditAmount || Math.abs(r.closeNet)), 0);
}

function expDisplay(rows) {
  return rows.reduce((s, r) => s + (r.debitAmount || Math.abs(r.closeNet)), 0);
}

const AUDITED = {
  revenue: 451_412_506,
  costOfRevenue: 384_959_315,
  grossProfit: 66_453_191,
  operatingExpenses: 26_627_726,
  operatingProfit: 39_825_465,
  financeCosts: 12_901_271,
  otherIncome: 735_915,
  profitBeforeZakat: 27_660_109,
  zakat: 2_575_257,
  netProfit: 25_084_852,
};

const rows = parseTb(tbFile);
const isRows = rows.filter(isIsRow);

const byMap1 = new Map();
for (const row of isRows) {
  const key = row.map1 || "(blank Map1)";
  if (!byMap1.has(key)) byMap1.set(key, []);
  byMap1.get(key).push(row);
}

const map1Summary = [...byMap1.entries()]
  .map(([map1, items]) => {
    const closingRev = items
      .filter((r) => r.closeNet < 0 || r.creditAmount > 0)
      .reduce((s, r) => s + (r.creditAmount || -r.closeNet), 0);
    const closingExp = items
      .filter((r) => r.closeNet > 0 || r.debitAmount > 0)
      .reduce((s, r) => s + (r.debitAmount || r.closeNet), 0);
    const movRev = items.reduce(
      (s, r) => s + (r.movNet < 0 ? -r.movNet : 0),
      0,
    );
    const movExp = items.reduce(
      (s, r) => s + (r.movNet > 0 ? r.movNet : 0),
      0,
    );
    return {
      map1,
      count: items.length,
      closingRevenueStyle: closingRev,
      closingExpenseStyle: closingExp,
      movementRevenueStyle: movRev,
      movementExpenseStyle: movExp,
    };
  })
  .sort((a, b) => b.closingRevenueStyle + b.closingExpenseStyle - (a.closingRevenueStyle + a.closingExpenseStyle));

// Revenue GL accounts (43-47 credit)
const revenueGl = isRows.filter(
  (r) =>
    /^4[3-7]/.test(r.accountCode) &&
    (r.creditAmount > 0 || r.closeNet < 0),
);

const affiliateGl = revenueGl.filter(
  (r) =>
    r.accountCode === "4401010005" ||
    /شقيقة|affiliate|intercompany/i.test(r.accountName),
);

const contractGl = revenueGl.filter(
  (r) =>
    r.accountCode === "4401010004" ||
    (/contract|مفوتر|عقد|unbilled|غير مفوتر/i.test(r.accountName) &&
      r.accountCode !== "4401010005"),
);

const otherRevGl = revenueGl.filter(
  (r) => !affiliateGl.includes(r) && !contractGl.includes(r),
);

const corGl = isRows.filter(
  (r) =>
    r.map1.toLowerCase() === "cost of revenue" ||
    r.accountCode.startsWith("32") ||
    r.accountCode.startsWith("33"),
);

const otherIncomeGl = isRows.filter(
  (r) => r.map1.toLowerCase() === "other income" || r.accountCode.startsWith("450101"),
);

const financeGl = isRows.filter(
  (r) => r.map1.toLowerCase() === "finance costs" || r.accountCode.startsWith("310107"),
);

const financeCredits = financeGl.filter((r) => r.closeNet < 0 || r.creditAmount > r.debitAmount);
const financeDebits = financeGl.filter((r) => r.debitAmount > r.creditAmount);

// CoR accounts NOT in audited (hypothesis: 33xx depreciation reclass, duplicate, affiliate-linked)
const corByPrefix = {};
for (const r of corGl) {
  const p = r.accountCode.substring(0, 4);
  if (!corByPrefix[p]) corByPrefix[p] = { count: 0, closing: 0, accounts: [] };
  corByPrefix[p].count++;
  corByPrefix[p].closing += r.debitAmount || r.closeNet;
  corByPrefix[p].accounts.push({
    code: r.accountCode,
    name: r.accountName,
    map1: r.map1,
    closing: r.debitAmount || Math.abs(r.closeNet),
  });
}

// Revenue bridge
const revMap1 = isRows.filter((r) => r.map1.toLowerCase() === "revenues");
const revBlank = isRows.filter(
  (r) =>
    !r.map1 &&
    /^4[3-7]/.test(r.accountCode) &&
    (r.creditAmount > 0 || r.closeNet < 0),
);

const revenueBridge = {
  auditosV3Total: revDisplay(revenueGl),
  map1RevenuesOnly: revDisplay(revMap1),
  affiliateTotal: revDisplay(affiliateGl),
  contractTotal: revDisplay(contractGl.filter((r) => r.accountCode !== "4401010003")),
  unbilledDuplicate4401010003: revDisplay(
    revenueGl.filter((r) => r.accountCode === "4401010003"),
  ),
  otherOperatingTotal: revDisplay(
    otherRevGl.filter((r) => r.accountCode !== "4401010003"),
  ),
  blankMap1Revenue: revDisplay(revBlank),
  audited: AUDITED.revenue,
  gapAuditosVsAudited:
    revDisplay(revenueGl) - AUDITED.revenue,
  gapMap1RevenuesVsAudited:
    revDisplay(revMap1) - AUDITED.revenue,
  gapAfterExcludeAffiliate:
    revDisplay(revenueGl) - revDisplay(affiliateGl) - AUDITED.revenue,
};

// Other income bridge
const oi4501010003 = otherIncomeGl.find((r) => r.accountCode === "4501010003");
const oiMisc = otherIncomeGl.filter((r) => r.accountCode !== "4501010003");
const otherIncomeBridge = {
  grossOtherIncomeClosing: revDisplay(otherIncomeGl),
  account4501010003: oi4501010003
    ? {
        code: oi4501010003.accountCode,
        name: oi4501010003.accountName,
        closing: revDisplay([oi4501010003]),
        movement: -oi4501010003.movNet,
      }
    : null,
  smallOtherAccounts: oiMisc.map((r) => ({
    code: r.accountCode,
    name: r.accountName,
    closing: revDisplay([r]),
  })),
  auditedNet: AUDITED.otherIncome,
  grossMinusAudited:
    revDisplay(otherIncomeGl) - AUDITED.otherIncome,
  impliedNettingOffset: revDisplay(otherIncomeGl) - AUDITED.otherIncome,
  financeGross: expDisplay(financeDebits),
  financeCredits: revDisplay(financeCredits),
  financeNetGrossMinusCredits:
    expDisplay(financeDebits) - revDisplay(financeCredits),
  auditedFinance: AUDITED.financeCosts,
};

// CoR bridge
const corBridge = {
  auditosV3Cor: expDisplay(corGl),
  map1CorOnly: expDisplay(isRows.filter((r) => r.map1.toLowerCase() === "cost of revenue")),
  prefix32: expDisplay(corGl.filter((r) => r.accountCode.startsWith("32"))),
  prefix33: expDisplay(corGl.filter((r) => r.accountCode.startsWith("33"))),
  audited: AUDITED.costOfRevenue,
  gap: expDisplay(corGl) - AUDITED.costOfRevenue,
  topCorAccounts: [...corGl]
    .map((r) => ({
      code: r.accountCode,
      name: r.accountName,
      map1: r.map1,
      map2: r.map2,
      closing: r.debitAmount || Math.abs(r.closeNet),
    }))
    .sort((a, b) => b.closing - a.closing)
    .slice(0, 25),
};

// Audited-aligned presentation simulation (rules under test)
const operatingRevenueAuditedStyle =
  revDisplay(revMap1) - revDisplay(revenueGl.filter((r) => r.accountCode === "4401010003"));
const corAuditedStyleCandidate = expDisplay(
  corGl.filter((r) => !r.accountCode.startsWith("33")),
);
const otherIncomeAuditedStyle = AUDITED.otherIncome; // evidence target
const financeAuditedStyle = AUDITED.financeCosts;

const simulatedPresentation = {
  operatingRevenue: revDisplay(revMap1),
  excludeAffiliateFromHeadline: revDisplay(revenueGl) - revDisplay(affiliateGl),
  excludeAffiliateAndUnbilledDup:
    revDisplay(revenueGl) -
    revDisplay(affiliateGl) -
    revDisplay(revenueGl.filter((r) => r.accountCode === "4401010003")),
  map1RevenuesExclUnbilled:
    revDisplay(revMap1) -
    revDisplay(revenueGl.filter((r) => r.accountCode === "4401010003")),
  corExcl33xx: corAuditedStyleCandidate,
  corMap1Only: expDisplay(isRows.filter((r) => r.map1.toLowerCase() === "cost of revenue")),
  otherIncomeNetRule_smallAccountsOnly: revDisplay(oiMisc),
  otherIncomeUsingAuditedTarget: otherIncomeAuditedStyle,
};

const out = {
  audited: AUDITED,
  map1Summary: map1Summary.filter((m) =>
    /revenue|cost|finance|other|zakat|administrative|affiliate/i.test(m.map1),
  ),
  revenueBridge,
  revenueGlDetail: revenueGl.map((r) => ({
    code: r.accountCode,
    name: r.accountName,
    map1: r.map1,
    map2: r.map2,
    closing: revDisplay([r]),
    movement: -r.movNet,
  })),
  corBridge,
  corByPrefix: Object.fromEntries(
    Object.entries(corByPrefix)
      .sort((a, b) => b[1].closing - a[1].closing)
      .slice(0, 15),
  ),
  otherIncomeBridge,
  financeGlDetail: financeGl.map((r) => ({
    code: r.accountCode,
    name: r.accountName,
    map1: r.map1,
    closingDebit: r.debitAmount,
    closingCredit: r.creditAmount,
    closeNet: r.closeNet,
    movement: r.movNet,
  })),
  simulatedPresentation,
};

const outDir = path.join("docs", "audits", "evidence");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "p11-audited-presentation-analysis.json"),
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
