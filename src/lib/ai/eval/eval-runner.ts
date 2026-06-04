

import type { EvalSuite, EvalTestCase, EvalResult, EvalRunReport, EvalScoreFn } from "./eval-types"
import type { EvalSeverity } from "./eval-types"

const metricFns: Record<string, EvalScoreFn> = {
  exact_match: (expected: string, actual: string) => (expected.trim() === actual.trim() ? 1 : 0),
  contains: (expected: string, actual: string) => (actual.includes(expected) ? 1 : 0),
  regex: (expected: string, actual: string) => {
    try {
      return new RegExp(expected).test(actual) ? 1 : 0
    } catch {
      return 0
    }
  },
}

function scoreTestCase(testCase: EvalTestCase, actual: string): EvalResult {
  const start = performance.now()
  const fn = metricFns[testCase.metric]
  let passed = false
  let score = 0
  let error: string | undefined

  if (!fn) {
    error = `Unknown metric: ${testCase.metric}`
  } else {
    try {
      score = fn(testCase.expectedOutput, actual, testCase.metricConfig)
      passed = score >= 0.5
    } catch (e) {
      error = (e as Error).message
    }
  }

  return {
    testCaseId: testCase.id,
    taskType: testCase.taskType,
    passed,
    expected: testCase.expectedOutput,
    actual: actual.slice(0, 500),
    score,
    metric: testCase.metric,
    error,
    durationMs: Math.round(performance.now() - start),
  }
}

export function runSuite(suite: EvalSuite, actualOutputs: Map<string, string>): EvalRunReport {
  const start = performance.now()
  const results: EvalResult[] = []
  const failuresBySeverity: Record<EvalSeverity, number> = { critical: 0, high: 0, medium: 0, low: 0 }

  for (const testCase of suite.testCases) {
    const actual = actualOutputs.get(testCase.id) ?? ""
    const result = scoreTestCase(testCase, actual)
    results.push(result)

    if (!result.passed) {
      failuresBySeverity[testCase.severity] = (failuresBySeverity[testCase.severity] || 0) + 1
    }
  }

  const passed = results.filter((r) => r.passed).length
  return {
    suiteId: suite.id,
    suiteName: suite.name,
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passed,
    failed: results.length - passed,
    passRate: results.length > 0 ? Math.round((passed / results.length) * 10000) / 100 : 0,
    results,
    failuresBySeverity,
    durationMs: Math.round(performance.now() - start),
  }
}

export function reportHasCriticalFailures(report: EvalRunReport): boolean {
  return report.failuresBySeverity.critical > 0
}

export function reportHasHighFailures(report: EvalRunReport): boolean {
  return report.failuresBySeverity.high > 0
}

export function reportRequiresAttention(report: EvalRunReport): boolean {
  return reportHasCriticalFailures(report) || reportHasHighFailures(report)
}
