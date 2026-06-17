#!/usr/bin/env tsx
/**
 * Phase 3B.2 + 3B.3 — Stratified hold-out (80/20 per category) then Map2 refinement.
 *
 * Usage:
 *   npm run phase-3b2:stratified
 */
import { config } from "dotenv";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });

process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";

const ENGAGEMENT_ID = process.env.ENGAGEMENT_ID ?? "eng-shalfa-2025";
const SUCCESS_TARGET = 0.65;

function pickHints(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((h) => String(h).trim()).filter(Boolean);
}

function fmt(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function catTable(byCategory: Record<string, { total: number; exact: number }>) {
  return Object.entries(byCategory)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([cat, v]) =>
        `| ${cat} | ${v.total} | ${v.exact} | ${fmt(v.exact / Math.max(v.total, 1))} |`,
    )
    .join("\n");
}

function layerTable(
  layerPrecision: Record<
    string,
    { hits: number; correct: number; precision: number }
  >,
) {
  return Object.entries(layerPrecision)
    .sort((a, b) => b[1].hits - a[1].hits)
    .map(
      ([layer, v]) =>
        `| ${layer} | ${v.hits} | ${v.correct} | ${fmt(v.precision)} |`,
    )
    .join("\n");
}

function buildReport(artifact: {
  engagementId: string;
  finishedAt: string;
  splitByCategory: Record<string, { train: number; test: number; total: number }>;
  baseline: {
    trainSize: number;
    testSize: number;
    summary: { accuracy: number; exact: number; total: number; byCategory: Record<string, { total: number; exact: number }>; layerPrecision: Record<string, { hits: number; correct: number; precision: number }> };
    successMet: boolean;
  };
  refined: {
    summary: { accuracy: number; exact: number; total: number; byCategory: Record<string, { total: number; exact: number }>; layerPrecision: Record<string, { hits: number; correct: number; precision: number }> };
    map2Assets: {
      global: number;
      composite: number;
      ambiguous: number;
    };
    successMet: boolean;
  };
  map2ErrorAnalysis: Array<{
    map2Label: string;
    count: number;
    topConfusions: Array<{
      accountName: string;
      expectedCode: string;
      predictedCode: string;
      expectedCategory: string;
      predictedCategory: string;
    }>;
  }>;
  successTarget: number;
}): string {
  const baselinePass = artifact.baseline.successMet;
  const refinedPass = artifact.refined.successMet;

  const map2ErrorRows = artifact.map2ErrorAnalysis
    .slice(0, 12)
    .flatMap((g) =>
      g.topConfusions.slice(0, 3).map(
        (c) =>
          `| ${g.map2Label.slice(0, 20)} | ${c.accountName.slice(0, 22)} | ${c.expectedCategory} | ${c.predictedCategory} | ${c.expectedCode} | ${c.predictedCode} |`,
      ),
    )
    .join("\n");

  return `# Phase 3B.2 + 3B.3 — Stratified Hold-Out & Map2 Refinement

**Date:** ${artifact.finishedAt.slice(0, 10)}  
**Engagement:** \`${artifact.engagementId}\`  
**Split:** 80% train / 20% test **within each category** (deterministic, sorted GL code)  
**Exact-name memory:** disabled on all test rows  
**Evidence:** \`docs/audits/evidence/phase-3b2-stratified-holdout.json\`

---

## Stratified Split Composition

| Category | Total | Train (80%) | Test (20%) |
|----------|------:|------------:|-----------:|
${Object.entries(artifact.splitByCategory)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(
    ([cat, v]) =>
      `| ${cat} | ${v.total} | ${v.train} | ${v.test} |`,
  )
  .join("\n")}

**Test total:** ${artifact.baseline.testSize} accounts across all categories (includes Assets, Liabilities, Cash — not Revenue-only).

---

## Phase 3B.2 — Baseline (coarse Map2)

| Metric | Target | Result | Status |
|--------|--------|--------|--------|
| Stratified hold-out | ≥65% | **${fmt(artifact.baseline.summary.accuracy)}** (${artifact.baseline.summary.exact}/${artifact.baseline.summary.total}) | ${baselinePass ? "PASS ✅" : "BELOW TARGET ⚠️"} |

### By Category — Baseline

| Category | Test | Correct | Accuracy |
|----------|-----:|--------:|---------:|
${catTable(artifact.baseline.summary.byCategory)}

### Layer Precision — Baseline

| Layer | Hits | Correct | Precision |
|-------|-----:|--------:|----------:|
${layerTable(artifact.baseline.summary.layerPrecision)}

---

## Phase 3B.3 — Map2 Refinement

Refined Map2 assets mined from train:

| Asset | Count |
|-------|------:|
| Map2 global (unambiguous ≥95%) | ${artifact.refined.map2Assets.global} |
| Map2 composite (Map2+name / Map1+Map2+name) | ${artifact.refined.map2Assets.composite} |
| Ambiguous Map2 labels (composite-only) | ${artifact.refined.map2Assets.ambiguous} |

| Metric | Target | Result | Delta vs baseline |
|--------|--------|--------|-------------------|
| Stratified hold-out (refined Map2) | ≥65% | **${fmt(artifact.refined.summary.accuracy)}** (${artifact.refined.summary.exact}/${artifact.refined.summary.total}) | ${artifact.refined.summary.accuracy >= artifact.baseline.summary.accuracy ? "+" : ""}${((artifact.refined.summary.accuracy - artifact.baseline.summary.accuracy) * 100).toFixed(1)} pp |

**Status:** ${refinedPass ? "PASS ✅ — proceed to Phase 3C Firm Learning Engine" : "NOT YET — Map2/generalization still below moat threshold"}

### By Category — After Map2 Refinement

| Category | Test | Correct | Accuracy |
|----------|-----:|--------:|---------:|
${catTable(artifact.refined.summary.byCategory)}

### Layer Precision — After Map2 Refinement

| Layer | Hits | Correct | Precision |
|-------|-----:|--------:|----------:|
${layerTable(artifact.refined.summary.layerPrecision)}

---

## Map2 Error Analysis (baseline failures, layer=map2)

| Map2 Label | Account Name | Expected Cat | Predicted Cat | Expected | Predicted |
|------------|--------------|--------------|---------------|----------|-----------|
${map2ErrorRows || "| — | — | — | — | — | — |"}

---

## Decision

${refinedPass
  ? "**Phase 3C approved** — ERP Intelligence generalizes on stratified hold-out without exact-name memory."
  : baselinePass
    ? "**Partial** — baseline passed stratified test; refine Map2 further before Phase 3C."
    : "**Phase 3C deferred** — measure generalization first; Firm Memory is proven separately (100% in-sample) but not the question here."}

**Deferred:** Phase 4 UI, Local AI tenant settings, fine-tuning, RAG, embeddings, Knowledge Graph.
`;
}

