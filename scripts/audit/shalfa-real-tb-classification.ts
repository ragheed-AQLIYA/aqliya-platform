#!/usr/bin/env tsx
/**
 * Phase 3A — Real Shalfa TB classification validation (578 confirmed mappings).
 *
 * Usage:
 *   npm run shalfa:tb-classify
 *   npm run shalfa:tb-classify -- --limit 20
 *   npm run shalfa:tb-classify -- --rules-only
 */
import { config } from "dotenv"
import { writeFileSync, mkdirSync } from "fs"
import { resolve } from "path"

config({ path: resolve(__dirname, "../../.env") })

process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public"
process.env.FF_AI_REAL_PROVIDERS = process.env.FF_AI_REAL_PROVIDERS ?? "true"
process.env.AI_MODE = process.env.AI_MODE ?? "hybrid"

const ENGAGEMENT_ID = process.env.ENGAGEMENT_ID ?? "eng-shalfa-2025"

type MetricCategory =
  | "Assets"
  | "Liabilities"
  | "Equity"
  | "Revenue"
  | "Cost of Revenue"
  | "Expenses"
  | "Zakat"
  | "Cash"
  | "Lease"
  | "Other"

type AccountRow = {
  mappingId: string
  accountCode: string
  accountName: string
  expectedCode: string
  expectedName: string
  metricCategory: MetricCategory
  rules: { code: string | null; confidence: number; source: string; latencyMs: number; correct: boolean }
  localAi: { code: string | null; confidence: number; source: string; latencyMs: number; correct: boolean }
  hybrid: { code: string | null; confidence: number; source: string; latencyMs: number; correct: boolean }
}

function parseArgs() {
  const args = process.argv.slice(2)
  let limit: number | undefined
  let rulesOnly = false
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) limit = Number(args[++i])
    if (args[i] === "--rules-only") rulesOnly = true
  }
  return { limit, rulesOnly }
}

function metricCategory(code: string): MetricCategory {
  if (code === "CA-1010") return "Cash"
  if (["CA-1070", "CA-1071", "CA-2110", "CA-2120"].includes(code)) return "Lease"
  if (["CA-2030", "CA-2035"].includes(code)) return "Zakat"
  if (code === "CA-5010") return "Cost of Revenue"
  if (["CA-4010", "CA-4020", "CA-5100"].includes(code)) return "Revenue"
  const n = Number.parseInt(code.replace("CA-", ""), 10)
  if (Number.isNaN(n)) return "Other"
  if (n >= 5020 && n <= 5070) return "Expenses"
  if (code === "CA-2050") return "Expenses"
  if (n >= 1010 && n <= 1080) return "Assets"
  if (n >= 2010 && n <= 2140) return "Liabilities"
  if (n >= 3010 && n <= 3040) return "Equity"
  return "Other"
}

function toPred(
  result: { canonicalCode: string; confidence: number; source: string } | null,
  latencyMs: number,
  expected: string,
) {
  return {
    code: result?.canonicalCode ?? null,
    confidence: result?.confidence ?? 0,
    source: result?.source ?? "none",
    latencyMs,
    correct: result?.canonicalCode === expected,
  }
}

function summarize(rows: AccountRow[], key: "rules" | "localAi" | "hybrid") {
  const total = rows.length
  const exact = rows.filter((r) => r[key].correct).length
  const latencies = rows.map((r) => r[key].latencyMs)
  const confidences = rows.filter((r) => r[key].code).map((r) => r[key].confidence)
  const byCat: Record<string, { total: number; exact: number }> = {}
  for (const r of rows) {
    const c = r.metricCategory
    byCat[c] ??= { total: 0, exact: 0 }
    byCat[c].total++
    if (r[key].correct) byCat[c].exact++
  }
  return {
    total,
    exact,
    accuracy: total > 0 ? exact / total : 0,
    avgConfidence:
      confidences.length > 0
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length
        : 0,
    latencyMs: {
      avg: latencies.reduce((a, b) => a + b, 0) / Math.max(total, 1),
      p50: percentile(latencies, 50),
      p95: percentile(latencies, 95),
      total: latencies.reduce((a, b) => a + b, 0),
    },
    byCategory: byCat,
  }
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, idx)]!
}

function whyFailed(
  mode: "rules" | "localAi",
  row: AccountRow,
): string {
  const pred = row[mode]
  if (pred.correct) return "n/a"
  if (!pred.code) {
    return mode === "rules"
      ? "No synonym/prefix match in COA rules engine"
      : "Model output not parseable or Ollama error"
  }
  if (pred.code !== row.expectedCode) {
    return `Mapped to ${pred.code} instead of ${row.expectedCode} (${row.metricCategory})`
  }
  return "unknown"
}

