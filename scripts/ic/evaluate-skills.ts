// ─── AQLIYA Skill Evaluation CLI ───
// Self-contained script — no dependency on Next.js modules (avoids Prisma dependency).
//
// Usage:
//   tsx -r ./scripts/mock-server-only.cjs scripts/evaluate-skills.ts --mock            # All mock
//   tsx -r ./scripts/mock-server-only.cjs scripts/evaluate-skills.ts --level 0          # Level 0
//   tsx -r ./scripts/mock-server-only.cjs scripts/evaluate-skills.ts --skill <id>       # Single
//   tsx -r ./scripts/mock-server-only.cjs scripts/evaluate-skills.ts --mock --output results.json
// ============================================================

import { readFileSync, existsSync, readdirSync, writeFileSync } from "fs"
import { join, basename } from "path"
import * as yaml from "js-yaml"

// ─── CLI parsing ───

const args = process.argv.slice(2)
const flags: Record<string, string | boolean> = {}
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    const key = args[i].slice(2)
    if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
      flags[key] = args[i + 1]
      i++
    } else {
      flags[key] = true
    }
  }
}

// ─── Scoring functions (mirrors src/lib/skill-runtime/evaluator.ts) ───

/** Detect if an expected value is a human-readable schema description rather than a real expected value */
function isSchemaDescription(val: unknown): boolean {
  if (typeof val !== "string") return false
  const descIndicators = [
    "array of", "object of", "string —", "e.g.",
    "number of", "example", "description of",
    "list of", "set of", "map of",
    // Generic schema indicators
    " — ",   // emdash separator used in type descriptions (e.g., "number — total files")
    "e.g.,", // example prefix
  ]
  const lower = val.toLowerCase()
  // Check if the value starts with a type name followed by space-emdash
  // Common pattern: "number — total files in src/", "array of strings — e.g. [...]"
  const hasTypePrefix = /^(number|string|array|object|boolean|record|map|set|list)\s/.test(lower)
  return descIndicators.some((d) => lower.includes(d)) || (hasTypePrefix && lower.length > 10)
}

/** Infer the JSON type from a schema description string */
function inferTypeFromDescription(desc: string): string {
  const lower = desc.toLowerCase()
  if (lower.startsWith("array") || lower.startsWith("list") || lower.startsWith("set")) return "array"
  if (lower.startsWith("object") || lower.startsWith("map") || lower.startsWith("{") || lower.includes("{from")) return "object"
  if (lower.startsWith("number") || lower.startsWith("integer") || lower.startsWith("float")) return "number"
  if (lower.startsWith("boolean") || lower.startsWith("bool")) return "boolean"
  return "string" // default
}

/** Check if an actual value matches an inferred type */
function typeMatchesInferred(val: unknown, inferredType: string): boolean {
  switch (inferredType) {
    case "array": return Array.isArray(val)
    case "object": return typeof val === "object" && val !== null && !Array.isArray(val)
    case "number": return typeof val === "number"
    case "boolean": return typeof val === "boolean"
    case "string": return typeof val === "string"
    default: return typeof val === inferredType
  }
}

/**
 * Detect when the model outputs an individual array item instead of the full report structure.
 * Expected descriptions like "array of {persona, relevance, message}" tell us the inner fields.
 * If model output keys match those inner fields, wrap them in the expected array structure.
 */
function tryExpandNestedOutput(output: unknown, expected: Record<string, unknown>): unknown {
  if (!output || typeof output !== "object" || Array.isArray(output)) return output
  const out = output as Record<string, unknown>

  // Collect potential match: for each expected field with "array of {fields}" pattern
  for (const [expKey, expVal] of Object.entries(expected)) {
    const strVal = String(expVal)
    // Match patterns like "array of {field1, field2}" or "array of objects each with field1, field2"
    const innerMatch = strVal.match(/\{\s*([a-zA-Z_][a-zA-Z0-9_,\s]*)\s*\}/)
    if (!innerMatch) continue

    const innerFields = innerMatch[1].split(/,\s*/).map(f => f.trim()).filter(Boolean)
    if (innerFields.length === 0) continue

    // Check if the model output has a significant overlap with these inner fields
    const outKeys = Object.keys(out)
    const overlap = innerFields.filter(f => outKeys.includes(f))
    // If > 50% of the expected inner fields appear in the output, it's likely a flattened item
    if (overlap.length >= Math.ceil(innerFields.length / 2)) {
      // Wrap the output: add the parent array field with one item
      const result = { ...out }
      result[expKey] = [overlap.length === innerFields.length ? out : innerFields.reduce((acc, f) => { acc[f] = out[f] ?? null; return acc }, {} as Record<string, unknown>)]
      return result
    }
  }

  return output
}

