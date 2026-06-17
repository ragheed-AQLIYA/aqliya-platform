/**
 * Debug FS balance sheet totals vs mapping coverage.
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5434/aqliya?schema=public";
process.env.FF_AUDIT_FS_V2 = "true";

const engagementId = process.argv[2] ?? "eng-gulf-2025";

const { prisma } = await import("../../src/lib/prisma.ts");

const bs = await prisma.auditFinancialStatement.findFirst({
  where: { engagementId, statementType: "balance_sheet" },
  include: { lines: { orderBy: { displayOrder: "asc" } } },
});

if (!bs) {
  console.log("No BS");
  process.exit(0);
}

for (const line of bs.lines) {
  if (
    line.label.toUpperCase().includes("TOTAL") ||
    Math.abs(line.amount) > 1_000_000
  ) {
    console.log(line.label, line.amount);
  }
}

const mappings = await prisma.auditAccountMapping.groupBy({
  by: ["statementClassification"],
  where: { engagementId, status: "confirmed" },
  _count: true,
  _sum: { debitAmount: true, creditAmount: true },
});
console.log("\nMappings by classification:", mappings);

await prisma.$disconnect();
