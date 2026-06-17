#!/usr/bin/env tsx
/**
 * Phase 3B.1 — Hold-out validation for ERP Intelligence (no exact-name memory).
 *
 * Split: 450 train / 128 hold-out (sorted by GL code, deterministic).
 * Train: prefix + Map1 + Map2 + name patterns only (no exact names exported).
 * Eval:  hold-out with allowExactName=false — ERP intelligence layers only.
 *
 * Usage:
 *   npm run phase-3b1:holdout
 */
import { config } from "dotenv";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });

process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";

const ENGAGEMENT_ID = process.env.ENGAGEMENT_ID ?? "eng-shalfa-2025";
const TRAIN_SIZE = 450;
const HOLDOUT_SIZE = 128;
const SUCCESS_TARGET = 0.7;

type HoldoutRow = {
  accountCode: string;
  accountName: string;
  expectedCode: string;
  hints: string[];
  metricCategory: string;
  predicted: string | null;
  layer: string | null;
  correct: boolean;
};

function pickHints(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((h) => String(h).trim()).filter(Boolean);
}

function summarize(rows: HoldoutRow[]) {
  const total = rows.length;
  const exact = rows.filter((r) => r.correct).length;
  const byCat: Record<string, { total: number; exact: number }> = {};
  const byLayer: Record<string, number> = {};
  const layerCorrect: Record<string, number> = {};
  for (const r of rows) {
    byCat[r.metricCategory] ??= { total: 0, exact: 0 };
    byCat[r.metricCategory].total++;
    if (r.correct) byCat[r.metricCategory].exact++;
    if (r.layer) {
      byLayer[r.layer] = (byLayer[r.layer] ?? 0) + 1;
      if (r.correct) layerCorrect[r.layer] = (layerCorrect[r.layer] ?? 0) + 1;
    }
  }
  const layerPrecision: Record<string, { hits: number; correct: number; precision: number }> =
    {};
  for (const [layer, hits] of Object.entries(byLayer)) {
    const correct = layerCorrect[layer] ?? 0;
    layerPrecision[layer] = {
      hits,
      correct,
      precision: hits > 0 ? correct / hits : 0,
    };
  }
  return {
    total,
    exact,
    accuracy: total > 0 ? exact / total : 0,
    byCategory: byCat,
    byLayer,
    layerPrecision,
  };
}

