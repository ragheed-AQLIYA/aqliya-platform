import "server-only"
import { runSuite, reportRequiresAttention } from "@/lib/core/ai/eval/eval-runner"
import { getSuiteById } from "@/lib/core/ai/eval/suites"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { calculateConfidence, type ConfidenceInput, type ConfidenceScore } from "@/lib/core/ai/confidence-scorer"

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
  _organizationId?: string,
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

// ── Backward compatibility exports ──
export async function runEvalGate(
  suiteId: string,
  taskType: string,
  actualOutput: string,
  organizationId?: string,
): Promise<EvalGateResult> {
  return evaluateWithGate(suiteId, taskType, actualOutput, organizationId);
}

export const AIEvalGate = {
  evaluate: runEvalGate,
};

// ── Content-based eval gate (complements suite-based evaluateWithGate) ──

export interface EvalGateInput {
  content: string
  minLength?: number
  requiredKeywords?: string[]
  forbiddenPatterns?: RegExp[]
  requiredFields?: string[]
}

export interface EvalGateResultContent {
  passed: boolean
  reasons: string[]
  warnings: string[]
}

export async function evalGate(input: EvalGateInput): Promise<EvalGateResultContent> {
  const reasons: string[] = []
  const warnings: string[] = []

  if (input.minLength && input.content.length < input.minLength) {
    reasons.push(`Content too short (${input.content.length} < ${input.minLength})`)
  }

  if (input.requiredKeywords) {
    const missingKeywords = input.requiredKeywords.filter(
      (kw) => !input.content.toLowerCase().includes(kw.toLowerCase()),
    )
    if (missingKeywords.length > 0) {
      warnings.push(`Missing keywords: ${missingKeywords.join(", ")}`)
    }
  }

  if (input.forbiddenPatterns) {
    for (const pattern of input.forbiddenPatterns) {
      if (pattern.test(input.content)) {
        warnings.push(`Contains forbidden pattern: ${pattern}`)
      }
    }
  }

  if (input.requiredFields) {
    for (const field of input.requiredFields) {
      const fieldPattern = new RegExp(`["']?${field}["']?\\s*[:]`, "i")
      if (!fieldPattern.test(input.content)) {
        warnings.push(`Missing required field: ${field}`)
      }
    }
  }

  return {
    passed: reasons.length === 0,
    reasons,
    warnings,
  }
}

// ── Confidence threshold checking ──

export interface ConfidenceGateInput extends ConfidenceInput {
  minConfidence?: number
}

export interface ConfidenceGateResult {
  passed: boolean
  confidence: ConfidenceScore
  minThreshold: number
}

export function checkConfidenceThreshold(input: ConfidenceGateInput): ConfidenceGateResult {
  const confidence = calculateConfidence(input)
  const minThreshold = input.minConfidence ?? 0.5

  return {
    passed: confidence.score >= minThreshold,
    confidence,
    minThreshold,
  }
}

export function suggestThresholdForModel(modelProvider: string | undefined): number {
  if (modelProvider?.includes("claude-4") || modelProvider?.includes("claude-opus")) return 0.6
  if (modelProvider?.includes("claude-sonnet") || modelProvider?.includes("gpt-4")) return 0.55
  if (modelProvider?.includes("gemini")) return 0.5
  return 0.45
}