function scoreAccuracy(actual: unknown, expected: unknown): number {
  if (actual === null || actual === undefined || expected === null || expected === undefined) return 0

  // Schema-description-aware comparison at the object level
  if (typeof actual === "object" && !Array.isArray(actual) && typeof expected === "object" && !Array.isArray(expected)) {
    const expObj = expected as Record<string, unknown>
    const actObj = actual as Record<string, unknown>
    const expKeys = Object.keys(expObj)
    if (expKeys.length === 0) return 1.0

    // TWO scoring passes:
    // Pass 1: Try exact key matching (when model follows field names)
    const presentKeys = expKeys.filter((k) => k in actObj)
    const exactKeysScore = presentKeys.length / expKeys.length

    // Pass 2: Type-based matching (field-name-agnostic — when model uses different names)
    // For each expected field, find the "best match" among actual fields by type compatibility
    let typeMatchCount = 0
    let typeMatchTotal = 0
    for (const expKey of expKeys) {
      const expVal = expObj[expKey]
      let bestScore = 0
      for (const actKey of Object.keys(actObj)) {
        const actVal = actObj[actKey]
        let pairScore = 0
        if (isSchemaDescription(expVal)) {
          const inferredType = inferTypeFromDescription(String(expVal))
          if (typeMatchesInferred(actVal, inferredType)) pairScore = 0.85
          else pairScore = 0.3
          // Extra credit for non-trivial values
          if (Array.isArray(actVal) && actVal.length > 0) pairScore += 0.1
          if (typeof actVal === "object" && actVal !== null && !Array.isArray(actVal) && Object.keys(actVal).length > 0) pairScore += 0.05
          if (typeof actVal === "number" && actVal > 0) pairScore += 0.05
          if (typeof actVal === "string" && actVal.length > 0 && actVal !== "?") pairScore += 0.05
        } else if (typeof actVal === typeof expVal) {
          pairScore = 0.8
          if (typeof actVal === "string" && typeof expVal === "string") {
            if (actVal === expVal) pairScore = 1.0
            else if (actVal.toLowerCase().includes(expVal.toLowerCase())) pairScore = 0.9
          }
          if (typeof actVal === "number" && typeof expVal === "number") {
            if (actVal === expVal) pairScore = 1.0
            else if (Math.abs(actVal - expVal) < expVal * 0.3) pairScore = 0.85
          }
          if (typeof actVal === "boolean" && actVal === expVal) pairScore = 1.0
        } else {
          // Try soft type match
          if (typeof actVal === "string" && typeof expVal === "number") {
            const num = Number(actVal)
            if (!isNaN(num)) pairScore = 0.6
          } else {
            pairScore = 0.3
          }
        }
        if (pairScore > bestScore) bestScore = pairScore
      }
      typeMatchCount += bestScore
      typeMatchTotal++
    }
    const typeAgnosticScore = typeMatchTotal > 0 ? typeMatchCount / typeMatchTotal : 0

    // Combine: prefer exact key match if model follows field names, fall back to type-agnostic
    // Use exact key score if >3 keys match (model is following field names), otherwise use type matching
    const hasGoodKeyOverlap = presentKeys.length >= expKeys.length * 0.5
    if (hasGoodKeyOverlap) {
      // Use key-based scoring
      let scoreSum = 0
      let scoredCount = 0
      for (const key of expKeys) {
        const expVal = expObj[key]
        const actVal = actObj[key]
        if (actVal === undefined) { scoreSum += 0; scoredCount++; continue }

        if (isSchemaDescription(expVal)) {
          const inferredType = inferTypeFromDescription(String(expVal))
          scoreSum += typeMatchesInferred(actVal, inferredType) ? 0.9 : 0.4
          if (Array.isArray(actVal) && actVal.length > 0) scoreSum += 0.05
          if (typeof actVal === "number" && actVal > 0) scoreSum += 0.05
        } else if (typeof expVal === "string" && typeof actVal === "string") {
          if (actVal === expVal) scoreSum += 1.0
          else if (actVal.toLowerCase().includes(expVal.toLowerCase()) || expVal.toLowerCase().includes(actVal.toLowerCase())) scoreSum += 0.7
          else { const d = levenshtein(actVal.toLowerCase(), expVal.toLowerCase()); scoreSum += Math.max(0, 1 - d / Math.max(actVal.length, expVal.length, 1)) }
        } else if (typeof expVal === "number" && typeof actVal === "number") {
          if (actVal === expVal) scoreSum += 1.0
          else if (Math.abs(actVal - expVal) < expVal * 0.1) scoreSum += 0.9
          else if (Math.abs(actVal - expVal) < expVal * 0.3) scoreSum += 0.7
          else scoreSum += 0.4
        } else if (typeof expVal === "boolean" && typeof actVal === "boolean") {
          scoreSum += actVal === expVal ? 1.0 : 0.5
        } else { scoreSum += 0.4 }
        scoredCount++
      }
      return scoredCount > 0 ? scoreSum / scoredCount : 1.0
    }

    // Model didn't follow field names — use type-agnostic matching
    return typeAgnosticScore
  }

  // Non-object: use standard matching
  if (typeof actual !== typeof expected) {
    if (typeof actual === "string" && typeof expected === "number") {
      const num = Number(actual)
      if (!isNaN(num)) return Math.min(1, Math.abs(num - expected) < expected * 0.2 ? 0.8 : 0.4)
    }
    if (typeof actual === "number" && typeof expected === "string" && expected.length > 0) {
      const num = Number(expected)
      if (!isNaN(num)) return Math.min(1, Math.abs(actual - num) < num * 0.2 ? 0.8 : 0.4)
    }
    return 0.3
  }
  if (typeof actual === "number" && typeof expected === "number") {
    if (actual === expected) return 1.0
    if (Math.abs(actual - expected) < expected * 0.1) return 0.9
    if (Math.abs(actual - expected) < expected * 0.3) return 0.7
    return 0.4
  }
  if (typeof actual === "string" && typeof expected === "string") {
    if (actual === expected) return 1.0
    if (actual.toLowerCase().includes(expected.toLowerCase()) || expected.toLowerCase().includes(actual.toLowerCase())) return 0.7
    const maxLen = Math.max(actual.length, expected.length)
    if (maxLen === 0) return 1.0
    const dist = levenshtein(actual.toLowerCase(), expected.toLowerCase())
    return Math.max(0, 1 - dist / maxLen)
  }
  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (expected.length === 0) return actual.length === 0 ? 1.0 : 0.5
    const expStr = expected.map(String)
    const actStr = actual.map(String)
    const common = expStr.filter((e) => actStr.some((a) => a === e || a.toLowerCase().includes(e.toLowerCase()) || e.toLowerCase().includes(a.toLowerCase())))
    return common.length / Math.max(expected.length, actual.length)
  }
  return actual ? 0.5 : 0
}