function buildReport(artifact: {
  engagementId: string;
  trainSize: number;
  holdoutSize: number;
  splitMethod: string;
  minedFromTrain: {
    prefixRules: number;
    map1Entries: number;
    map2Entries: number;
    namePatterns: number;
    exactNamesExcluded: boolean;
  };
  holdout: ReturnType<typeof summarize> & { byCategory: Record<string, { total: number; exact: number }> };
  holdoutSize: number;
  holdoutPrefixSample: string;
  successTarget: number;
  successMet: boolean;
  failures: HoldoutRow[];
  finishedAt: string;
}): string {
  const fmt = (n: number) => `${(n * 100).toFixed(1)}%`;
  const catRows = Object.entries(artifact.holdout.byCategory)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([cat, v]) =>
        `| ${cat} | ${v.total} | ${v.exact} | ${fmt(v.exact / Math.max(v.total, 1))} |`,
    )
    .join("\n");

  const layerRows = Object.entries(artifact.holdout.layerPrecision ?? {})
    .sort((a, b) => b[1].hits - a[1].hits)
    .map(
      ([layer, v]) =>
        `| ${layer} | ${v.hits} | ${v.correct} | ${fmt(v.precision)} |`,
    )
    .join("\n");

  const statusLine = artifact.successMet
    ? "PASS ✅ — ERP Intelligence generalizes; proceed to Phase 3C"
    : artifact.holdout.accuracy >= 0.4
      ? "PARTIAL ⚠️ — real ERP signal (~46%), but below 70% moat threshold; exact-name memory still required for production refresh"
      : "FAIL ❌ — exact-name memory was the primary driver of in-sample 100%";

  return `# Phase 3B.1 — Hold-Out Validation (ERP Intelligence Generalization)

**Date:** ${artifact.finishedAt.slice(0, 10)}  
**Engagement:** \`${artifact.engagementId}\`  
**Split:** ${artifact.trainSize} train / ${artifact.holdoutSize} hold-out  
**Method:** ${artifact.splitMethod}  
**Exact-name memory:** **disabled** on hold-out  
**Evidence:** \`docs/audits/evidence/phase-3b1-holdout-validation.json\`

---

## Question

Does **ERP Intelligence** (prefix + Map1 + Map2 + name patterns) generalize without **549 exact-name Firm Memory entries**?

---

## Success Criterion

| Metric | Target | Result | Status |
|--------|--------|--------|--------|
| Hold-out accuracy (no exact name) | ≥70% | **${fmt(artifact.holdout.accuracy)}** (${artifact.holdout.exact}/${artifact.holdout.total}) | ${statusLine} |

**Split note:** Hold-out accounts start at \`${artifact.holdoutPrefixSample}\` (sorted GL codes). This slice is **${Math.round((artifact.holdout.byCategory.Revenue?.total ?? 0) / artifact.holdoutSize * 100)}% Revenue** lines — Map2 granularity is the main failure mode here.

Interpretation bands:

- **65–80%** → ERP intelligence generalizes (proceed to Phase 3C Firm Learning Engine)
- **20–30%** → exact-name memory was the primary driver of in-sample 100%

---

## Train Set Artifacts (450 accounts, no exact names)

| Artifact | Count |
|----------|------:|
| Prefix rules (≥95% support) | ${artifact.minedFromTrain.prefixRules} |
| Map1 → canonical | ${artifact.minedFromTrain.map1Entries} |
| Map2 → canonical | ${artifact.minedFromTrain.map2Entries} |
| Name patterns | ${artifact.minedFromTrain.namePatterns} |
| Exact names mined | ${artifact.minedFromTrain.exactNamesExcluded ? "0 (excluded)" : "included"} |

---

## Hold-Out Accuracy by Category

| Category | Total | Correct | Accuracy |
|----------|-------|---------|----------|
${catRows}

---

## Match Layer Precision (hold-out)

| Layer | Hits | Correct | Precision |
|-------|-----:|--------:|----------:|
${layerRows || "| — | 0 | 0 | — |"}

---

## Sample Hold-Out Failures (up to 20)

| GL Code | Account | Expected | Predicted | Layer |
|---------|---------|----------|-----------|-------|
${artifact.failures
  .slice(0, 20)
  .map(
    (f) =>
      `| ${f.accountCode} | ${f.accountName.slice(0, 28)} | ${f.expectedCode} | ${f.predicted ?? "—"} | ${f.layer ?? "none"} |`,
  )
  .join("\n")}

---

## Decision

${artifact.successMet
  ? "**Proceed to Phase 3C** — Firm Learning Engine: Human Confirm → Audit Trail → Firm Memory → reusable across engagements."
  : "**Do not proceed to Phase 3C yet** — strengthen prefix/Map1/Map2 mining or accept Firm Memory as primary path for known ERP charts."}

**Still deferred:** Fine-tuning, RAG, embeddings, Knowledge Graph, larger models.

---

## Related

- \`docs/audits/PHASE_3B_ERP_INTELLIGENCE_REPORT.md\` — in-sample 100% (with exact names)
- \`knowledge/tb-intelligence/\` — full Shalfa dictionary (production)
`;
}

