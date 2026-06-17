#!/usr/bin/env tsx
/**
 * TB Classification Benchmark — deterministic rules vs local qwen3:8b.
 * No production code changes; uses existing synonym engine + generateClassification path.
 *
 * Usage:
 *   npm run tb:benchmark
 *   npm run tb:benchmark -- --limit 10   (quick sample)
 *   npm run tb:benchmark -- --rules-only (skip Ollama)
 */
import { config } from "dotenv"
import { readFileSync, writeFileSync, mkdirSync } from "fs"
import { resolve } from "path"

config({ path: resolve(__dirname, "../../.env") })

import { CANONICAL_COA_ACCOUNTS } from "../../src/lib/audit/coa/canonical-coa"
import { matchSynonym } from "../../src/lib/tb-intelligence/synonyms"
import { classifyByPrefix } from "../../src/lib/tb-intelligence/coa-loader"
import type { CanonicalCandidate, ClassificationResult } from "../../src/lib/tb-intelligence/types"

type BenchmarkRow = {
  id: string
  accountCode: string
  accountName: string
  expectedCode: string
  category: string
  language: string
  difficulty: "easy" | "hard"
}

type Prediction = {
  canonicalCode: string | null
  confidence: number
  source: string
  latencyMs: number
  evidence?: string
  providerId?: string
  rawPreview?: string
}

type RunResult = {
  row: BenchmarkRow
  deterministic: Prediction
  localAi: Prediction
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

function loadCandidates(): CanonicalCandidate[] {
  return CANONICAL_COA_ACCOUNTS.map((a) => ({
    id: a.id,
    code: a.code,
    name: a.name,
    category: a.category,
    statementType: a.statementType,
  }))
}

function isRouAccumulatedDepreciationName(accountName: string): boolean {
  return /مجمع.*اهلا|accumulated.*dep|acc\.?\s*dep|accum\s*dep|accumulated depreciation/i.test(
    accountName,
  )
}

function resolveByCode(
  candidates: CanonicalCandidate[],
  canonicalCode: string,
  confidence: number,
  source: ClassificationResult["source"],
  evidence?: string,
): ClassificationResult | null {
  const canonical = candidates.find((c) => c.code === canonicalCode)
  if (!canonical) return null
  return {
    canonicalAccountId: canonical.id,
    canonicalCode: canonical.code,
    canonicalName: canonical.name,
    category: canonical.category,
    confidence,
    source,
    evidence,
  }
}

/** Mirrors `classifyByRules` in tb-intelligence/engine.ts (Step 2). */
function classifyDeterministic(
  accountCode: string,
  accountName: string,
  candidates: CanonicalCandidate[],
): ClassificationResult | null {
  const hintTexts = [accountName].filter(Boolean)

  for (const hint of hintTexts) {
    const synonym = matchSynonym(hint, accountCode)
    if (!synonym) continue

    let targetCode = synonym.canonicalCode
    if (targetCode === "CA-1070" && isRouAccumulatedDepreciationName(accountName)) {
      targetCode = "CA-1071"
    }

    const resolved = resolveByCode(
      candidates,
      targetCode,
      0.88,
      "rule",
      `COA synonym match: ${synonym.alias}`,
    )
    if (resolved) return resolved
  }

  const prefixCategory = classifyByPrefix(accountCode)
  if (prefixCategory) {
    const sameCategory = candidates.filter((c) => {
      const coarse = coarseCategory(c.code)
      return coarse === prefixCategory
    })
    if (sameCategory.length === 1) {
      const c = sameCategory[0]!
      return {
        canonicalAccountId: c.id,
        canonicalCode: c.code,
        canonicalName: c.name,
        category: c.category,
        confidence: 0.7,
        source: "rule",
        evidence: `Prefix ${accountCode.substring(0, 2)} → ${prefixCategory}`,
      }
    }
  }

  return null
}

function coarseCategory(code: string): string {
  const row = CANONICAL_COA_ACCOUNTS.find((a) => a.code === code)
  if (!row) return "unknown"
  const cat = row.category.toLowerCase()
  if (cat.includes("asset")) return "asset"
  if (cat.includes("liabilit")) return "liability"
  if (cat.includes("equity")) return "equity"
  if (cat.includes("revenue")) return "revenue"
  if (cat.includes("expense")) return "expense"
  return "unknown"
}

function toPrediction(
  result: ClassificationResult | null,
  latencyMs: number,
  rawPreview?: string,
): Prediction {
  if (!result) {
    return {
      canonicalCode: null,
      confidence: 0,
      source: "none",
      latencyMs,
      rawPreview: rawPreview ?? undefined,
    }
  }
  return {
    canonicalCode: result.canonicalCode,
    confidence: result.confidence,
    source: result.source,
    latencyMs,
    evidence: result.evidence,
    providerId: result.providerId,
    rawPreview: rawPreview ?? undefined,
  }
}

async function classifyLocalAi(
  accountCode: string,
  accountName: string,
  candidates: CanonicalCandidate[],
): Promise<{ result: ClassificationResult | null; rawPreview: string }> {
  if (process.env.AI_MODE === "cloud") {
    return { result: null, rawPreview: "" }
  }

  const {
    buildCandidateAccountLabels,
    buildChartOfAccountsContext,
  } = await import("../../src/lib/tb-intelligence/classification-prompt-context")
  const { parseClassificationModelOutput } = await import(
    "../../src/lib/tb-intelligence/classification-response-parser"
  )
  const { generateClassification } = await import("../../src/lib/ai/generate")

  const candidateAccounts = buildCandidateAccountLabels(candidates)
  const response = await generateClassification({
    organizationId: "benchmark-org",
    engagementId: "benchmark-eng",
    accountCode,
    accountName,
    accountBalance: 0,
    preferProvider: "local",
    candidateAccounts,
    chartOfAccountsContext: buildChartOfAccountsContext(candidates),
  })

  const rawPreview = (response.output ?? "").slice(0, 300)
  const parsed = parseClassificationModelOutput(response.output ?? "")
  if (!parsed) return { result: null, rawPreview }

  const resolved = resolveByCode(
    candidates,
    parsed.accountCode,
    Math.max(0.6, parsed.confidence ?? response.confidence),
    "local",
    parsed.reasoning || "Local Ollama classification",
  )
  if (resolved) resolved.providerId = response.providerId
  return { result: resolved, rawPreview }
}

function misclassificationType(
  expected: string,
  predicted: string | null,
): string {
  if (!predicted) return "no_prediction"
  if (predicted === expected) return "exact_match"
  if (coarseCategory(predicted) === coarseCategory(expected)) {
    return "wrong_code_same_section"
  }
  return "wrong_section"
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, idx)]!
}

