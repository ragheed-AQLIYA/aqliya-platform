/**
 * Clear TB / mapping / derived factory artifacts for one engagement (pilot re-upload).
 *
 * Usage:
 *   npx tsx -r ./scripts/mock-server-only.cjs scripts/tb-reset-engagement.mjs [engagementId]
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5434/aqliya?schema=public";

const engagementId = process.argv[2] ?? "eng-gulf-2025";

const { prisma } = await import("../../src/lib/prisma.ts");

const engagement = await prisma.auditEngagement.findUnique({
  where: { id: engagementId },
  select: { id: true },
});
if (!engagement) {
  console.error(`Engagement not found: ${engagementId}`);
  process.exit(1);
}

console.log(`Resetting TB factory data for ${engagementId}...`);

const tbIds = (
  await prisma.auditTrialBalance.findMany({
    where: { engagementId },
    select: { id: true },
  })
).map((t) => t.id);

if (tbIds.length) {
  await prisma.auditTrialBalanceLine.deleteMany({
    where: { trialBalanceId: { in: tbIds } },
  });
  await prisma.auditTrialBalance.deleteMany({ where: { engagementId } });
}

await prisma.auditAccountMapping.deleteMany({ where: { engagementId } });
await prisma.leadScheduleLine.deleteMany({
  where: { leadSchedule: { engagementId } },
});
await prisma.leadSchedule.deleteMany({ where: { engagementId } });
await prisma.auditFinancialStatement.deleteMany({ where: { engagementId } });
await prisma.tBClassificationHistory.deleteMany({ where: { engagementId } });

const graph = await prisma.reportingGraph.findFirst({
  where: { engagementId },
  select: { id: true },
});
if (graph) {
  await prisma.reportingGraphSnapshot.deleteMany({
    where: { graphId: graph.id },
  });
  await prisma.reportingGraphEdge.deleteMany({ where: { graphId: graph.id } });
  await prisma.reportingGraphNode.deleteMany({ where: { graphId: graph.id } });
  await prisma.reportingGraph.delete({ where: { id: graph.id } });
}

console.log("Done. Engagement ready for fresh TB upload.");

await prisma.$disconnect();
