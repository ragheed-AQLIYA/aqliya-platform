// ─── AQLIYA Skill Evaluator ───
// Runs skill workflows against evaluation datasets, scores results against
// evaluation criteria, and produces structured evaluation reports.
// ============================================================

import { readFileSync, existsSync, readdirSync } from "fs"
import { join, basename } from "path"
import * as yaml from "js-yaml"

import { loadManifest } from "./runtime"
import { executeSkill } from "./runtime"
import type { SkillManifest, SkillResult } from "./types"

import type {
  EvaluationDataset,
  EvaluationSample,
  EvaluationSampleResult,
  EvaluationResult,
  CriterionConfig,
  CriterionScore,
  EvaluationOptions,
  BatchEvaluationResult,
} from "./evaluator-types"

// ─── Constants ───

const EVAL_ROOT = ".skills/evaluations"

// ─── Dataset Loader ───

/**
 * Load an evaluation dataset for a given skill.
 * Tries exact path first, then replaces colons with hyphens for Windows compat.
 */
function loadDataset(skillId: string, manifest: SkillManifest, datasetPath?: string): EvaluationDataset {
  // If a specific path was provided, use it
  const pathsToTry: string[] = []

  if (datasetPath) {
    pathsToTry.push(datasetPath)
    pathsToTry.push(datasetPath.replace(/:/g, "-"))
  }

  // Otherwise, try the manifest's first dataset
  if (!datasetPath && manifest.evaluation?.datasets && manifest.evaluation.datasets.length > 0) {
    const dsPath = manifest.evaluation.datasets[0].path
    pathsToTry.push(dsPath)
    pathsToTry.push(dsPath.replace(/:/g, "-"))
  }

  // Fallback: construct from skill ID
  if (pathsToTry.length === 0) {
    const safeId = skillId.replace(/:/g, "-")
    const constructed = join(EVAL_ROOT, safeId, "datasets", "v1.yaml")
    pathsToTry.push(constructed)
  }

  // Try each path, resolving relative paths against cwd
  for (const rawPath of pathsToTry) {
    const absolutePath = rawPath.startsWith("/") || /^[A-Za-z]:\\/.test(rawPath)
      ? rawPath
      : join(process.cwd(), rawPath)

    if (existsSync(absolutePath)) {
      const raw = readFileSync(absolutePath, "utf-8")
      return yaml.load(raw) as EvaluationDataset
    }
  }

  // Also try the hyphen variant of the default evaluation folder
  const safeId2 = skillId.replace(/:/g, "-")
  const hyphenDefault = join(process.cwd(), EVAL_ROOT, safeId2, "datasets", "v1.yaml")
  if (existsSync(hyphenDefault)) {
    const raw = readFileSync(hyphenDefault, "utf-8")
    return yaml.load(raw) as EvaluationDataset
  }

  throw new Error(
    `Evaluation dataset not found for skill "${skillId}". Tried:\n  ${pathsToTry.join("\n  ")}`,
  )
}

// ─── Scoring Engine ───

/**
 * Attempt to parse a string value as JSON.
 * AI outputs are always strings — this normalizes JSON-formatted responses to objects.
 */
function maybeParseJson(value: unknown): unknown {
  if (typeof value !== "string") return value
  // Only attempt parse if it looks like JSON
  const trimmed = value.trim()
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return value
    }
  }
  return value
}

/**
 * Score a single sample's actual output against the expected output using the skill's criteria.
 * Each criterion type uses a different scoring strategy:
 *
 * - accuracy:    Structural match between output and expected (field presence, type, approximate value)
 * - completeness: How many expected fields/aspects are present in the output
 * - consistency:  N/A for single-run; defaults to 1.0
 * - speed:       Based on execution time vs threshold
 * - custom:      Uses a metric-specific scorer
 */