async function main() {
  const { limit, rulesOnly } = parseArgs()
  const dataPath = resolve(__dirname, "tb-classification-benchmark-data.json")
  const dataset = JSON.parse(readFileSync(dataPath, "utf8")) as {
    accounts: BenchmarkRow[]
  }

  let accounts = dataset.accounts
  if (limit && limit > 0) accounts = accounts.slice(0, limit)

  const candidates = loadCandidates()
  const results: RunResult[] = []

  console.log(`=== TB Classification Benchmark ===`)
  console.log(`accounts: ${accounts.length} | rules-only: ${rulesOnly}`)
  console.log(
    `env: AI_MODE=${process.env.AI_MODE} AI_LOCAL_MODEL=${process.env.AI_LOCAL_MODEL} FF_AI_REAL_PROVIDERS=${process.env.FF_AI_REAL_PROVIDERS}`,
  )

  for (let i = 0; i < accounts.length; i++) {
    const row = accounts[i]!
    process.stdout.write(`[${i + 1}/${accounts.length}] ${row.id} ${row.accountName.slice(0, 40)}... `)

    const detStart = Date.now()
    const det = classifyDeterministic(row.accountCode, row.accountName, candidates)
    const detPred = toPrediction(det, Date.now() - detStart)

    let aiPred: Prediction = {
      canonicalCode: null,
      confidence: 0,
      source: "skipped",
      latencyMs: 0,
    }

    if (!rulesOnly) {
      const aiStart = Date.now()
      try {
        const { result, rawPreview } = await classifyLocalAi(
          row.accountCode,
          row.accountName,
          candidates,
        )
        aiPred = toPrediction(result, Date.now() - aiStart, rawPreview)
      } catch (err) {
        const aiStartCatch = Date.now()
        aiPred = {
          canonicalCode: null,
          confidence: 0,
          source: "error",
          latencyMs: aiStartCatch - aiStart,
          rawPreview: err instanceof Error ? err.message.slice(0, 120) : "error",
        }
      }
    }

    const detOk = detPred.canonicalCode === row.expectedCode ? "D✓" : "D✗"
    const aiOk =
      rulesOnly ? "-" : aiPred.canonicalCode === row.expectedCode ? "A✓" : "A✗"
    console.log(`${detOk} ${aiOk} (${detPred.latencyMs}ms / ${aiPred.latencyMs}ms)`)

    results.push({ row, deterministic: detPred, localAi: aiPred })
  }

  function summarize(method: "deterministic" | "localAi") {
    const preds = results.map((r) => r[method])
    const exact = results.filter(
      (r) => r[method].canonicalCode === r.row.expectedCode,
    ).length
    const categoryMatch = results.filter((r) => {
      const p = r[method].canonicalCode
      if (!p) return false
      return coarseCategory(p) === coarseCategory(r.row.expectedCode)
    }).length
    const noPred = preds.filter((p) => !p.canonicalCode).length
    const latencies = preds.map((p) => p.latencyMs)
    const confidences = preds.filter((p) => p.canonicalCode).map((p) => p.confidence)

    const misclass: Record<string, number> = {}
    for (const r of results) {
      const t = misclassificationType(
        r.row.expectedCode,
        r[method].canonicalCode,
      )
      misclass[t] = (misclass[t] ?? 0) + 1
    }

    const byDifficulty = {
      easy: { total: 0, exact: 0 },
      hard: { total: 0, exact: 0 },
    }
    for (const r of results) {
      const d = r.row.difficulty
      byDifficulty[d].total++
      if (r[method].canonicalCode === r.row.expectedCode) byDifficulty[d].exact++
    }

    const byCategory: Record<string, { total: number; exact: number }> = {}
    for (const r of results) {
      const c = r.row.category
      byCategory[c] ??= { total: 0, exact: 0 }
      byCategory[c].total++
      if (r[method].canonicalCode === r.row.expectedCode) byCategory[c].exact++
    }

    return {
      method,
      total: results.length,
      exactMatch: exact,
      exactAccuracy: exact / results.length,
      categoryAccuracy: categoryMatch / results.length,
      noPrediction: noPred,
      avgConfidence:
        confidences.length > 0
          ? confidences.reduce((a, b) => a + b, 0) / confidences.length
          : 0,
      latencyMs: {
        avg: latencies.reduce((a, b) => a + b, 0) / latencies.length,
        p50: percentile(latencies, 50),
        p95: percentile(latencies, 95),
        max: Math.max(...latencies),
      },
      misclassification: misclass,
      byDifficulty,
      byCategory,
    }
  }

  const detSummary = summarize("deterministic")
  const aiSummary = rulesOnly ? null : summarize("localAi")

  const hardOnly = results.filter((r) => r.row.difficulty === "hard")
  const incremental = aiSummary
    ? {
        hardAccounts: hardOnly.length,
        deterministicExactOnHard: hardOnly.filter(
          (r) => r.deterministic.canonicalCode === r.row.expectedCode,
        ).length,
        localAiExactOnHard: hardOnly.filter(
          (r) => r.localAi.canonicalCode === r.row.expectedCode,
        ).length,
        rulesMissLocalHit: hardOnly.filter(
          (r) =>
            r.deterministic.canonicalCode !== r.row.expectedCode &&
            r.localAi.canonicalCode === r.row.expectedCode,
        ).length,
      }
    : null

  const artifact = {
    finishedAt: new Date().toISOString(),
    accountCount: results.length,
    rulesOnly,
    env: {
      AI_MODE: process.env.AI_MODE,
      AI_LOCAL_MODEL: process.env.AI_LOCAL_MODEL,
      FF_AI_REAL_PROVIDERS: process.env.FF_AI_REAL_PROVIDERS,
    },
    deterministic: detSummary,
    localAi: aiSummary,
    incremental,
    results,
  }

  const outDir = resolve(__dirname, "../../docs/audits/evidence")
  mkdirSync(outDir, { recursive: true })
  const outPath = resolve(outDir, "tb-classification-benchmark.json")
  writeFileSync(outPath, JSON.stringify(artifact, null, 2))

  console.log("\n=== Summary ===")
  console.log(
    `Deterministic: ${(detSummary.exactAccuracy * 100).toFixed(1)}% exact (${detSummary.exactMatch}/${detSummary.total}) | avg ${detSummary.latencyMs.avg.toFixed(1)}ms`,
  )
  if (aiSummary) {
    console.log(
      `Local AI:      ${(aiSummary.exactAccuracy * 100).toFixed(1)}% exact (${aiSummary.exactMatch}/${aiSummary.total}) | avg ${aiSummary.latencyMs.avg.toFixed(0)}ms p95 ${aiSummary.latencyMs.p95}ms`,
    )
    if (incremental) {
      console.log(
        `Hard subset:   rules ${incremental.deterministicExactOnHard}/${incremental.hardAccounts} → AI ${incremental.localAiExactOnHard}/${incremental.hardAccounts} (+${incremental.rulesMissLocalHit} incremental hits)`,
      )
    }
  }
  console.log(`artifact: ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
