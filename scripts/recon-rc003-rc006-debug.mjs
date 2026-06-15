/**
 * Debug RC-003 BS totals and RC-006 cash tie components.
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5434/aqliya?schema=public";
process.env.FF_AUDIT_FS_V2 = "true";

const engagementId = process.argv[2] ?? "eng-gulf-2025";

const { prisma } = await import("../src/lib/prisma.ts");
const { getMappingDisplayAmount } = await import(
  "../src/lib/audit/db/statement-builder.ts"
);
const { getMappingClosingBalance } = await import(
  "../src/lib/audit/lead-schedule/balance-utils.ts"
);
const { deriveCashFlowContext } = await import(
  "../src/lib/audit/fs-engine/cash-flow-builder.ts"
);
const { parseStatementLines } = await import(
  "../src/lib/audit/reconciliation/reconciliation-checks.ts"
);

const mappings = await prisma.auditAccountMapping.findMany({
  where: { engagementId, status: "confirmed" },
  include: { canonicalAccount: true },
});

const statements = await prisma.auditFinancialStatement.findMany({
  where: { engagementId },
});

const bs = statements.find((s) => s.statementType === "balance_sheet");
const bsLines = bs ? parseStatementLines(bs.lines) : [];

const byCategory = {};
for (const m of mappings) {
  const cat =
    m.statementClassification ?? m.canonicalAccount?.category ?? "?";
  const st = m.canonicalAccount?.statementType ?? "?";
  if (st !== "balance_sheet") continue;
  const amt = getMappingDisplayAmount(m);
  byCategory[cat] = (byCategory[cat] ?? 0) + amt;
}

console.log("BS mapping sums by category:", byCategory);
console.log(
  "BS TOTAL lines:",
  bsLines
    .filter((l) => l.label.toUpperCase().includes("TOTAL"))
    .map((l) => ({ label: l.label, amount: l.amount })),
);

const ca1010 = mappings.filter((m) => m.canonicalAccount?.code === "CA-1010");
const ca1010Sum = ca1010.reduce((s, m) => s + getMappingDisplayAmount(m), 0);
console.log("\nCA-1010 mappings:", ca1010.length, "sum:", ca1010Sum);

const bankLabelFilter = mappings.filter((m) => {
  const label =
    `${m.sourceAccountCode} ${m.sourceAccountName ?? ""} ${m.canonicalAccount?.name ?? ""}`.toLowerCase();
  return (
    label.includes("cash") ||
    label.includes("bank") ||
    label.includes("نقد") ||
    label.includes("بنك")
  );
});
const bankLabelSum = bankLabelFilter.reduce(
  (s, m) =>
    s +
    getMappingClosingBalance({
      debitAmount: m.debitAmount,
      creditAmount: m.creditAmount,
      statementClassification: m.statementClassification,
      canonicalAccount: m.canonicalAccount,
    }),
  0,
);
console.log("RC-006 bank-label filter:", bankLabelFilter.length, "sum:", bankLabelSum);

const is = statements.find((s) => s.statementType === "income_statement");
const isLines = is
  ? parseStatementLines(is.lines).map((l) => ({ label: l.label, amount: l.amount }))
  : [];
const cfCtx = deriveCashFlowContext({
  mappings,
  incomeStatementLines: isLines,
});
console.log("\nCash flow context:", cfCtx);

const nonCa1010Bank = bankLabelFilter.filter(
  (m) => m.canonicalAccount?.code !== "CA-1010",
);
console.log(
  "\nNon-CA-1010 but bank-label matches:",
  nonCa1010Bank.length,
);
for (const m of nonCa1010Bank.slice(0, 15)) {
  console.log(
    `  ${m.sourceAccountCode} ${m.sourceAccountName} → ${m.canonicalAccount?.code} ${m.canonicalAccount?.name} bal=${getMappingDisplayAmount(m)}`,
  );
}

await prisma.$disconnect();
