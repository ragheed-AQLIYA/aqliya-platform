import type { CriterionConfig } from "../evaluator-types"
import { maybeParseJson } from "./common"

export function scoreSample(
  actual: unknown,
  expected: unknown,
  criteria: CriterionConfig[],
  durationMs: number,
): Record<string, number> {
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
        scores[criterion.name] = 1.0
        break
      case "speed":
        scores[criterion.name] = scoreSpeed(durationMs, criterion.threshold)
        break
      case "custom":
        scores[criterion.name] = scoreCustom(actual, expected, criterion)
        break
      default:
        scores[criterion.name] = 0.5
    }
  }

  return scores
}

export function scoreAccuracy(actual: unknown, expected: unknown): number {
  if (actual === null || actual === undefined) return 0
  if (expected === null || expected === undefined) return actual ? 0.5 : 1.0

  if (typeof actual === "object" && typeof expected === "object" && !Array.isArray(actual) && !Array.isArray(expected)) {
    return scoreObjectAccuracy(actual as Record<string, unknown>, expected as Record<string, unknown>)
  }

  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (expected.length === 0) return 1.0
    if (actual.length === 0) return 0.3
    return Math.min(1.0, actual.length / expected.length)
  }

  if (typeof actual === "string" && typeof expected === "string") {
    if (expected === "") return 1.0
    const expectedPhrases = expected.toLowerCase().split(/[.\n]/).filter(Boolean)
    const actualLower = actual.toLowerCase()
    const matched = expectedPhrases.filter((p) => actualLower.includes(p.trim()))
    return expectedPhrases.length > 0 ? matched.length / expectedPhrases.length : 1.0
  }

  if (typeof actual === typeof expected) {
    return actual === expected ? 1.0 : 0.5
  }

  return 0.5
}

export function scoreObjectAccuracy(actual: Record<string, unknown>, expected: Record<string, unknown>): number {
  const expectedKeys = Object.keys(expected)
  if (expectedKeys.length === 0) return 1.0

  const presentKeys = expectedKeys.filter((k) => k in actual)
  const presenceScore = presentKeys.length / expectedKeys.length

  let typeMatchCount = 0
  for (const key of presentKeys) {
    const actualVal = actual[key]
    const expectedVal = expected[key]
    if (typeof actualVal === typeof expectedVal) {
      typeMatchCount++
    } else if (actualVal !== null && expectedVal !== null) {
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

export function scoreCompleteness(actual: unknown, expected: unknown): number {
  if (actual === null || actual === undefined) return 0

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

  if (typeof actual === "string" && typeof expected === "string") {
    if (expected.length === 0) return 1.0
    return Math.min(1.0, actual.length / Math.max(expected.length, 1))
  }

  if (Array.isArray(actual)) {
    if (Array.isArray(expected) && expected.length === 0) return 1.0
    if (!Array.isArray(expected)) {
      return actual.length > 0 ? 0.8 : 0.0
    }
    return Math.min(1.0, actual.length / Math.max(expected.length, 1))
  }

  return actual ? 0.8 : 0.0
}

export function scoreSpeed(durationMs: number, _threshold?: number): number {
  const seconds = durationMs / 1000
  if (seconds < 1) return 1.0
  if (seconds < 5) return 0.9
  if (seconds < 15) return 0.7
  if (seconds < 30) return 0.5
  if (seconds < 60) return 0.3
  return 0.1
}

export function scoreCustom(actual: unknown, expected: unknown, criterion: CriterionConfig): number {
  const metric = criterion.metric ?? ""

  if (metric === "module-classification-accuracy" && typeof actual === "object") {
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

  if (typeof actual === "object" && actual !== null) {
    const keys = Object.keys(actual as Record<string, unknown>)
    return keys.length > 0 ? Math.min(1.0, keys.length / 5) : 0.2
  }
  if (typeof actual === "string") {
    return actual.length > 100 ? 0.8 : actual.length > 20 ? 0.5 : 0.2
  }
  return 0.3
}