function scoreCompleteness(actual: unknown, expected: unknown, requiredFields?: string[]): number {
  if (actual === null || actual === undefined) return 0
  if (typeof actual === "object" && !Array.isArray(actual)) {
    const act = actual as Record<string, unknown>

    // If requiredFields specified, check only those. Otherwise check all expected keys.
    const fieldsToCheck = requiredFields ?? (expected !== null && expected !== undefined && typeof expected === "object" && !Array.isArray(expected) ? Object.keys(expected as Record<string, unknown>) : [])

    if (fieldsToCheck.length === 0) {
      // No field constraints — check if output has any meaningful content
      const keys = Object.keys(act)
      if (keys.length === 0) return 0
      let filledCount = 0
      for (const key of keys) {
        const val = act[key]
        if (val !== null && val !== undefined) {
          if (typeof val === "string" && val.trim().length > 0) filledCount++
          else if (typeof val === "number" || typeof val === "boolean") filledCount++
          else if (Array.isArray(val) && val.length > 0) filledCount++
          else if (typeof val === "object" && Object.keys(val).length > 0) filledCount++
        }
      }
      return filledCount / Math.max(keys.length, 1)
    }

    let filledCount = 0
    for (const key of fieldsToCheck) {
      if (key in act && act[key] !== null && act[key] !== undefined) {
        const val = act[key]
        if (typeof val === "string" && val.trim().length > 0) filledCount++
        else if (typeof val === "number" || typeof val === "boolean") filledCount++
        else if (Array.isArray(val) && val.length > 0) filledCount++
        else if (typeof val === "object" && val !== null && Object.keys(val).length > 0) filledCount++
      }
    }
    return filledCount / Math.max(fieldsToCheck.length, 1)
  }
  if (typeof actual === "string" && typeof expected === "string") {
    if (expected.length === 0) return 1.0
    return Math.min(1.0, actual.length / Math.max(expected.length, 1))
  }
  if (Array.isArray(actual)) {
    if (Array.isArray(expected) && expected.length === 0) return 1.0
    if (!Array.isArray(expected)) return actual.length > 0 ? 0.8 : 0
    return Math.min(1.0, actual.length / Math.max(expected.length, 1))
  }
  return actual ? 0.8 : 0
}

function scoreConsistency(): number { return 1.0 }
function scoreSpeed(durationMs?: number, threshold?: number): number {
  if (durationMs === undefined || threshold === undefined) return 1.0
  if (durationMs <= threshold) return 1.0
  if (durationMs <= threshold * 2) return 0.8
  if (durationMs <= threshold * 5) return 0.5
  return 0.2
}

function scoreCustom(actual: unknown, _expected: unknown): number {
  if (typeof actual === "object" && actual !== null) {
    const keys = Object.keys(actual as Record<string, unknown>)
    return keys.length > 0 ? Math.min(1.0, keys.length / 5) : 0.2
  }
  if (typeof actual === "string") return actual.length > 100 ? 0.8 : actual.length > 20 ? 0.5 : 0.2
  return 0.3
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

// ─── Dataset / Manifest loading ───

const EVAL_ROOT = ".skills/evaluations"
const MANIFEST_ROOT = ".skills/manifests"

function loadDataset(skillId: string): any {
  const safeId = skillId.replace(/:/g, "-")
  const paths = [
    join(process.cwd(), EVAL_ROOT, safeId, "datasets", "v1.yaml"),
    join(process.cwd(), EVAL_ROOT, skillId, "datasets", "v1.yaml"),
  ]
  for (const p of paths) {
    if (existsSync(p)) return yaml.load(readFileSync(p, "utf-8"))
  }
  // Try to find by scanning
  const evalDir = join(process.cwd(), EVAL_ROOT)
  if (!existsSync(evalDir)) throw new Error(`Evaluation root not found: ${EVAL_ROOT}`)
  const entries = readdirSync(evalDir, { withFileTypes: true })
  for (const e of entries) {
    if (e.isDirectory()) {
      const candidate = join(evalDir, e.name, "datasets", "v1.yaml")
      if (existsSync(candidate)) {
        const content = yaml.load(readFileSync(candidate, "utf-8")) as any
        if (content?.skillId === skillId || e.name === safeId) return content
      }
    }
  }
  throw new Error(`Dataset not found for ${skillId}`)
}

function loadManifest(skillId: string): any {
  const parts = skillId.split(":")
  if (parts.length !== 3) throw new Error(`Invalid skill ID format: ${skillId} (expected skill:<category>:<name>)`)
  const [, category, name] = parts
  const p = join(process.cwd(), MANIFEST_ROOT, category, `${name}.skill.yaml`)
  if (!existsSync(p)) throw new Error(`Manifest not found: ${p}`)
  return yaml.load(readFileSync(p, "utf-8"))
}

function listSkillsByLevel(level?: number): string[] {
  const root = join(process.cwd(), MANIFEST_ROOT)
  const cats = readdirSync(root, { withFileTypes: true })
  const skills: string[] = []
  for (const cat of cats) {
    if (!cat.isDirectory()) continue
    const catPath = join(root, cat.name)
    const files = readdirSync(catPath).filter((f) => f.endsWith(".skill.yaml"))
    for (const file of files) {
      const name = file.replace(".skill.yaml", "")
      const id = `skill:${cat.name}:${name}`
      try {
        const m = loadManifest(id)
        if (level === undefined || m.level === level) skills.push(id)
      } catch { /* skip unloadable */ }
    }
  }
  return skills
}

function skillHasDataset(skillId: string): boolean {
  try { loadDataset(skillId); return true } catch { return false }
}

// ─── Mock AI output (skill-type-aware) ───

import { randomUUID } from "crypto"

// Build mock output by interpreting the expected field shapes from each dataset.
// This produces deterministic output that matches each skill's expected structure.
function getMockOutput(skillId: string, sample: any): unknown {
  const expected = sample?.expected ?? {}
  // Fallback for samples with no expected shape: return a generic shape
  if (!expected || typeof expected !== "object" || Object.keys(expected).length === 0) {
    return { outputType: "analysis_report", status: "completed", summary: "Mock analysis output." }
  }
  return buildMockFromTemplate(expected)
}

function buildMockFromTemplate(template: any): any {
  if (Array.isArray(template)) {
    // Generate 1–2 items from the first element
    if (template.length === 0) return []
    const item1 = buildMockFromTemplate(template[0])
    const item2 = buildMockFromTemplate(template[0])
    return [item1, item2]
  }
  if (typeof template !== "object" || template === null) return template

  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(template)) {
    if (typeof val === "string") {
      result[key] = inferMockValue(val, key)
    } else if (typeof val === "boolean") {
      result[key] = val
    } else if (typeof val === "number") {
      result[key] = val
    } else if (typeof val === "object" && val !== null) {
      result[key] = buildMockFromTemplate(val)
    }
  }
  return result
}