function scoreSample(
  actual: unknown,
  expected: unknown,
  criteria: CriterionConfig[],
  durationMs: number,
): Record<string, number> {
  // Auto-parse JSON strings from AI output — AI responses are always strings
  actual = maybeParseJson(actual)
  const scores: Record<string, number> = {}

  for (const criterion of criteria) {
    switch (criterion.type) {
      case "accuracy":
        scores[criterion.name] = scoreAccuracy(actual, expected)
        break
      case "completeness":
        scores[criterion.name] = scoreCompleteness(actual, expected)
        break
      case "consistency":
        // Single-run: no consistency data available; score at 1.0 (neutral)
        scores[criterion.name] = 1.0
        break
      case "speed":
        scores[criterion.name] = scoreSpeed(durationMs, criterion.threshold)
        break
      case "custom":
        scores[criterion.name] = scoreCustom(actual, expected, criterion)
        break
      default:
        scores[criterion.name] = 0.5 // Neutral for unknown types
    }
  }

  return scores
}

/**
 * Accuracy scoring: compare actual vs expected output structure.
 * - If both are objects: check field-by-field intersection (Jaccard-like)
 * - If both are strings: check substring containment
 * - If both are arrays: check element overlap
 * - Otherwise: exact equality
 */
function scoreAccuracy(actual: unknown, expected: unknown): number {
  if (actual === null || actual === undefined) return 0
  if (expected === null || expected === undefined) return actual ? 0.5 : 1.0

  // Both objects: structural comparison
  if (typeof actual === "object" && typeof expected === "object" && !Array.isArray(actual) && !Array.isArray(expected)) {
    return scoreObjectAccuracy(actual as Record<string, unknown>, expected as Record<string, unknown>)
  }

  // Both arrays
  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (expected.length === 0) return 1.0
    if (actual.length === 0) return 0.3
    return Math.min(1.0, actual.length / expected.length)
  }

  // Both strings
  if (typeof actual === "string" && typeof expected === "string") {
    if (expected === "") return 1.0
    // Check if actual contains key phrases from expected
    const expectedPhrases = expected.toLowerCase().split(/[.\n]/).filter(Boolean)
    const actualLower = actual.toLowerCase()
    const matched = expectedPhrases.filter((p) => actualLower.includes(p.trim()))
    return expectedPhrases.length > 0 ? matched.length / expectedPhrases.length : 1.0
  }

  // Primitive comparison
  if (typeof actual === typeof expected) {
    return actual === expected ? 1.0 : 0.5
  }

  return 0.5
}

function scoreObjectAccuracy(actual: Record<string, unknown>, expected: Record<string, unknown>): number {
  const expectedKeys = Object.keys(expected)
  if (expectedKeys.length === 0) return 1.0

  // Check how many expected keys exist in actual (field presence)
  const presentKeys = expectedKeys.filter((k) => k in actual)
  const presenceScore = presentKeys.length / expectedKeys.length

  // Check value types match for overlapping keys
  let typeMatchCount = 0
  for (const key of presentKeys) {
    const actualVal = actual[key]
    const expectedVal = expected[key]
    if (typeof actualVal === typeof expectedVal) {
      typeMatchCount++
    } else if (actualVal !== null && expectedVal !== null) {
      // Allow stringified numbers
      if (typeof actualVal === "string" && typeof expectedVal === "number" && !isNaN(Number(actualVal))) {
        typeMatchCount++
      } else if (typeof actualVal === "number" && typeof expectedVal === "string") {
        typeMatchCount++
      }
    }
  }
  const typeScore = presentKeys.length > 0 ? typeMatchCount / presentKeys.length : 1.0

  return presenceScore * 0.6 + typeScore * 0.4
}

/**
 * Completeness scoring: what fraction of expected structure is present in actual output.
 * Checks for required sections, field presence, and non-empty values.
 */
