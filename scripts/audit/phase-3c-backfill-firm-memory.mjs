#!/usr/bin/env node
/**
 * Phase 3C — Backfill firm memory from confirmed Shalfa mappings (Year 1 → memory).
 *
 * Usage:
 *   npm run phase-3c:backfill
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";

const ENGAGEMENT_ID = process.env.ENGAGEMENT_ID ?? "eng-shalfa-2025";
const REVIEWER_ID = process.env.PHASE_3C_REVIEWER_ID ?? "shalfa-pilot-backfill";

function pickHints(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((h) => String(h).trim()).filter(Boolean);
}

async function main() {
  const { prisma } = await import("../../src/lib/prisma.ts");
  const { resolveFirmMemoryOrganizationIdFromEngagement } = await import(
    "../../src/lib/tb-intelligence/org-resolver.ts"
  );
  const { backfillFirmMemoryFromConfirmedMappings } = await import(
    "../../src/lib/tb-intelligence/firm-memory-engine.ts"
  );

  const orgId = await resolveFirmMemoryOrganizationIdFromEngagement(ENGAGEMENT_ID);
  if (!orgId) {
    console.error("Could not resolve firm memory organization");
    process.exit(1);
  }

  const mappings = await prisma.auditAccountMapping.findMany({
    where: { engagementId: ENGAGEMENT_ID, status: "confirmed" },
    include: { canonicalAccount: true },
    orderBy: { sourceAccountCode: "asc" },
  });

  const history = await prisma.tBClassificationHistory.findMany({
    where: { engagementId: ENGAGEMENT_ID },
    orderBy: { createdAt: "desc" },
    select: { accountCode: true, mappingHints: true },
  });

  const hintsByCode = new Map();
  for (const row of history) {
    if (hintsByCode.has(row.accountCode)) continue;
    hintsByCode.set(row.accountCode, pickHints(row.mappingHints));
  }

  const rows = mappings
    .filter((m) => m.canonicalAccountId && m.canonicalAccount?.code)
    .map((m) => ({
      accountCode: m.sourceAccountCode,
      accountName: m.sourceAccountName,
      canonicalAccountId: m.canonicalAccountId,
      classificationHints: hintsByCode.get(m.sourceAccountCode) ?? [],
    }));

  console.log("=== Phase 3C Firm Memory Backfill ===");
  console.log(`engagement: ${ENGAGEMENT_ID} | org: ${orgId}`);
  console.log(`confirmed mappings: ${rows.length}`);

  const { written } = await backfillFirmMemoryFromConfirmedMappings({
    organizationId: orgId,
    engagementId: ENGAGEMENT_ID,
    reviewerId: REVIEWER_ID,
    rows,
  });

  console.log(`firm memory patterns written: ${written}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