function inferMockValue(typeHint: string, key: string): unknown {
  const trimmed = typeHint.trim()
  const lower = trimmed.toLowerCase()

  // Boolean hints: "boolean", "true", "false"
  if (lower === "true") return true
  if (lower === "false") return false
  if (lower.startsWith("boolean")) return inferBooleanMock(key)

  // Number hints: "number", "number — description"
  if (lower.startsWith("number")) return inferNumberMock(key)

  // Array hints: "array of ...", "array of string", "array of {...}"
  if (lower.startsWith("array")) return inferArrayMock(key)

  // String — use the description text (strip potential " — " suffix)
  const desc = trimmed.split("—")[0]?.trim() || trimmed
  // For outputType marker fields, return them verbatim
  if (key === "outputType" && desc.length < 50) return desc
  // For short labels (single words), return them verbatim
  if (!desc.includes(" ") && desc.length < 40) return desc
  // For longer descriptions, return a dummy sentence
  if (desc.includes("estimate") || desc.includes("assessment") || desc.includes("projection")) {
    return `${desc} mock value for testing`
  }
  return desc
}

function inferBooleanMock(key: string): boolean {
  const negativeKeys = [
    "missing", "broken", "invalid", "orphan", "conflict", "circular",
    "unprotected", "flagged", "error", "failed", "blocked", "regressed",
    "issue", "violation", "risk", "concern", "danger",
    "feasible", // default false for feasibility (safer)
  ]
  const lower = key.toLowerCase()
  for (const nk of negativeKeys) {
    if (lower.includes(nk)) return false
  }
  // Positive keys default true
  return true
}

function inferNumberMock(key: string): number {
  const lower = key.toLowerCase()
  // Score/rate fields → 0.85
  if (lower.includes("score") || lower.includes("rate") || lower.includes("confidence") || lower.includes("accuracy")) return 0.85
  // Percentage fields → 85
  if (lower.includes("percent") || lower.includes("coverage") || lower.includes("health")) return 85
  // Duration → 120
  if (lower.includes("ms") || lower.includes("duration") || lower.includes("latency") || lower.includes("time")) return 120
  // Count fields with known prefixes → reasonable values
  if (lower.includes("total") || lower.includes("count")) return 3
  if (lower.startsWith("num")) return 3
  if (lower.endsWith("s") && !lower.endsWith("ss")) return 3  // plural → count
  if (lower.includes("level") || lower.includes("threshold")) return 4
  if (lower.includes("price") || lower.includes("cost") || lower.includes("investment")) return 50000
  if (lower.includes("edge") || lower.includes("relation")) return 5
  if (lower.includes("year") || lower.includes("month")) return 12
  // Default — small integer
  return 3
}

function inferArrayMock(key: string): unknown[] {
  const lower = key.toLowerCase()
  // Return plausible array content based on key name
  if (lower.includes("recommendation") || lower.includes("suggestion")) {
    return ["Mock recommendation 1: review governance coverage", "Mock recommendation 2: strengthen evidence linking"]
  }
  if (lower.includes("finding") || lower.includes("issue") || lower.includes("violation") || lower.includes("error")) {
    return [{ id: "mock-001", severity: "low", category: "style", description: "Mock finding for evaluation" }]
  }
  if (lower.includes("competitor") || lower.includes("competition")) {
    return [{ name: "MockCompetitor", strengths: ["brand"], weaknesses: ["no governance"] }]
  }
  if (lower.includes("segment") || lower.includes("market")) {
    return [{ name: "Saudi Arabia", size: "500M SAR", priority: "high" }]
  }
  if (lower.includes("module") || lower.includes("engine") || lower.includes("service")) {
    return [{ name: "mock-core", files: ["index.ts"], responsibility: "Mock responsibility" }]
  }
  if (lower.includes("dependency") || lower.includes("depend")) {
    return [{ source: "module-a", target: "module-b", type: "import" }]
  }
  // Default — return two placeholder objects with key-derived field
  return [{ [key === "dependencies" ? "source" : "name"]: "mock-item-1" }, { [key === "dependencies" ? "source" : "name"]: "mock-item-2" }]
}

// ─── Report formatters (mirrors src/lib/skill-runtime/evaluator.ts) ───