function scoreCompleteness(actual: unknown, expected: unknown): number {
  if (actual === null || actual === undefined) return 0

  // Object completeness: how many expected top-level fields exist with non-null values
  if (typeof actual === "object" && !Array.isArray(actual) && typeof expected === "object" && !Array.isArray(expected)) {
    const exp = expected as Record<string, unknown>
    const act = actual as Record<string, unknown>
    const expectedFields = Object.keys(exp)
    if (expectedFields.length === 0) return 1.0

    let filledCount = 0
    for (const key of expectedFields) {
      if (key in act && act[key] !== null && act[key] !== undefined) {
        const val = act[key]
        if (typeof val === "string" && val.trim().length > 0) filledCount++
        else if (typeof val === "number" || typeof val === "boolean") filledCount++
        else if (Array.isArray(val) && val.length > 0) filledCount++
        else if (typeof val === "object" && val !== null && Object.keys(val).length > 0) filledCount++
      }
    }
    return filledCount / expectedFields.length
  }

  // String completeness: length relative to expected
  if (typeof actual === "string" && typeof expected === "string") {
    if (expected.length === 0) return 1.0
    return Math.min(1.0, actual.length / Math.max(expected.length, 1))
  }

  // Array completeness
  if (Array.isArray(actual)) {
    if (Array.isArray(expected) && expected.length === 0) return 1.0
    if (!Array.isArray(expected)) {
      return actual.length > 0 ? 0.8 : 0.0
    }
    return Math.min(1.0, actual.length / Math.max(expected.length, 1))
  }

  // Fallback: truthy check
  return actual ? 0.8 : 0.0
}

/**
 * Speed scoring: score based on execution duration vs thresholds.
 *   duration < 1s: 1.0 (fast)
 *   duration < 5s: 0.9
 *   duration < 15s: 0.7
 *   duration < 30s: 0.5
 *   duration < 60s: 0.3
 *   otherwise: 0.1
 */
function scoreSpeed(durationMs: number, _threshold?: number): number {
  const seconds = durationMs / 1000
  if (seconds < 1) return 1.0
  if (seconds < 5) return 0.9
  if (seconds < 15) return 0.7
  if (seconds < 30) return 0.5
  if (seconds < 60) return 0.3
  return 0.1
}

/**
 * Custom scoring: uses metric-specific logic from the criterion config.
 */
function scoreCustom(actual: unknown, expected: unknown, criterion: CriterionConfig): number {
  const metric = criterion.metric ?? ""
  // Metric-specific scorers
  if (metric === "module-classification-accuracy" && typeof actual === "object") {
    // Check if output contains module-related keys
    const obj = actual as Record<string, unknown>
    const hasModules = "modules" in obj || "moduleName" in obj || "classifications" in obj
    const hasCount = "count" in obj || "fileCount" in obj || "total" in obj
    if (hasModules && hasCount) return 0.9
    if (hasModules || hasCount) return 0.6
    return 0.3
  }
  if (metric === "file-coverage-ratio" && typeof actual === "object") {
    const obj = actual as Record<string, unknown>
    const hasFiles = "files" in obj || "fileCount" in obj || "coverage" in obj || "scanned" in obj
    return hasFiles ? 0.8 : 0.3
  }
  if (metric === "vulnerability-count" && typeof actual === "object") {
    const obj = actual as Record<string, unknown>
    return "vulnerabilities" in obj || "findings" in obj || "issues" in obj ? 0.8 : 0.3
  }
  if (metric === "migration-check-rate" && typeof actual === "object") {
    const obj = actual as Record<string, unknown>
    return "migrations" in obj || "changes" in obj || "impact" in obj ? 0.8 : 0.3
  }
  if (metric === "test-quality-index" && typeof actual === "object") {
    const obj = actual as Record<string, unknown>
    return "tests" in obj || "coverage" in obj || "quality" in obj || "ratio" in obj ? 0.8 : 0.3
  }

  // Generic custom: check that actual output has some content structure
  if (typeof actual === "object" && actual !== null) {
    const keys = Object.keys(actual as Record<string, unknown>)
    return keys.length > 0 ? Math.min(1.0, keys.length / 5) : 0.2
  }
  if (typeof actual === "string") {
    return actual.length > 100 ? 0.8 : actual.length > 20 ? 0.5 : 0.2
  }
  return 0.3
}

// ─── Aggregation ───

/**
 * Aggregate sample-level scores into an overall evaluation result.
 */
