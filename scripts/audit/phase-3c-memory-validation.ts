#!/usr/bin/env tsx
/**
 * Phase 3C — Firm Memory validation (Year 2 reuse simulation).
 * Measures memory-only classification on confirmed Shalfa TB (no rules/AI).
 *
 * Usage:
 *   npm run phase-3c:validate
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
  const { classifyAccountFirmMemoryOnly } = await import(
    "../../src/lib/tb-intelligence/engine"
  );
  const { metricCategoryFromCanonical } = await import(
    "../../src/lib/tb-intelligence/erp-intelligence-mining"
  );
  const {
    FIRM_MEMORY_AUTO_SUGGEST_MIN_CONFIDENCE,
    isFirmMemoryAutoSuggestEligible,
  } = await import("../../src/lib/tb-intelligence/firm-memory");

  const orgId = await resolveFirmMemoryOrganizationIdFromEngagement(ENGAGEMENT_ID);
  if (!orgId) {
    console.error("Could not resolve firm memory organization");
    process.exit(1);
  }

  const patternCount = await prisma.tBMappingPattern.count({
    where: { organizationId: orgId },
  });

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

  const hintsByCode = new Map<string, string[]>();
  for (const row of history) {
    if (hintsByCode.has(row.accountCode)) continue;
    const hints = Array.isArray(row.mappingHints)
      ? (row.mappingHints as string[]).map((h) => String(h).trim()).filter(Boolean)
      : [];
    hintsByCode.set(row.accountCode, hints);
  }

  console.log("=== Phase 3C Firm Memory Validation (Year 2 simulation) ===");
  console.log(`engagement: ${ENGAGEMENT_ID} | memory patterns: ${patternCount}`);

  if (patternCount === 0) {
    console.error("No firm memory — run npm run phase-3c:backfill first");
    process.exit(1);
  }

  let exact = 0;
  let autoSuggestEligible = 0;
  let trustedCount = 0;
  let confirmedCount = 0;
  let missed = 0;
  const byCategory: Record<string, { total: number; exact: number }> = {};
  const results: Array<{
    accountCode: string;
    accountName: string;
    expected: string;
    predicted: string | null;
    confidence: number;
    evidence?: string;
    autoSuggest: boolean;
  }> = [];

  for (const m of mappings) {
    const expected = m.canonicalAccount!.code;
    const cat = metricCategoryFromCanonical(expected);
    byCategory[cat] ??= { total: 0, exact: 0 };
    byCategory[cat].total++;

    const hints = hintsByCode.get(m.sourceAccountCode) ?? [];
    const result = await classifyAccountFirmMemoryOnly({
      organizationId: orgId,
      engagementId: ENGAGEMENT_ID,
      accountCode: m.sourceAccountCode,
      accountName: m.sourceAccountName,
      classificationHints: hints,
    });

    const predicted = result?.canonicalCode ?? null;
    const correct = predicted === expected;
    if (correct) {
      exact++;
      byCategory[cat].exact++;
    } else if (!predicted) {
      missed++;
    }

    const autoSuggest = result ? isFirmMemoryAutoSuggestEligible(result) : false;
    if (autoSuggest) autoSuggestEligible++;
    if (result?.memoryGovernance?.status === "TRUSTED") trustedCount++;
    if (result?.memoryGovernance?.status === "CONFIRMED") confirmedCount++;

    results.push({
      accountCode: m.sourceAccountCode,
      accountName: m.sourceAccountName,
      expected,
      predicted,
      confidence: result?.confidence ?? 0,
      evidence: result?.evidence,
      autoSuggest,
    });
  }

  const total = mappings.length;
  const accuracy = total > 0 ? exact / total : 0;

  const artifact = {
    phase: "3C",
    engagementId: ENGAGEMENT_ID,
    organizationId: orgId,
    finishedAt: new Date().toISOString(),
    memoryPatternCount: patternCount,
    accountCount: total,
    accuracy,
    exact,
    missed,
    autoSuggestEligible,
    trustedCount,
    confirmedCount,
    autoSuggestMinConfidence: FIRM_MEMORY_AUTO_SUGGEST_MIN_CONFIDENCE,
    byCategory,
    results,
  };

  const outDir = resolve(__dirname, "../../docs/audits/evidence");
  mkdirSync(outDir, { recursive: true });
  const jsonPath = resolve(outDir, "phase-3c-firm-memory-validation.json");
  writeFileSync(jsonPath, JSON.stringify(artifact, null, 2));

  const reportPath = resolve(
    __dirname,
    "../../docs/architecture/PHASE_3C_FIRM_MEMORY_VALIDATION.md",
  );
  writeFileSync(
    reportPath,
    `# Phase 3C — Firm Memory Validation (Year 2 Simulation)

**Date:** ${artifact.finishedAt.slice(0, 10)}  
**Engagement:** \`${ENGAGEMENT_ID}\`  
**Memory patterns:** ${patternCount}  
**Evidence:** \`docs/audits/evidence/phase-3c-firm-memory-validation.json\`

## Result

| Metric | Value |
|--------|------:|
| Memory-only accuracy | **${(accuracy * 100).toFixed(1)}%** (${exact}/${total}) |
| TRUSTED (high-confidence auto-suggest eligible) | ${trustedCount}/${total} |
| CONFIRMED (suggest, human review required) | ${confirmedCount}/${total} |
| High-confidence auto-suggest (TRUSTED + conf ≥ ${FIRM_MEMORY_AUTO_SUGGEST_MIN_CONFIDENCE}) | ${autoSuggestEligible}/${total} |
| No memory match | ${missed} |

**Note:** First-year backfill stores \`hitCount=1\` (confidence 0.75). Memory still matches and suggests mappings; high-confidence auto-suggest tier activates after repeated confirmations (\`hitCount ≥ 5\` → 0.85+).

## By Category

| Category | Total | Correct | Accuracy |
|----------|------:|--------:|---------:|
${Object.entries(byCategory)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(
    ([cat, v]) =>
      `| ${cat} | ${v.total} | ${v.exact} | ${((v.exact / Math.max(v.total, 1)) * 100).toFixed(1)}% |`,
  )
  .join("\n")}

## Interpretation

This simulates **Year 2 TB upload** on the same ERP/chart: only firm memory is used (no rules, no Local AI). High accuracy here validates the **Audit Knowledge Moat** strategy from Phase 3C architecture decision.
`,
  );

  console.log(`\nMemory-only accuracy: ${(accuracy * 100).toFixed(1)}% (${exact}/${total})`);
  console.log(`Auto-suggest eligible: ${autoSuggestEligible}/${total}`);
  console.log(`artifact: ${jsonPath}`);
  console.log(`report: ${reportPath}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