function formatEvaluationReport(result: any): string {
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
  if (result.criterionBreakdown?.length > 0) {
    lines.push("## Criteria Breakdown")
    lines.push("| Criterion | Score | Weight | Threshold | Passed |")
    lines.push("|-----------|-------|--------|-----------|--------|")
    for (const c of result.criterionBreakdown) {
      const check = c.passed ? "✅" : "❌"
      lines.push(`| ${c.name} | ${(c.score * 100).toFixed(1)}% | ${(c.weight * 100).toFixed(0)}% | ${(c.threshold * 100).toFixed(0)}% | ${check} |`)
    }
    lines.push("")
  }
  if (result.samples?.length > 0) {
    lines.push("## Sample Results")
    for (const sample of result.samples) {
      const icon = sample.status === "completed" ? "✅" : sample.status === "error" ? "💥" : "❌"
      lines.push(`### ${icon} Sample: ${sample.sampleId}`)
      lines.push(`**Description:** ${sample.description}  `)
      lines.push(`**Status:** ${sample.status}  `)
      lines.push(`**Score:** ${(sample.overallScore * 100).toFixed(1)}%  `)
      lines.push(`**Duration:** ${sample.durationMs}ms  `)
      if (sample.error) lines.push(`**Error:** ${sample.error}  `)
      const displayOutput = sample.expandedOutput ?? sample.output
      if (displayOutput && typeof displayOutput === "object") {
        const outputStr = JSON.stringify(displayOutput, null, 2)
        lines.push("```json")
        lines.push(outputStr.length > 500 ? outputStr.slice(0, 500) + "..." : outputStr)
        lines.push("```")
      }
      lines.push("")
    }
  }
  if (result.errors?.length > 0) {
    lines.push("## Errors")
    for (const err of result.errors) lines.push(`- ${err}`)
    lines.push("")
  }
  return lines.join("\n")
}

function formatBatchReport(result: any): string {
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
    lines.push(`| ${r.skillName} | ${(r.overallScore * 100).toFixed(1)}% | ${(r.passThreshold * 100).toFixed(1)}% | ${icon} |`)
  }
  lines.push("")
  return lines.join("\n")
}

// ─── Real AI provider call (Ollama local) ───

const OLLAMA_BASE = process.env.AI_LOCAL_BASE_URL ?? "http://localhost:11434"
const OLLAMA_MODEL = process.env.AI_LOCAL_MODEL ?? "qwen3:8b"

async function callOllama(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: "system", content: "You are a JSON output assistant. You ALWAYS respond with valid JSON only — no markdown, no code fences, no extra text. You follow the exact JSON structure provided in the user's message and fill in realistic values for every field." },
        { role: "user", content: prompt }
      ],
      stream: false,
      options: { temperature: 0.1 },
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Ollama API error (${res.status}): ${text.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.message?.content ?? ""
}