function aggregateResults(
  skillId: string,
  manifest: SkillManifest,
  dataset: EvaluationDataset,
  sampleResults: EvaluationSampleResult[],
  criteria: CriterionConfig[],
  options: EvaluationOptions,
  startMs: number,
): EvaluationResult {
  const errors: string[] = []
  const failedSamples = sampleResults.filter((s) => s.status !== "completed")

  for (const sample of failedSamples) {
    if (sample.error) errors.push(`Sample "${sample.sampleId}": ${sample.error}`)
    else errors.push(`Sample "${sample.sampleId}" status: ${sample.status}`)
  }

  // Compute criterion breakdown from all samples
  const criterionBreakdown: CriterionScore[] = criteria.map((c) => {
    const scores = sampleResults
      .filter((s) => s.status === "completed")
      .map((s) => s.criterionScores[c.name] ?? 0)

    const avgScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0

    return {
      name: c.name,
      score: avgScore,
      weight: c.weight,
      threshold: c.threshold,
      weighted: avgScore * c.weight,
      passed: avgScore >= c.threshold,
    }
  })

  // Overall score = weighted sum of criterion scores
  const overallScore = criterionBreakdown.reduce((sum, c) => sum + c.score * c.weight, 0)
  const passThreshold = options.passThreshold ?? criteria.reduce((sum, c) => sum + c.threshold * c.weight, 0)

  return {
    skillId,
    skillName: manifest.name,
    skillVersion: manifest.version,
    datasetName: dataset.description ?? dataset.skillId,
    datasetDescription: dataset.description ?? "",
    sampleCount: dataset.samples.length,
    timestamp: new Date().toISOString(),
    overallScore,
    passThreshold,
    passed: overallScore >= passThreshold,
    criterionBreakdown,
    samples: sampleResults,
    errors,
    durationMs: Date.now() - startMs,
  }
}

// ─── Main Evaluator ───

/**
 * Evaluate a single skill against its evaluation dataset.
 *
 * For each sample in the dataset:
 *   1. Load the skill manifest
 *   2. Execute the skill workflow with sample inputs
 *   3. Score the output against expected using criteria
 *   4. Collect results
 *
 * Then aggregate all sample results into a final evaluation report.
 */
export async function evaluateSkill(
  skillId: string,
  options: EvaluationOptions = {},
): Promise<EvaluationResult> {
  const startMs = Date.now()

  // 1. Load manifest
  let manifest: SkillManifest
  try {
    manifest = loadManifest(skillId)
  } catch (err) {
    return {
      skillId,
      skillName: skillId,
      skillVersion: "unknown",
      datasetName: "",
      datasetDescription: "",
      sampleCount: 0,
      timestamp: new Date().toISOString(),
      overallScore: 0,
      passThreshold: 0,
      passed: false,
      criterionBreakdown: [],
      samples: [],
      errors: [err instanceof Error ? err.message : String(err)],
      durationMs: Date.now() - startMs,
    }
  }

  // 2. Load evaluation dataset
  let dataset: EvaluationDataset
  try {
    dataset = loadDataset(skillId, manifest, options.datasetPath)
  } catch (err) {
    return {
      skillId,
      skillName: manifest.name,
      skillVersion: manifest.version,
      datasetName: "",
      datasetDescription: "",
      sampleCount: 0,
      timestamp: new Date().toISOString(),
      overallScore: 0,
      passThreshold: 0,
      passed: false,
      criterionBreakdown: [],
      samples: [],
      errors: [err instanceof Error ? err.message : String(err)],
      durationMs: Date.now() - startMs,
    }
  }

  // 3. Determine criteria to use
  const criteria: CriterionConfig[] = options.criteria ?? (manifest.evaluation?.criteria as CriterionConfig[]) ?? []

  if (criteria.length === 0) {
    return {
      skillId,
      skillName: manifest.name,
      skillVersion: manifest.version,
      datasetName: dataset.description ?? dataset.skillId,
      datasetDescription: dataset.description ?? "",
      sampleCount: dataset.samples.length,
      timestamp: new Date().toISOString(),
      overallScore: 1.0,
      passThreshold: 1.0,
      passed: true,
      criterionBreakdown: [],
      samples: [],
      errors: ["No evaluation criteria defined — passing by default"],
      durationMs: Date.now() - startMs,
    }
  }

  // 4. Execute each sample
  const sampleResults: EvaluationSampleResult[] = []

  for (const sample of dataset.samples) {
    const sampleStart = Date.now()
    let sampleResult: EvaluationSampleResult

    try {
      // Execute the skill with sample inputs
      const execResult: SkillResult = await executeSkill(skillId, sample.input, {
        session: options.session,
        auditEnabled: options.auditEnabled,
      })

      const durationMs = Date.now() - sampleStart
      const output = execResult.primary

      // Score the output
      const criterionScores = scoreSample(output, sample.expected, criteria, durationMs)

      // Overall score for this sample = weighted sum
      const overallScore = criteria.reduce((sum, c) => sum + (criterionScores[c.name] ?? 0) * c.weight, 0)

      sampleResult = {
        sampleId: sample.id,
        description: sample.description,
        status: execResult.status === "completed" ? "completed" : "failed",
        output,
        error: execResult.errors.length > 0 ? execResult.errors.join("; ") : undefined,
        criterionScores,
        overallScore,
        durationMs,
      }
    } catch (err) {
      sampleResult = {
        sampleId: sample.id,
        description: sample.description,
        status: "error",
        output: null,
        error: err instanceof Error ? err.message : String(err),
        criterionScores: {},
        overallScore: 0,
        durationMs: Date.now() - sampleStart,
      }

      if (options.failFast) {
        sampleResults.push(sampleResult)
        break
      }
    }

    sampleResults.push(sampleResult)
  }

  // 5. Aggregate results
  return aggregateResults(skillId, manifest, dataset, sampleResults, criteria, options, startMs)
}