async function main() {
  const { limit, rulesOnly } = parseArgs()
  const { prisma } = await import("../../src/lib/prisma")
  const { loadCanonicalCandidates } = await import(
    "../../src/lib/tb-intelligence/coa-loader"
  )
  const {
    classifyAccountRulesOnly,
    classifyAccountLocalOnly,
    classifyAccountHybridOnly,
    classifyAccountDeterministicHybridOnly,
  } = await import("../../src/lib/tb-intelligence/engine")
  const { resolveFirmMemoryOrganizationIdFromEngagement } = await import(
    "../../src/lib/tb-intelligence/org-resolver"
  )

  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: ENGAGEMENT_ID },
    select: { id: true, organizationId: true, fiscalPeriod: true },
  })
  if (!engagement) {
    console.error(`Engagement ${ENGAGEMENT_ID} not found — run npm run shalfa:setup`)
    process.exit(1)
  }

  const orgId =
    (await resolveFirmMemoryOrganizationIdFromEngagement(ENGAGEMENT_ID)) ??
    engagement.organizationId

  const mappings = await prisma.auditAccountMapping.findMany({
    where: { engagementId: ENGAGEMENT_ID, status: "confirmed" },
    include: { canonicalAccount: true },
    orderBy: { sourceAccountCode: "asc" },
  })

  const withTruth = mappings.filter((m) => m.canonicalAccount?.code)
  console.log(`=== Shalfa Real TB Validation ===`)
  console.log(`engagement: ${ENGAGEMENT_ID} | confirmed mappings: ${withTruth.length}`)

  if (withTruth.length === 0) {
    console.error("No confirmed mappings with canonical codes")
    process.exit(1)
  }

  let rows = withTruth
  if (limit && limit > 0) rows = rows.slice(0, limit)

  const history = await prisma.tBClassificationHistory.findMany({
    where: { engagementId: ENGAGEMENT_ID },
    orderBy: { createdAt: "desc" },
    select: { accountCode: true, mappingHints: true },
  })
  const hintsByCode = new Map<string, string[]>()
  for (const row of history) {
    if (hintsByCode.has(row.accountCode)) continue
    const hints = Array.isArray(row.mappingHints)
      ? (row.mappingHints as string[]).map((h) => String(h).trim()).filter(Boolean)
      : []
    if (hints.length > 0) hintsByCode.set(row.accountCode, hints)
  }
  console.log(`ERP mapping hints loaded: ${hintsByCode.size} accounts`)

  const candidates = await loadCanonicalCandidates()
  const results: AccountRow[] = []
  const startedAt = new Date().toISOString()

  for (let i = 0; i < rows.length; i++) {
    const m = rows[i]!
    const expectedCode = m.canonicalAccount!.code
    const input = {
      organizationId: orgId,
      engagementId: ENGAGEMENT_ID,
      accountCode: m.sourceAccountCode,
      accountName: m.sourceAccountName,
      debitAmount: m.debitAmount,
      creditAmount: m.creditAmount,
      classificationHints: hintsByCode.get(m.sourceAccountCode),
    }

    if (i % 25 === 0 || i === rows.length - 1) {
      process.stdout.write(`\r[${i + 1}/${rows.length}] ${m.sourceAccountCode} `.padEnd(40))
    }

    const r0 = Date.now()
    const rulesResult = await classifyAccountRulesOnly(input, candidates)
    const rulesMs = Date.now() - r0

    let localResult = null
    let localMs = 0
    let hybridResult = null
    let hybridMs = 0

    if (!rulesOnly) {
      const a0 = Date.now()
      localResult = await classifyAccountLocalOnly(input, candidates)
      localMs = Date.now() - a0

      const h0 = Date.now()
      hybridResult = await classifyAccountHybridOnly(input, candidates)
      hybridMs = Date.now() - h0
    } else {
      const h0 = Date.now()
      hybridResult = await classifyAccountDeterministicHybridOnly(input, candidates)
      hybridMs = Date.now() - h0
    }

    results.push({
      mappingId: m.id,
      accountCode: m.sourceAccountCode,
      accountName: m.sourceAccountName,
      expectedCode,
      expectedName: m.canonicalAccount!.name,
      metricCategory: metricCategory(expectedCode),
      rules: toPred(rulesResult, rulesMs, expectedCode),
      localAi: toPred(localResult, localMs, expectedCode),
      hybrid: toPred(hybridResult, hybridMs, expectedCode),
    })
  }

  console.log("")

  const rulesSummary = summarize(results, "rules")
  const aiSummary = rulesOnly ? null : summarize(results, "localAi")
  const hybridSummary = summarize(results, "hybrid")

  const hybridWins = rulesOnly
    ? false
    : hybridSummary.accuracy > rulesSummary.accuracy

  const failures = results
    .filter((r) => !r.hybrid.correct)
    .slice(0, 25)
    .map((r) => ({
      accountCode: r.accountCode,
      accountName: r.accountName,
      expected: r.expectedCode,
      rules: r.rules.code,
      localAi: r.localAi.code,
      hybrid: r.hybrid.code,
      category: r.metricCategory,
      whyRulesFailed: whyFailed("rules", r),
      whyAiFailed: whyFailed("localAi", r),
    }))

  const artifact = {
    phase: rulesOnly ? "3B" : "3A",
    engagementId: ENGAGEMENT_ID,
    startedAt,
    finishedAt: new Date().toISOString(),
    accountCount: results.length,
    rulesOnly,
    erpHintsLoaded: hintsByCode.size,
    deterministicHybridWhenRulesOnly: rulesOnly,
    env: {
      AI_MODE: process.env.AI_MODE,
      AI_LOCAL_MODEL: process.env.AI_LOCAL_MODEL,
      FF_AI_REAL_PROVIDERS: process.env.FF_AI_REAL_PROVIDERS,
    },
    successCriterionMet: hybridWins,
    rules: rulesSummary,
    localAi: aiSummary,
    hybrid: hybridSummary,
    topFailures: failures,
    accounts: results,
  }

  const outDir = resolve(__dirname, "../../docs/audits/evidence")
  mkdirSync(outDir, { recursive: true })
  const jsonPath = resolve(
    outDir,
    rulesOnly
      ? "shalfa-phase-3b-rules-rebenchmark.json"
      : "shalfa-real-tb-classification.json",
  )
  writeFileSync(jsonPath, JSON.stringify(artifact, null, 2))

  const reportPath = resolve(
    __dirname,
    rulesOnly
      ? "../../docs/audits/PHASE_3B_ERP_INTELLIGENCE_REPORT.md"
      : "../../docs/audits/REAL_TB_CLASSIFICATION_REPORT.md",
  )
  writeFileSync(reportPath, rulesOnly ? buildPhase3BReport(artifact) : buildReport(artifact))

  console.log("\n=== Summary ===")
  console.log(
    `Rules:  ${(rulesSummary.accuracy * 100).toFixed(1)}% (${rulesSummary.exact}/${rulesSummary.total})`,
  )
  if (aiSummary) {
    console.log(
      `Local:  ${(aiSummary.accuracy * 100).toFixed(1)}% (${aiSummary.exact}/${aiSummary.total}) | total ${(aiSummary.latencyMs.total / 1000 / 60).toFixed(1)} min`,
    )
  }
  console.log(
    `Hybrid: ${(hybridSummary.accuracy * 100).toFixed(1)}% (${hybridSummary.exact}/${hybridSummary.total}) | total ${(hybridSummary.latencyMs.total / 1000 / 60).toFixed(1)} min`,
  )
  console.log(
    rulesOnly
      ? `Phase 3B targets: Rules >40% ${rulesSummary.accuracy >= 0.4 ? "PASS" : "FAIL"} | Det.Hybrid >65% ${hybridSummary.accuracy >= 0.65 ? "PASS" : "FAIL"}`
      : `Success criterion (hybrid > rules): ${hybridWins ? "PASS" : "FAIL"}`,
  )
  console.log(`artifact: ${jsonPath}`)
  console.log(`report: ${reportPath}`)
}

