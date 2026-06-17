process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5434/aqliya?schema=public";

const engagementId = process.argv[2] ?? "eng-gulf-2025";

const { prisma } = await import("../../src/lib/prisma.ts");

const tb = await prisma.auditTrialBalance.findFirst({
  where: { engagementId },
  orderBy: { createdAt: "desc" },
  select: {
    id: true,
    sourceFile: true,
    totalDebits: true,
    totalCredits: true,
    variance: true,
    trustState: true,
    _count: { select: { lines: true } },
  },
});

const mappings = await prisma.auditAccountMapping.groupBy({
  by: ["status"],
  where: { engagementId },
  _count: true,
});

const pending = await prisma.auditAccountMapping.count({
  where: { engagementId, status: "pending" },
});

const confirmed = await prisma.auditAccountMapping.count({
  where: { engagementId, status: "confirmed" },
});

const statements = await prisma.auditFinancialStatement.findMany({
  where: { engagementId },
  select: { statementType: true, status: true },
});

console.log(
  JSON.stringify(
    {
      engagementId,
      latestTb: tb,
      mappingStatus: mappings,
      pendingMappings: pending,
      confirmedMappings: confirmed,
      statements,
    },
    null,
    2,
  ),
);

await prisma.$disconnect();