// ─── Batch Evaluation ───

/**
 * Evaluate all skills at a given level (or all skills).
 *
 * Loads the registry to discover skills at the specified level,
 * then evaluates each one sequentially.
 */
export async function evaluateSkillsByLevel(
  level?: number,
  options: EvaluationOptions = {},
): Promise<BatchEvaluationResult> {
  const startMs = Date.now()

  // Discover skills by scanning manifest directories
  const manifestRoot = ".skills/manifests"
  const categories = readdirSync(join(process.cwd(), manifestRoot), { withFileTypes: true })

  const skillIds: string[] = []
  for (const category of categories) {
    if (!category.isDirectory()) continue
    const categoryPath = join(process.cwd(), manifestRoot, category.name)
    let files: string[] = []
    try {
      files = readdirSync(categoryPath).filter((f) => f.endsWith(".skill.yaml"))
    } catch {
      continue // skip categories that fail to read
    }
    for (const file of files) {
      const skillName = file.replace(".skill.yaml", "")
      const fullId = `skill:${category.name}:${skillName}`
      // Check level by loading manifest
      try {
        const manifest = loadManifest(fullId)
        if (level === undefined || manifest.level === level) {
          skillIds.push(fullId)
        }
      } catch {
        // Skip skills that fail to load
      }
    }
  }

  // Evaluate each skill
  const results: EvaluationResult[] = []
  for (const skillId of skillIds) {
    try {
      const result = await evaluateSkill(skillId, options)
      results.push(result)
    } catch (err) {
      results.push({
        skillId,
        skillName: skillId,
        skillVersion: "unknown",
        datasetName: "",
        datasetDescription: "",
        sampleCount: 0,
        timestamp: new Date().toISOString(),
        overallScore: 0,
        passThreshold: 0,
        passed: false,
        criterionBreakdown: [],
        samples: [],
        errors: [err instanceof Error ? err.message : String(err)],
        durationMs: 0,
      })
    }
  }

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length

  return {
    timestamp: new Date().toISOString(),
    totalSkills: results.length,
    passed,
    failed,
    errored: results.filter((r) => r.errors.length > 0 && !r.passed).length,
    overallPassRate: results.length > 0 ? passed / results.length : 0,
    results,
    durationMs: Date.now() - startMs,
  }
}

// ─── Evaluation Report Formatting ───

/**
 * Format an evaluation result as a human-readable markdown report.
 */
