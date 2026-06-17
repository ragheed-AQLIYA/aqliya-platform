#!/usr/bin/env tsx
/**
 * Phase 3D — Firm Memory governance validation.
 * Audits TBMappingPattern status distribution and auto-suggest eligibility.
 *
 * Usage:
 *   npm run phase-3d:validate-governance
 */
import { config } from "dotenv";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });

process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";

const ENGAGEMENT_ID = process.env.ENGAGEMENT_ID ?? "eng-shalfa-2025";

async function main() {
  const { prisma } = await import("../../src/lib/prisma");
  const { resolveFirmMemoryOrganizationIdFromEngagement } = await import(
    "../../src/lib/tb-intelligence/org-resolver"
  );
  const { evaluateMemoryGovernance } = await import(
    "../../src/lib/tb-intelligence/firm-memory-governance"
  );
  const { FIRM_MEMORY_AUTO_SUGGEST_MIN_CONFIDENCE } = await import(
    "../../src/lib/tb-intelligence/firm-memory-engine"
  );
  const { confidenceFromHitCount } = await import(
    "../../src/lib/tb-intelligence/firm-memory"
  );

  const orgId = await resolveFirmMemoryOrganizationIdFromEngagement(ENGAGEMENT_ID);
  if (!orgId) {
    console.error("Could not resolve firm memory organization");
    process.exit(1);
  }

  const patterns = await prisma.tBMappingPattern.findMany({
    where: { organizationId: orgId },
    orderBy: { clientAccountCode: "asc" },
  });

  if (patterns.length === 0) {
    console.error("No firm memory patterns — run npm run phase-3c:backfill first");
    process.exit(1);
  }

  const statusCounts: Record<string, number> = {
    DRAFT: 0,
    CONFIRMED: 0,
    TRUSTED: 0,
    DEPRECATED: 0,
  };
  const evaluatedCounts: Record<string, number> = {
    DRAFT: 0,
    CONFIRMED: 0,
    TRUSTED: 0,
    DEPRECATED: 0,
  };

  let autoSuggestEligible = 0;
  let storedStatusMismatch = 0;
  const blockReasonFreq = new Map<string, number>();
  const samples: Array<{
    clientAccountCode: string;
    storedStatus: string;
    evaluatedStatus: string;
    hitCount: number;
    reviewerCount: number;
    autoSuggest: boolean;
    blockReasons: string[];
  }> = [];

  for (const p of patterns) {
    statusCounts[p.status] = (statusCounts[p.status] ?? 0) + 1;

    const evaluated = evaluateMemoryGovernance({
      status: p.status,
      hitCount: p.hitCount,
      confirmedReviewerIds: p.confirmedReviewerIds,
      lastConfirmedAt: p.lastConfirmedAt,
      lastUsedAt: p.lastUsedAt,
      deprecatedAt: p.deprecatedAt,
    });
    evaluatedCounts[evaluated.status] = (evaluatedCounts[evaluated.status] ?? 0) + 1;

    if (p.status !== evaluated.status) storedStatusMismatch++;

    for (const reason of evaluated.blockReasons) {
      blockReasonFreq.set(reason, (blockReasonFreq.get(reason) ?? 0) + 1);
    }

    const confidence = confidenceFromHitCount(p.hitCount);
    const autoSuggest =
      evaluated.trustedForAutoSuggest &&
      confidence >= FIRM_MEMORY_AUTO_SUGGEST_MIN_CONFIDENCE;
    if (autoSuggest) autoSuggestEligible++;

    if (samples.length < 5) {
      samples.push({
        clientAccountCode: p.clientAccountCode,
        storedStatus: p.status,
        evaluatedStatus: evaluated.status,
        hitCount: p.hitCount,
        reviewerCount: evaluated.reviewerCount,
        autoSuggest,
        blockReasons: evaluated.blockReasons,
      });
    }
  }

  const total = patterns.length;
  const passExpectations =
    evaluatedCounts.TRUSTED === 0 &&
    autoSuggestEligible === 0 &&
    (evaluatedCounts.CONFIRMED ?? 0) === total;

  const artifact = {
    phase: "3D",
    engagementId: ENGAGEMENT_ID,
    organizationId: orgId,
    finishedAt: new Date().toISOString(),
    patternCount: total,
    storedStatusCounts: statusCounts,
    evaluatedStatusCounts: evaluatedCounts,
    storedStatusMismatch,
    autoSuggestEligible,
    autoSuggestMinConfidence: FIRM_MEMORY_AUTO_SUGGEST_MIN_CONFIDENCE,
    topBlockReasons: [...blockReasonFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([reason, count]) => ({ reason, count })),
    postBackfillExpectationsMet: passExpectations,
    samples,
  };

  const outDir = resolve(__dirname, "../../docs/audits/evidence");
  mkdirSync(outDir, { recursive: true });
  const jsonPath = resolve(outDir, "phase-3d-governance-validation.json");
  writeFileSync(jsonPath, JSON.stringify(artifact, null, 2));

  const reportPath = resolve(
    __dirname,
    "../../docs/audits/PHASE_3D_GOVERNANCE_VALIDATION.md",
  );
  writeFileSync(
    reportPath,
    `# Phase 3D — Firm Memory Governance Validation

**Date:** ${artifact.finishedAt.slice(0, 10)}  
**Engagement:** \`${ENGAGEMENT_ID}\`  
**Patterns:** ${total}  
**Evidence:** \`docs/audits/evidence/phase-3d-governance-validation.json\`

## Status Distribution

| Status (stored) | Count |
|-----------------|------:|
${Object.entries(statusCounts)
  .map(([s, n]) => `| ${s} | ${n} |`)
  .join("\n")}

| Status (evaluated) | Count |
|--------------------|------:|
${Object.entries(evaluatedCounts)
  .map(([s, n]) => `| ${s} | ${n} |`)
  .join("\n")}

## Auto-Suggest Eligibility

| Metric | Value |
|--------|------:|
| TRUSTED + conf ≥ ${FIRM_MEMORY_AUTO_SUGGEST_MIN_CONFIDENCE} | **${autoSuggestEligible}/${total}** |
| Stored vs evaluated mismatch | ${storedStatusMismatch} |
| Post-backfill expectations (0 TRUSTED, 0 auto-suggest, all CONFIRMED) | **${passExpectations ? "PASS" : "FAIL"}** |

## Top Block Reasons

| Reason | Count |
|--------|------:|
${artifact.topBlockReasons.map((r) => `| ${r.reason} | ${r.count} |`).join("\n") || "| — | — |"}

## Interpretation

First-year backfill uses \`hitCount=1\` and a single reviewer → patterns remain **CONFIRMED**, not **TRUSTED**. Memory still matches on reuse (see Phase 3C validation); high-confidence auto-suggest activates only after repeated confirmations across reviewers.
`,
  );

  console.log("=== Phase 3D Firm Memory Governance Validation ===");
  console.log(`patterns: ${total}`);
  console.log(`evaluated TRUSTED: ${evaluatedCounts.TRUSTED ?? 0}`);
  console.log(`auto-suggest eligible: ${autoSuggestEligible}/${total}`);
  console.log(`post-backfill expectations: ${passExpectations ? "PASS" : "FAIL"}`);
  console.log(`artifact: ${jsonPath}`);
  console.log(`report: ${reportPath}`);

  await prisma.$disconnect();
  process.exit(passExpectations ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
