/**
 * After TB.xlsx upload: bulk-confirm pending mappings and run factory pipeline.
 *
 * Usage:
 *   npx tsx -r ./scripts/mock-server-only.cjs scripts/tb-pilot-continue.mjs [engagementId]
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5434/aqliya?schema=public";

process.env.FF_AUDIT_FS_V2 = "true";
process.env.FF_AUDIT_IFRS_RULES = "true";
process.env.FF_AUDIT_SOCPA_RULES = "true";
process.env.FF_AUDIT_DISCLOSURE_AUTO = "true";
process.env.FF_AUDIT_RECONCILIATION = "true";
process.env.FF_AUDIT_REPORTING_GRAPH = "true";
process.env.FF_AUDIT_LEAD_SCHEDULE_AUTO = "true";
process.env.FF_AUDIT_APPROVAL_GATES = "true";

const engagementId = process.argv[2] ?? "eng-gulf-2025";

const { prisma } = await import("../../src/lib/prisma.ts");
const { confirmAllSuggestedMappings } = await import(
  "../../src/lib/audit/services.ts"
);

const pendingBefore = await prisma.auditAccountMapping.count({
  where: { engagementId, status: "pending" },
});
console.log(`Engagement: ${engagementId}`);
console.log(`Pending mappings before: ${pendingBefore}`);

const { confirmedCount, mappings } =
  await confirmAllSuggestedMappings(engagementId);
console.log(`Confirmed: ${confirmedCount}`);

const pendingAfter = await prisma.auditAccountMapping.count({
  where: { engagementId, status: "pending" },
});
console.log(`Pending mappings after: ${pendingAfter}`);

async function runStep(name, fn) {
  try {
    const result = await fn();
    console.log(`✓ ${name}`, result ? JSON.stringify(result).slice(0, 180) : "");
    return true;
  } catch (err) {
    console.error(`✗ ${name}:`, err instanceof Error ? err.message : err);
    return false;
  }
}

await runStep("FS v2 rebuild", async () => {
  const { maybeRebuildFinancialStatements } = await import(
    "../../src/lib/audit/fs-engine/index.ts"
  );
  return { rebuilt: await maybeRebuildFinancialStatements(engagementId) };
});

await runStep("Lead schedules", async () => {
  const { maybeGenerateLeadSchedules } = await import(
    "../../src/lib/audit/lead-schedule/index.ts"
  );
  await maybeGenerateLeadSchedules(engagementId, "mapping_confirm");
});

await runStep("Reconciliation", async () => {
  const { runReconciliationForEngagement } = await import(
    "../../src/lib/audit/reconciliation/index.ts"
  );
  const recon = await runReconciliationForEngagement(engagementId);
  return {
    passed: recon.passed,
    failedCount: recon.failedCount,
    failed: recon.checks.filter((c) => !c.passed).map((c) => c.code),
  };
});

const tb = await prisma.auditTrialBalance.findFirst({
  where: { engagementId },
  orderBy: { createdAt: "desc" },
  select: {
    sourceFile: true,
    totalDebits: true,
    totalCredits: true,
    variance: true,
    trustState: true,
  },
});

console.log("\nSummary:");
console.log(JSON.stringify({ tb, confirmedCount, pendingAfter }, null, 2));

await prisma.$disconnect();