async function main() {
  const { prisma } = await import("../../src/lib/prisma");
  const { loadCanonicalCandidates } = await import(
    "../../src/lib/tb-intelligence/coa-loader"
  );
  const { mineErpIntelligenceFromRows, metricCategoryFromCanonical } =
    await import("../../src/lib/tb-intelligence/erp-intelligence-mining");
  const { matchErpIntelligenceWithAssets } = await import(
    "../../src/lib/tb-intelligence/erp-intelligence-matcher"
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
    const hints = pickHints(row.mappingHints);
    if (hints.length > 0) hintsByCode.set(row.accountCode, hints);
  }

  const allRows = mappings
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
    })
    .sort((a, b) => a.accountCode.localeCompare(b.accountCode));

  console.log("=== Phase 3B.1 Hold-Out Validation ===");
  console.log(`engagement: ${ENGAGEMENT_ID}`);
  console.log(`total confirmed: ${allRows.length}`);

  if (allRows.length < TRAIN_SIZE + HOLDOUT_SIZE) {
    console.error(
      `Need at least ${TRAIN_SIZE + HOLDOUT_SIZE} mappings; got ${allRows.length}`,
    );
    process.exit(1);
  }

  const trainRows = allRows.slice(0, TRAIN_SIZE);
  const holdoutRows = allRows.slice(TRAIN_SIZE, TRAIN_SIZE + HOLDOUT_SIZE);

  console.log(`train: ${trainRows.length} | hold-out: ${holdoutRows.length}`);

  const mined = mineErpIntelligenceFromRows(
    trainRows.map((r) => ({
      accountCode: r.accountCode,
      accountName: r.accountName,
      canonicalCode: r.canonicalCode,
      map1: r.map1,
      map2: r.map2,
    })),
    `${ENGAGEMENT_ID}-holdout-train`,
    { includeExactNames: false },
  );

  console.log("\n--- Mined from train (no exact names) ---");
  console.log(`  prefix rules: ${mined.prefixRules.length}`);
  console.log(
    `  map1: ${Object.keys(mined.dictionary.map1ToCanonical).length} | map2: ${Object.keys(mined.dictionary.map2ToCanonical).length}`,
  );
  console.log(`  name patterns: ${mined.dictionary.namePatterns.length}`);

  const candidates = await loadCanonicalCandidates();
  const results: HoldoutRow[] = [];

  for (const row of holdoutRows) {
    const outcome = matchErpIntelligenceWithAssets(
      row.accountCode,
      row.accountName,
      row.hints,
      candidates,
      mined.dictionary,
      mined.prefixRules,
      { allowExactName: false },
    );
    const predicted = outcome?.result.canonicalCode ?? null;
    results.push({
      accountCode: row.accountCode,
      accountName: row.accountName,
      expectedCode: row.canonicalCode,
      hints: row.hints,
      metricCategory: metricCategoryFromCanonical(row.canonicalCode),
      predicted,
      layer: outcome?.layer ?? null,
      correct: predicted === row.canonicalCode,
    });
  }

  const holdoutSummary = summarize(results);
  const successMet = holdoutSummary.accuracy >= SUCCESS_TARGET;

  const failures = results.filter((r) => !r.correct);

  const artifact = {
    phase: "3B.1",
    engagementId: ENGAGEMENT_ID,
    finishedAt: new Date().toISOString(),
    splitMethod:
      "Sorted by GL account code ascending; first 450 = train, next 128 = hold-out",
    trainSize: TRAIN_SIZE,
    holdoutSize: HOLDOUT_SIZE,
    evalPolicy: {
      allowExactName: false,
      allowSynonyms: false,
      allowFirmMemory: false,
      layers: ["prefix", "map1", "map2", "name_pattern"],
    },
    minedFromTrain: {
      prefixRules: mined.prefixRules.length,
      map1Entries: Object.keys(mined.dictionary.map1ToCanonical).length,
      map2Entries: Object.keys(mined.dictionary.map2ToCanonical).length,
      namePatterns: mined.dictionary.namePatterns.length,
      exactNamesExcluded: true,
    },
    holdout: holdoutSummary,
    holdoutPrefixSample: holdoutRows[0]?.accountCode ?? "—",
    holdoutSize: HOLDOUT_SIZE,
    successTarget: SUCCESS_TARGET,
    successMet,
    trainAccountCodes: trainRows.map((r) => r.accountCode),
    holdoutAccountCodes: holdoutRows.map((r) => r.accountCode),
    holdoutResults: results,
    failures,
  };

  const outDir = resolve(__dirname, "../../docs/audits/evidence");
  mkdirSync(outDir, { recursive: true });
  const jsonPath = resolve(outDir, "phase-3b1-holdout-validation.json");
  writeFileSync(jsonPath, JSON.stringify(artifact, null, 2));

  const reportPath = resolve(
    __dirname,
    "../../docs/audits/PHASE_3B1_HOLDOUT_REPORT.md",
  );
  writeFileSync(reportPath, buildReport(artifact));

  console.log("\n=== Hold-Out Results (no exact name) ===");
  console.log(
    `Accuracy: ${(holdoutSummary.accuracy * 100).toFixed(1)}% (${holdoutSummary.exact}/${holdoutSummary.total})`,
  );
  console.log(`Target ≥70%: ${successMet ? "PASS" : "FAIL"}`);
  console.log("By layer:", holdoutSummary.byLayer);
  console.log(`artifact: ${jsonPath}`);
  console.log(`report: ${reportPath}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