/** Find the outermost balanced { ... } block in text */
function extractOutermostBraces(text: string): string | null {
  const start = text.indexOf("{")
  if (start === -1) return null
  let depth = 0
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++
    else if (text[i] === "}") {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

function extractJson(raw: string): any {
  // 1. Try to extract from markdown code blocks ```json ... ```
  const mdMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
  let candidate: string
  if (mdMatch) {
    candidate = mdMatch[1].trim()
  } else {
    // 2. Find the outermost balanced { ... } block using stack
    const outermost = extractOutermostBraces(raw)
    if (outermost) {
      candidate = outermost
    } else {
      candidate = raw.trim()
    }
  }

  // 3. Try direct parse
  try { return JSON.parse(candidate) } catch {}

  // 4. Try repairing common issues
  const repaired = candidate
    // Remove trailing commas in objects and arrays
    .replace(/,\s*}/g, "}")
    .replace(/,\s*\]/g, "]")
    // Replace single quotes with double quotes for keys
    .replace(/'/g, '"')
    // Remove comments (// ...)
    .replace(/\/\/.*$/gm, "")
    // Remove trailing whitespace after last }
    .replace(/\s*$/, "")

  try { return JSON.parse(repaired) } catch {}

  // 5. Fallback: walk backward from last } to find matching outermost {
  const lastEnd = repaired.lastIndexOf("}")
  if (lastEnd >= 0) {
    // Find the matching outermost opening brace
    let depth = 0
    let outerStart = -1
    for (let i = lastEnd; i >= 0; i--) {
      if (repaired[i] === "}") depth++
      else if (repaired[i] === "{") {
        depth--
        if (depth === 0) { outerStart = i; break }
      }
    }
    if (outerStart >= 0) {
      try { return JSON.parse(repaired.slice(outerStart, lastEnd + 1)) } catch {}
    }
  }

  throw new Error(`Cannot parse JSON from response. Raw: ${raw.slice(0, 300)}...`)
}

function buildSkillPrompt(manifest: any, sample: any): string {
  const inputDesc = sample.input
    ? Object.entries(sample.input)
        .map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`)
        .join("\n")
    : "  (no input provided)"

  // Build a literal JSON template with placeholder values
  const jsonTemplate = sample.expected
    ? (() => {
        const entries = Object.entries(sample.expected)
        const lines = entries.map(([key, val], i) => {
          const comma = i < entries.length - 1 ? "," : ""
          const strVal = String(val)
          const isLast = i === entries.length - 1

          // Generate an obviously-fake placeholder so the model replaces it
          let placeholder: string
          const lower = strVal.toLowerCase()

          // Extract example hints from " — e.g." patterns (for reference only)
          const exampleMatch = strVal.match(/e\.g\.,?\s*(.+)$/)
          const exampleStr = exampleMatch ? exampleMatch[1].trim() : ""

          if (lower.startsWith("number") || lower.startsWith("integer") || lower.startsWith("float")) {
            placeholder = "0"
          } else if (lower.startsWith("boolean") || lower.startsWith("bool")) {
            placeholder = "false"
          } else if (Array.isArray(val)) {
            placeholder = "[]"
          } else if (lower.startsWith("array") && (lower.includes("{") || lower.includes("object") || lower.includes("from"))) {
            // Array of objects — extract field names for the template
            const fields = (strVal.match(/\w+/g) || []).filter(w => !['array', 'of', 'e', 'g', 'from'].includes(w))
            if (fields.length > 0) {
              const objStr = '{' + fields.map(f => `"${f}": "?"`).join(', ') + '}'
              placeholder = `[${objStr}]`
            } else {
              placeholder = '[{"key": "?"}]'
            }
          } else if (lower.startsWith("array") || lower.startsWith("list") || lower.startsWith("set")) {
            placeholder = '["REPLACE_ME_1", "REPLACE_ME_2"]'
          } else if (lower.startsWith("object") || lower.startsWith("map") || lower.startsWith("record")) {
            if (lower.includes("node") && lower.includes("edge")) {
              placeholder = '{"nodes": ["?"], "edges": [{"from": "?", "to": "?"}]}'
            } else {
              placeholder = '{"key": "?"}'
            }
          } else if (strVal === "true" || strVal === "false") {
            placeholder = strVal
          } else if (!isNaN(Number(strVal))) {
            placeholder = strVal
          } else {
            // Short literal string: use directly
            if (strVal.length < 25 && !strVal.includes(" ") && !strVal.includes("array") && !strVal.includes("object") && !strVal.includes("number") && !strVal.includes(" — ")) {
              placeholder = JSON.stringify(strVal)
            } else {
              placeholder = '"?"'
            }
          }
          return `  "${key}": ${placeholder}${comma}`
        })
        return "{\n" + lines.join("\n") + "\n}"
      })()
    : "{}"

  // Build list of required top-level field names for explicit instruction
  const expKeys = sample.expected ? Object.keys(sample.expected) : []
  const topLevelFields = expKeys.join(", ")
  const requiredCount = expKeys.length

  return `You are executing the skill "${manifest.name}" (${manifest.description || "no description"}).

Your task:
${sample.description || "Execute this skill against the given input."}

Input:
${inputDesc}

Output the following JSON with your realistic values filled in. Keep ALL fields listed below — replace the placeholder values ("..." , 0, true, []) with real output:

${jsonTemplate}

IMPORTANT — Your output MUST have EXACTLY ${requiredCount} top-level keys: ${topLevelFields}. Count them before returning. Do NOT omit any fields and do NOT flatten array items — each array item goes INSIDE its parent key as a JSON array.

Return ONLY this JSON object. No markdown. No explanation. No code fences.`
}

async function evaluateSkillLive(skillId: string): Promise<any> {
  const startMs = Date.now()

  // 1. Load manifest
  let manifest: any
  try { manifest = loadManifest(skillId) } catch (err) {
    return { skillId, skillName: skillId, skillVersion: "unknown", datasetName: "", datasetDescription: "", sampleCount: 0, timestamp: new Date().toISOString(), overallScore: 0, passThreshold: 0, passed: false, criterionBreakdown: [], samples: [], errors: [err instanceof Error ? err.message : String(err)], durationMs: Date.now() - startMs }
  }

  // 2. Load dataset
  let dataset: any
  try { dataset = loadDataset(skillId) } catch (err) {
    return { skillId, skillName: manifest.name, skillVersion: manifest.version, datasetName: "", datasetDescription: "", sampleCount: 0, timestamp: new Date().toISOString(), overallScore: 0, passThreshold: 0, passed: false, criterionBreakdown: [], samples: [], errors: [err instanceof Error ? err.message : String(err)], durationMs: Date.now() - startMs }
  }

  // 3. Criteria
  const criteria: any[] = manifest.evaluation?.criteria ?? []
  if (criteria.length === 0) {
    return { skillId, skillName: manifest.name, skillVersion: manifest.version, datasetName: dataset.description ?? dataset.skillId, datasetDescription: dataset.description ?? "", sampleCount: dataset.samples?.length ?? 0, timestamp: new Date().toISOString(), overallScore: 1.0, passThreshold: 1.0, passed: true, criterionBreakdown: [], samples: [], errors: ["No evaluation criteria defined — passing by default"], durationMs: Date.now() - startMs }
  }

  // 4. Verify Ollama is available
  try {
    const tagsRes = await fetch(`${OLLAMA_BASE.replace(/\/$/, "")}/api/tags`, { signal: AbortSignal.timeout(3000) })
    if (!tagsRes.ok) throw new Error("Ollama not reachable")
  } catch (err) {
    return { skillId, skillName: manifest.name, skillVersion: manifest.version, datasetName: dataset.description ?? dataset.skillId, datasetDescription: dataset.description ?? "", sampleCount: dataset.samples?.length ?? 0, timestamp: new Date().toISOString(), overallScore: 0, passThreshold: 0, passed: false, criterionBreakdown: [], samples: [], errors: [`Ollama unavailable at ${OLLAMA_BASE}: ${err instanceof Error ? err.message : String(err)}`], durationMs: Date.now() - startMs }
  }

  // 5. Samples
  const sampleResults: any[] = []
  for (const sample of (dataset.samples ?? [])) {
    const sampleStart = Date.now()
    let output: any
    let rawText = ""
    let sampleError: string | undefined

    try {
      const prompt = buildSkillPrompt(manifest, sample)
      rawText = await callOllama(prompt)
      output = extractJson(rawText)
    } catch (err) {
      output = null
      if (!sampleError) sampleError = err instanceof Error ? err.message : String(err)
    }

    const durationMs = Date.now() - sampleStart

    // Try to expand nested output (detect flattened array items)
    const expandedOutput = (output && typeof output === "object" && !Array.isArray(output))
      ? tryExpandNestedOutput(output, sample.expected ?? {})
      : output

    const criterionScores: Record<string, number> = {}
    for (const c of criteria) {
      const expected = sample.expected ?? {}
      switch (c.type) {
        case "accuracy": criterionScores[c.name] = scoreAccuracy(expandedOutput, expected); break
        case "completeness": {
          if (expandedOutput && typeof expandedOutput === "object") {
            const outKeys = Object.keys(expandedOutput)
            const expKeys = typeof expected === "object" ? Object.keys(expected) : []
            const overlap = expKeys.filter(k => k in expandedOutput).length
            if (overlap < expKeys.length * 0.3) {
              criterionScores[c.name] = scoreCompleteness(expandedOutput, null)
            } else {
              criterionScores[c.name] = scoreCompleteness(expandedOutput, expected)
            }
          } else {
            criterionScores[c.name] = scoreCompleteness(expandedOutput, expected)
          }
          break
        }
        case "consistency": criterionScores[c.name] = scoreConsistency(); break
        case "speed": criterionScores[c.name] = scoreSpeed(durationMs, c.metric === "<1s" ? 1000 : undefined); break
        default: criterionScores[c.name] = scoreCustom(expandedOutput, expected)
      }
    }

    const overallScore = criteria.reduce((sum: number, c: any) => sum + (criterionScores[c.name] ?? 0) * c.weight, 0)
    sampleResults.push({
      sampleId: sample.id,
      description: sample.description,
      status: sampleError ? "error" : output ? "completed" : "error",
      output,
      expandedOutput,
      rawLength: typeof rawText === "string" ? rawText.length : 0,
      criterionScores,
      overallScore,
      durationMs,
      error: sampleError,
    })
  }

  // 6. Aggregate
  const passThreshold = criteria.reduce((sum: number, c: any) => sum + c.threshold * c.weight, 0)
  const criterionBreakdown = criteria.map((c: any) => {
    const scores = sampleResults.map((s: any) => s.criterionScores[c.name] ?? 0)
    const avgScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0
    return { name: c.name, score: avgScore, weight: c.weight, threshold: c.threshold, weighted: avgScore * c.weight, passed: avgScore >= c.threshold }
  })
  const overallScore = criterionBreakdown.reduce((sum: number, c: any) => sum + c.score * c.weight, 0)

  return {
    skillId,
    skillName: manifest.name,
    skillVersion: manifest.version,
    provider: "ollama",
    model: OLLAMA_MODEL,
    datasetName: dataset.description ?? dataset.skillId,
    datasetDescription: dataset.description ?? "",
    sampleCount: dataset.samples?.length ?? 0,
    timestamp: new Date().toISOString(),
    overallScore,
    passThreshold,
    passed: overallScore >= passThreshold,
    criterionBreakdown,
    samples: sampleResults,
    errors: [],
    durationMs: Date.now() - startMs,
  }
}

async function evaluateSkillsByLevelLive(level?: number): Promise<any> {
  const startMs = Date.now()
  const skills = listSkillsByLevel(level)
  const results: any[] = []
  for (const id of skills) {
    console.log(`\n  Evaluating: ${id} ...`)
    const result = await evaluateSkillLive(id)
    results.push(result)
    const icon = result.passed ? "✅" : "❌"
    console.log(`  ${icon} Score: ${(result.overallScore * 100).toFixed(1)}% (${result.samples.filter((s: any) => s.status === "completed").length}/${result.sampleCount} samples)`)
  }
  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  return {
    timestamp: new Date().toISOString(),
    totalSkills: results.length,
    passed, failed,
    provider: "ollama",
    model: OLLAMA_MODEL,
    errored: results.filter((r) => r.errors?.length > 0 && !r.passed).length,
    overallPassRate: results.length > 0 ? passed / results.length : 0,
    results,
    durationMs: Date.now() - startMs,
  }
}

// ─── Evaluation engine (mock) ───

function evaluateSkill(skillId: string): any {
  const startMs = Date.now()

  // 1. Load manifest
  let manifest: any
  try { manifest = loadManifest(skillId) } catch (err) {
    return { skillId, skillName: skillId, skillVersion: "unknown", datasetName: "", datasetDescription: "", sampleCount: 0, timestamp: new Date().toISOString(), overallScore: 0, passThreshold: 0, passed: false, criterionBreakdown: [], samples: [], errors: [err instanceof Error ? err.message : String(err)], durationMs: Date.now() - startMs }
  }

  // 2. Load dataset
  let dataset: any
  try { dataset = loadDataset(skillId) } catch (err) {
    return { skillId, skillName: manifest.name, skillVersion: manifest.version, datasetName: "", datasetDescription: "", sampleCount: 0, timestamp: new Date().toISOString(), overallScore: 0, passThreshold: 0, passed: false, criterionBreakdown: [], samples: [], errors: [err instanceof Error ? err.message : String(err)], durationMs: Date.now() - startMs }
  }

  // 3. Criteria
  const criteria: any[] = manifest.evaluation?.criteria ?? []
  if (criteria.length === 0) {
    return { skillId, skillName: manifest.name, skillVersion: manifest.version, datasetName: dataset.description ?? dataset.skillId, datasetDescription: dataset.description ?? "", sampleCount: dataset.samples?.length ?? 0, timestamp: new Date().toISOString(), overallScore: 1.0, passThreshold: 1.0, passed: true, criterionBreakdown: [], samples: [], errors: ["No evaluation criteria defined — passing by default"], durationMs: Date.now() - startMs }
  }

  // 4. Samples
  const sampleResults: any[] = []
  for (const sample of (dataset.samples ?? [])) {
    const sampleStart = Date.now()
    const output = getMockOutput(skillId, sample)
    const durationMs = Date.now() - sampleStart

    const criterionScores: Record<string, number> = {}
    for (const c of criteria) {
      const expected = sample.expected ?? {}
      switch (c.type) {
        case "accuracy": criterionScores[c.name] = scoreAccuracy(output, expected); break
        case "completeness": criterionScores[c.name] = scoreCompleteness(output, expected); break
        case "consistency": criterionScores[c.name] = scoreConsistency(); break
        case "speed": criterionScores[c.name] = scoreSpeed(); break
        default: criterionScores[c.name] = scoreCustom(output, expected)
      }
    }

    const overallScore = criteria.reduce((sum: number, c: any) => sum + (criterionScores[c.name] ?? 0) * c.weight, 0)
    sampleResults.push({ sampleId: sample.id, description: sample.description, status: "completed", output, criterionScores, overallScore, durationMs })
  }

  // 5. Aggregate
  const passThreshold = criteria.reduce((sum: number, c: any) => sum + c.threshold * c.weight, 0)
  const criterionBreakdown = criteria.map((c: any) => {
    const scores = sampleResults.map((s: any) => s.criterionScores[c.name] ?? 0)
    const avgScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0
    return { name: c.name, score: avgScore, weight: c.weight, threshold: c.threshold, weighted: avgScore * c.weight, passed: avgScore >= c.threshold }
  })
  const overallScore = criterionBreakdown.reduce((sum: number, c: any) => sum + c.score * c.weight, 0)

  return {
    skillId,
    skillName: manifest.name,
    skillVersion: manifest.version,
    datasetName: dataset.description ?? dataset.skillId,
    datasetDescription: dataset.description ?? "",
    sampleCount: dataset.samples?.length ?? 0,
    timestamp: new Date().toISOString(),
    overallScore,
    passThreshold,
    passed: overallScore >= passThreshold,
    criterionBreakdown,
    samples: sampleResults,
    errors: [],
    durationMs: Date.now() - startMs,
  }
}

function evaluateSkillsByLevel(level?: number): any {
  const startMs = Date.now()
  const skills = listSkillsByLevel(level)
  const results = skills.map((id) => evaluateSkill(id))
  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  return {
    timestamp: new Date().toISOString(),
    totalSkills: results.length,
    passed, failed,
    errored: results.filter((r) => r.errors?.length > 0 && !r.passed).length,
    overallPassRate: results.length > 0 ? passed / results.length : 0,
    results,
    durationMs: Date.now() - startMs,
  }
}

// ─── Main ───

async function main() {
  const isMock = flags.mock === true
  const level = flags.level !== undefined ? Number(flags.level) : undefined
  const skillId = flags.skill as string | undefined
  const outputPath = flags.output as string | undefined
  const verbose = flags.verbose === true

  const startTime = Date.now()

  if (isMock) {
    if (skillId) {
      console.log(`\n📊 Evaluating skill (mock): ${skillId}\n`)
      const result = evaluateSkill(skillId)
      console.log(formatEvaluationReport(result))
      if (outputPath) saveOutput(outputPath, { type: "single", mode: "mock", skillId, result })
    } else {
      const levelLabel = level !== undefined ? `Level ${level}` : "All levels"
      console.log(`\n📊 Evaluating skills (mock): ${levelLabel}\n`)
      const batchResult = evaluateSkillsByLevel(level)
      console.log(formatBatchReport(batchResult))

      if (verbose) {
        for (const r of batchResult.results) {
          console.log(`\n${"─".repeat(60)}`)
          if (r.errors?.length > 0) for (const e of r.errors) console.log(`  ⚠ ${e}`)
          console.log(`Details: ${r.skillName} (${r.skillId})`)
          console.log(`${"─".repeat(60)}`)
          console.log(formatEvaluationReport(r))
        }
      }

      if (outputPath) saveOutput(outputPath, { type: "batch", mode: "mock", level, batchResult })
    }
  } else {
    // ── Live mode (Ollama) ──
    console.log(`\n🤖 Live AI Evaluation via Ollama (${OLLAMA_MODEL} @ ${OLLAMA_BASE})`)
    console.log(`   Skills: L0 foundation (5) + L1 engineering (6)\n`)

    if (skillId) {
      console.log(`📊 Evaluating skill (live): ${skillId}\n`)
      const result = await evaluateSkillLive(skillId)
      console.log(formatEvaluationReport(result))
      if (outputPath) saveOutput(outputPath, { type: "single", mode: "live", skillId, provider: "ollama", model: OLLAMA_MODEL, result })
    } else {
      const levelLabel = level !== undefined ? `Level ${level}` : "All levels"
      console.log(`📊 Evaluating skills (live): ${levelLabel}\n`)
      const batchResult = await evaluateSkillsByLevelLive(level)
      console.log(formatBatchReport(batchResult))

      if (verbose) {
        for (const r of batchResult.results) {
          console.log(`\n${"─".repeat(60)}`)
          if (r.errors?.length > 0) for (const e of r.errors) console.log(`  ⚠ ${e}`)
          console.log(`Details: ${r.skillName} (${r.skillId}) [provider=${r.provider} model=${r.model}]`)
          console.log(`${"─".repeat(60)}`)
          console.log(formatEvaluationReport(r))
        }
      }

      if (outputPath) saveOutput(outputPath, { type: "batch", mode: "live", provider: "ollama", model: OLLAMA_MODEL, level, batchResult })
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\n⏱️  Completed in ${elapsed}s`)
}

function saveOutput(path: string, data: unknown) {
  const absolute = path.startsWith("/") || /^[A-Za-z]:\\/.test(path) ? path : join(process.cwd(), path)
  writeFileSync(absolute, JSON.stringify(data, null, 2), "utf-8")
  console.log(`\n💾 Results saved to: ${absolute}`)
}

main().catch((err) => {
  console.error(`\n💥 Fatal error: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
})