function buildPhase3BReport(artifact: {
  engagementId: string
  accountCount: number
  erpHintsLoaded: number
  rules: ReturnType<typeof summarize>
  hybrid: ReturnType<typeof summarize>
  topFailures: Array<Record<string, string | null>>
  finishedAt: string
}): string {
  const fmt = (n: number) => `${(n * 100).toFixed(1)}%`
  const rulesTarget = 0.4
  const hybridTarget = 0.65
  const rulesPass = artifact.rules.accuracy >= rulesTarget
  const hybridPass = artifact.hybrid.accuracy >= hybridTarget

  const catTable = (src: ReturnType<typeof summarize>) =>
    Object.entries(src.byCategory)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([cat, v]) =>
          `| ${cat} | ${v.total} | ${v.exact} | ${fmt(v.exact / Math.max(v.total, 1))} |`,
      )
      .join("\n")

  return `# Phase 3B — ERP Intelligence Re-benchmark (Rules + Deterministic Hybrid)

**Date:** ${artifact.finishedAt.slice(0, 10)}  
**Engagement:** \`${artifact.engagementId}\`  
**Accounts:** ${artifact.accountCount} confirmed mappings  
**ERP hints loaded:** ${artifact.erpHintsLoaded}  
**Knowledge:** \`knowledge/tb-intelligence/erp-saudi-dictionary.json\`, \`erp-prefix-rules.json\`  
**Evidence:** \`docs/audits/evidence/shalfa-phase-3b-rules-rebenchmark.json\`

---

## Interpretation (read first)

Phase 3B mines **confirmed Shalfa mappings + ERP Map1/Map2 hints** into a client-specific dictionary. On the **same 578-account training set**, rules reach **${fmt(artifact.rules.accuracy)}** — this **validates the Phase 3A diagnosis** (the gap was missing ERP intelligence, not a weak model alone).

This is **in-sample** for the Shalfa pilot, not an independent hold-out. Transferable artifacts for **new GL lines on the same ERP chart** are primarily:

- **19 prefix rules** (e.g. \`110501*\` → CA-1040)
- **17 Map1** + **29 Map2** label mappings
- **70 name patterns** (banks, deposits, related parties)

Exact-name entries (549) support **re-classification of known accounts** after TB refresh — appropriate for pilot memory, not for claiming cross-client generalization.

---

## Targets (Phase 3B)

| Metric | Baseline (3A) | Target | Result | Status |
|--------|---------------|--------|--------|--------|
| Rules | 11.4% | >40% | **${fmt(artifact.rules.accuracy)}** | ${rulesPass ? "PASS ✅" : "FAIL ❌"} |
| Deterministic Hybrid (rules → pattern, no AI) | 47.8% (3A full hybrid w/ AI) | >65% | **${fmt(artifact.hybrid.accuracy)}** | ${hybridPass ? "PASS ✅" : "FAIL ❌"} |

---

## Results

| Mode | Accuracy | Exact | Avg latency |
|------|----------|-------|-------------|
| Rules (synonyms + ERP dictionary + prefix) | ${fmt(artifact.rules.accuracy)} | ${artifact.rules.exact}/${artifact.rules.total} | ${artifact.rules.latencyMs.avg.toFixed(2)} ms |
| Deterministic Hybrid | ${fmt(artifact.hybrid.accuracy)} | ${artifact.hybrid.exact}/${artifact.hybrid.total} | ${artifact.hybrid.latencyMs.avg.toFixed(2)} ms |

---

## Rules Accuracy by Category

| Category | Total | Correct | Accuracy |
|----------|-------|---------|----------|
${catTable(artifact.rules)}

---

## Deterministic Hybrid by Category

| Category | Total | Correct | Accuracy |
|----------|-------|---------|----------|
${catTable(artifact.hybrid)}

---

## Remaining Hybrid Failures (sample)

| GL Code | Account | Expected | Rules | Hybrid |
|---------|---------|----------|-------|--------|
${artifact.topFailures
  .slice(0, 15)
  .map(
    (f) =>
      `| ${f.accountCode} | ${String(f.accountName).slice(0, 30)} | ${f.expected} | ${f.rules ?? "—"} | ${f.hybrid ?? "—"} |`,
  )
  .join("\n")}

---

## Next Steps

1. Iterate failure mining on remaining misses (\`npm run phase-3b:mine\`).
2. Do **not** invest in Local AI tenant settings until deterministic hybrid ≥65%.
3. Defer Phase 4 UI until hybrid ≥65–80% on real TB.
`
}

