export type EvalMetric = "exact_match" | "contains" | "regex" | "llm_judge" | "custom"

export type EvalSeverity = "critical" | "high" | "medium" | "low"

export interface EvalTestCase {
  id: string
  taskType: string
  input: Record<string, unknown>
  expectedOutput: string
  metric: EvalMetric
  metricConfig?: Record<string, unknown>
  severity: EvalSeverity
  tags: string[]
}

export interface EvalResult {
  testCaseId: string
  taskType: string
  passed: boolean
  expected: string
  actual: string
  score: number
  metric: EvalMetric
  error?: string
  durationMs: number
}

export interface EvalSuite {
  id: string
  name: string
  taskType: string
  description: string
  testCases: EvalTestCase[]
}

export interface EvalRunReport {
  suiteId: string
  suiteName: string
  timestamp: string
  totalTests: number
  passed: number
  failed: number
  passRate: number
  results: EvalResult[]
  failuresBySeverity: Record<EvalSeverity, number>
  durationMs: number
}

export type EvalScoreFn = (expected: string, actual: string, config?: Record<string, unknown>) => number