export function formatEvaluationReport(result: EvaluationResult): string {
  const lines: string[] = []

  lines.push(`# Evaluation Report: ${result.skillName}`)
  lines.push(`**Skill ID:** \`${result.skillId}\`  `)
  lines.push(`**Version:** ${result.skillVersion}  `)
  lines.push(`**Dataset:** ${result.datasetName}  `)
  lines.push(`**Timestamp:** ${result.timestamp}  `)
  lines.push(`**Duration:** ${result.durationMs}ms  `)
  lines.push("")
  lines.push(`## Overall: ${result.passed ? "✅ PASS" : "❌ FAIL"}`)
  lines.push(`**Score:** ${(result.overallScore * 100).toFixed(1)}% (threshold: ${(result.passThreshold * 100).toFixed(1)}%)  `)
  lines.push(`**Samples:** ${result.samples.length}/${result.sampleCount}  `)
  lines.push("")

  // Criterion breakdown
  if (result.criterionBreakdown.length > 0) {
    lines.push("## Criteria Breakdown")
    lines.push("| Criterion | Type | Score | Weight | Threshold | Passed |")
    lines.push("|-----------|------|-------|--------|-----------|--------|")
    for (const c of result.criterionBreakdown) {
      const check = c.passed ? "✅" : "❌"
      lines.push(`| ${c.name} | - | ${(c.score * 100).toFixed(1)}% | ${(c.weight * 100).toFixed(0)}% | ${(c.threshold * 100).toFixed(0)}% | ${check} |`)
    }
    lines.push("")
  }

  // Sample details
  if (result.samples.length > 0) {
    lines.push("## Sample Results")
    for (const sample of result.samples) {
      const icon = sample.status === "completed" ? "✅" : sample.status === "error" ? "💥" : "❌"
      lines.push(`### ${icon} Sample: ${sample.sampleId}`)
      lines.push(`**Description:** ${sample.description}  `)
      lines.push(`**Status:** ${sample.status}  `)
      lines.push(`**Score:** ${(sample.overallScore * 100).toFixed(1)}%  `)
      lines.push(`**Duration:** ${sample.durationMs}ms  `)
      if (sample.error) {
        lines.push(`**Error:** ${sample.error}  `)
      }
      if (sample.output && typeof sample.output === "object") {
        const outputStr = JSON.stringify(sample.output, null, 2)
        lines.push("```json")
        lines.push(outputStr.length > 500 ? outputStr.slice(0, 500) + "..." : outputStr)
        lines.push("```")
      }
      lines.push("")
    }
  }

  // Errors
  if (result.errors.length > 0) {
    lines.push("## Errors")
    for (const err of result.errors) {
      lines.push(`- ${err}`)
    }
    lines.push("")
  }

  return lines.join("\n")
}

/**
 * Format a batch evaluation result as markdown.
 */
export function formatBatchEvaluationReport(result: BatchEvaluationResult): string {
  const lines: string[] = []

  lines.push("# Batch Evaluation Report")
  lines.push(`**Timestamp:** ${result.timestamp}  `)
  lines.push(`**Total Skills:** ${result.totalSkills}  `)
  lines.push(`**Passed:** ${result.passed}  `)
  lines.push(`**Failed:** ${result.failed}  `)
  lines.push(`**Pass Rate:** ${(result.overallPassRate * 100).toFixed(1)}%  `)
  lines.push(`**Duration:** ${result.durationMs}ms  `)
  lines.push("")

  lines.push("## Summary")
  lines.push("| Skill | Score | Threshold | Passed |")
  lines.push("|-------|-------|-----------|--------|")
  for (const r of result.results) {
    const icon = r.passed ? "✅" : "❌"
    const scoreStr = `${(r.overallScore * 100).toFixed(1)}%`
    const thresholdStr = `${(r.passThreshold * 100).toFixed(1)}%`
    lines.push(`| ${r.skillName} | ${scoreStr} | ${thresholdStr} | ${icon} |`)
  }
  lines.push("")

  return lines.join("\n")
}

// ─── Re-export helper for external use ───

export { loadDataset, scoreSample, scoreAccuracy, scoreCompleteness, scoreSpeed, scoreCustom }