async function main() {
  const { prisma } = await import("../../src/lib/prisma");
  const { loadCanonicalCandidates } = await import(
    "../../src/lib/tb-intelligence/coa-loader"
  );
  const {
    labelRows,
    stratifiedSplit80_20,
    mineAndEvalHoldout,
    metricCategoryFromCanonical,
  } = await import("../../src/lib/tb-intelligence/holdout-eval");
  const { analyzeMap2Errors } = await import(
    "../../src/lib/tb-intelligence/map2-refinement"
  );

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
    hintsByCode.set(row.accountCode, pickHints(row.mappingHints));
  }

  const allRows = labelRows(
    mappings
      .filter((m) => m.canonicalAccount?.code)
      .map((m) => {
        const hints = hintsByCode.get(m.sourceAccountCode) ?? [];
        return {
          accountCode: m.sourceAccountCode,
          accountName: m.sourceAccountName,
          canonicalCode: m.canonicalAccount!.code,
          map1: hints[0] ?? null,
          map2: hints[1] ?? null,
          hints,
        };
      }),
  );

  const { train, test, splitByCategory } = stratifiedSplit80_20(allRows);

  console.log("=== Phase 3B.2 Stratified Hold-Out ===");
  console.log(`engagement: ${ENGAGEMENT_ID} | total: ${allRows.length}`);
  console.log(`train: ${train.length} | test: ${test.length}`);
  for (const [cat, v] of Object.entries(splitByCategory).sort()) {
    console.log(`  ${cat}: ${v.train}+${v.test}=${v.total}`);
  }

  const candidates = await loadCanonicalCandidates();
  const trainCore = train.map((r) => ({
    accountCode: r.accountCode,
    accountName: r.accountName,
    canonicalCode: r.canonicalCode,
    map1: r.map1,
    map2: r.map2,
  }));

  console.log("\n--- 3B.2 Baseline (coarse Map2) ---");
  const baseline = mineAndEvalHoldout(
    trainCore,
    test,
    candidates,
    `${ENGAGEMENT_ID}-stratified-baseline`,
    { includeExactNames: false, useMap2Refinement: false, allowExactName: false },
  );
  console.log(
    `Accuracy: ${fmt(baseline.summary.accuracy)} (${baseline.summary.exact}/${baseline.summary.total})`,
  );

  console.log("\n--- 3B.3 Map2 Refinement ---");
  const refined = mineAndEvalHoldout(
    trainCore,
    test,
    candidates,
    `${ENGAGEMENT_ID}-stratified-refined`,
    {
      includeExactNames: false,
      useMap2Refinement: true,
      allowExactName: false,
    },
  );
  console.log(
    `Accuracy: ${fmt(refined.summary.accuracy)} (${refined.summary.exact}/${refined.summary.total})`,
  );
  console.log(
    `Map2 assets: global=${Object.keys(refined.dictionary.map2GlobalToCanonical ?? {}).length} composite=${Object.keys(refined.dictionary.map2CompositeToCanonical ?? {}).length}`,
  );

  const baselineFailures = baseline.results.filter((r) => !r.correct);
  const map2ErrorAnalysis = analyzeMap2Errors(
    baselineFailures,
    metricCategoryFromCanonical,
  );

  const artifact = {
    phase: "3B.2+3B.3",
    engagementId: ENGAGEMENT_ID,
    finishedAt: new Date().toISOString(),
    splitMethod: "80/20 stratified within each metric category (sorted GL code, last 20% = test)",
    splitByCategory,
    successTarget: SUCCESS_TARGET,
    evalPolicy: {
      allowExactName: false,
      allowSynonyms: false,
      allowFirmMemory: false,
    },
    baseline: {
      trainSize: train.length,
      testSize: test.length,
      summary: baseline.summary,
      successMet: baseline.summary.accuracy >= SUCCESS_TARGET,
      failures: baselineFailures,
    },
    refined: {
      summary: refined.summary,
      map2Assets: {
        global: Object.keys(refined.dictionary.map2GlobalToCanonical ?? {})
          .length,
        composite: Object.keys(
          refined.dictionary.map2CompositeToCanonical ?? {},
        ).length,
        ambiguous: refined.dictionary.ambiguousMap2Labels?.length ?? 0,
      },
      successMet: refined.summary.accuracy >= SUCCESS_TARGET,
      failures: refined.results.filter((r) => !r.correct),
    },
    map2ErrorAnalysis,
    testAccountCodes: test.map((r) => r.accountCode),
  };

  const outDir = resolve(__dirname, "../../docs/audits/evidence");
  mkdirSync(outDir, { recursive: true });
  const jsonPath = resolve(outDir, "phase-3b2-stratified-holdout.json");
  writeFileSync(jsonPath, JSON.stringify(artifact, null, 2));

  const reportPath = resolve(
    __dirname,
    "../../docs/audits/PHASE_3B2_STRATIFIED_HOLDOUT_REPORT.md",
  );
  writeFileSync(reportPath, buildReport(artifact));

  console.log("\n=== Summary ===");
  console.log(
    `3B.2 baseline: ${fmt(baseline.summary.accuracy)} | target ≥65%: ${artifact.baseline.successMet ? "PASS" : "FAIL"}`,
  );
  console.log(
    `3B.3 refined:  ${fmt(refined.summary.accuracy)} | target ≥65%: ${artifact.refined.successMet ? "PASS" : "FAIL"}`,
  );
  console.log(`artifact: ${jsonPath}`);
  console.log(`report: ${reportPath}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