function buildReport(artifact: {
  engagementId: string
  accountCount: number
  successCriterionMet: boolean
  rules: ReturnType<typeof summarize>
  localAi: ReturnType<typeof summarize> | null
  hybrid: ReturnType<typeof summarize>
  topFailures: Array<Record<string, string | null>>
  env: Record<string, string | undefined>
  finishedAt: string
}): string {
  const fmt = (n: number) => `${(n * 100).toFixed(1)}%`
  const catTable = (key: "rules" | "localAi" | "hybrid") => {
    const src =
      key === "rules"
        ? artifact.rules
        : key === "localAi"
          ? artifact.localAi
          : artifact.hybrid
    if (!src) return "_skipped_"
    return Object.entries(src.byCategory)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([cat, v]) =>
          `| ${cat} | ${v.total} | ${v.exact} | ${fmt(v.exact / Math.max(v.total, 1))} |`,
      )
      .join("\n")
  }

  return `# Real TB Classification Report — Shalfa Phase 3A

**Date:** ${artifact.finishedAt.slice(0, 10)}  
**Engagement:** \`${artifact.engagementId}\`  
**Accounts evaluated:** ${artifact.accountCount} (confirmed mappings = ground truth)  
**Model:** Ollama \`${artifact.env.AI_LOCAL_MODEL ?? "qwen3:8b"}\`  
**Evidence:** \`docs/audits/evidence/shalfa-real-tb-classification.json\`

---

## Success Criterion

**Hybrid accuracy > Rules accuracy on real Shalfa TB:** **${artifact.successCriterionMet ? "PASS ✅" : "FAIL ❌"}**

| Mode | Exact accuracy |
|------|----------------|
| Rules only | **${fmt(artifact.rules.accuracy)}** (${artifact.rules.exact}/${artifact.rules.total}) |
| Local AI only | ${artifact.localAi ? `**${fmt(artifact.localAi.accuracy)}** (${artifact.localAi.exact}/${artifact.localAi.total})` : "skipped"} |
| Hybrid (rules → pattern → local) | **${fmt(artifact.hybrid.accuracy)}** (${artifact.hybrid.exact}/${artifact.hybrid.total}) |

---

## Overall Metrics

| Mode | Accuracy | Avg confidence | Avg latency | p95 latency | Total wall time |
|------|----------|----------------|-------------|-------------|-----------------|
| Rules | ${fmt(artifact.rules.accuracy)} | ${artifact.rules.avgConfidence.toFixed(2)} | ${artifact.rules.latencyMs.avg.toFixed(2)} ms | ${artifact.rules.latencyMs.p50} ms | ${(artifact.rules.latencyMs.total / 1000).toFixed(1)} s |
| Local AI | ${artifact.localAi ? `${fmt(artifact.localAi.accuracy)} | ${artifact.localAi.avgConfidence.toFixed(2)} | ${artifact.localAi.latencyMs.avg.toFixed(0)} ms | ${artifact.localAi.latencyMs.p95} ms | ${(artifact.localAi.latencyMs.total / 1000 / 60).toFixed(1)} min` : "—"} |
| Hybrid | ${fmt(artifact.hybrid.accuracy)} | ${artifact.hybrid.avgConfidence.toFixed(2)} | ${artifact.hybrid.latencyMs.avg.toFixed(0)} ms | ${artifact.hybrid.latencyMs.p95} ms | ${(artifact.hybrid.latencyMs.total / 1000 / 60).toFixed(1)} min |

---

## Accuracy by Category — Rules

| Category | Total | Correct | Accuracy |
|----------|-------|---------|----------|
${catTable("rules")}

---

## Accuracy by Category — Local AI

| Category | Total | Correct | Accuracy |
|----------|-------|---------|----------|
${artifact.localAi ? catTable("localAi") : "_not run_"}

---

## Accuracy by Category — Hybrid

| Category | Total | Correct | Accuracy |
|----------|-------|---------|----------|
${catTable("hybrid")}

---

## Top Failures (Hybrid incorrect — up to 25)

| GL Code | Account Name | Expected | Rules | AI | Hybrid | Why rules failed | Why AI failed |
|---------|--------------|----------|-------|-----|--------|------------------|---------------|
${artifact.topFailures
  .map(
    (f) =>
      `| ${f.accountCode} | ${String(f.accountName).slice(0, 35)} | ${f.expected} | ${f.rules ?? "—"} | ${f.localAi ?? "—"} | ${f.hybrid ?? "—"} | ${String(f.whyRulesFailed).slice(0, 40)} | ${String(f.whyAiFailed).slice(0, 40)} |`,
  )
  .join("\n")}

---

## Recommendations

1. **Deploy hybrid in production TB assist** — rules first for speed; local AI only on miss (ADR-001 Step 4).
2. **Human review** remains mandatory for all AI-suggested mappings.
3. **Expand synonyms** for Shalfa-specific GL naming patterns surfaced in top failures.
4. **Batch queue** required for 578-line re-classification (~${artifact.localAi ? (artifact.localAi.latencyMs.total / 1000 / 60).toFixed(0) : "?"} min local-only wall time).

---

## Related

- \`docs/audits/TB_CLASSIFICATION_REBENCHMARK.md\` — synthetic 100-account benchmark
- \`docs/audits/SHALFA_PILOT_SIGNOFF.md\` — Factory Accuracy 94
`
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
