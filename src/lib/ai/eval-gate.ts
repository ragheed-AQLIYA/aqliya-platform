import "server-only"
import { runSuite, reportRequiresAttention } from "@/lib/ai/eval/eval-runner"
import { getSuiteById } from "@/lib/ai/eval/suites"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"

export interface EvalGateResult {
  passed: boolean
  gate: string
  suiteId: string
  taskType: string
  score: number
  threshold: number
  requiresAttention: boolean
  failureCount: number
  totalTests: number
  details: { testCaseId: string; passed: boolean; expected: string; actual: string }[]
  auditId?: string
}

const GATE_THRESHOLDS: Record<string, number> = {
  "fin-analysis-v1": 0.67,
  "disclosure-notes-v1": 1.0,
  "finding-summary-v1": 1.0,
}

export async function evaluateWithGate(
  suiteId: string,
  taskType: string,
  actualOutput: string,
  organizationId?: string,
): Promise<EvalGateResult> {
  const suite = getSuiteById(suiteId)
  if (!suite) {
    return {
      passed: true,
      gate: "eval_gate",
      suiteId,
      taskType,
      score: 1,
      threshold: 0,
      requiresAttention: false,
      failureCount: 0,
      totalTests: 0,
      details: [],
    }
  }

  const actualOutputs = new Map<string, string>()
  for (const tc of suite.testCases) {
    actualOutputs.set(tc.id, actualOutput)
  }

  const report = runSuite(suite, actualOutputs)
  const threshold = GATE_THRESHOLDS[suiteId] ?? 0.67
  const score = report.totalTests > 0 ? report.passed / report.totalTests : 1
  const requiresAttention = reportRequiresAttention(report)
  const passed = score >= threshold && !requiresAttention

  const details = report.results.map(r => ({
    testCaseId: r.testCaseId,
    passed: r.passed,
    expected: r.expected.slice(0, 200),
    actual: r.actual.slice(0, 200),
  }))

  const auditResult = await writePlatformAuditLog({
    productKey: "ai_core",
    action: "eval_gate_check",
    severity: passed ? "info" : "warning",
    status: passed ? "recorded" : "pending",
    metadata: {
      suiteId,
      taskType,
      score,
      threshold,
      passed,
      requiresAttention,
      totalTests: report.totalTests,
      passedTests: report.passed,
      failedTests: report.failed,
    },
  }).catch(() => ({ ok: false, id: undefined }))

  return {
    passed,
    gate: "eval_gate",
    suiteId,
    taskType,
    score: Math.round(score * 100) / 100,
    threshold,
    requiresAttention,
    failureCount: report.failed,
    totalTests: report.totalTests,
    details,
    auditId: auditResult?.ok ? auditResult.id : undefined,
  }
}

export function getGateThreshold(suiteId: string): number {
  return GATE_THRESHOLDS[suiteId] ?? 0.67
}

export function registerGateThreshold(suiteId: string, threshold: number): void {
  if (threshold < 0 || threshold > 1) throw new Error(`Invalid threshold: ${threshold}. Must be between 0 and 1.`)
  GATE_THRESHOLDS[suiteId] = threshold
}
