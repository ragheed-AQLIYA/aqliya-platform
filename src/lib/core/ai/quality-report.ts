import "server-only"
import { calculateConfidence, type ConfidenceInput } from "./confidence-scorer"
import { evalGate, type EvalGateInput } from "./eval-gate"

export interface AiOutputReport {
  confidenceScore: number
  confidenceLevel: string
  evalPassed: boolean
  evalReasons: string[]
  evalWarnings: string[]
  recommendations: string[]
}

export async function generateAiQualityReport(
  content: string,
  options: {
    modelProvider?: string
    responseTimeMs: number
    sourceCount: number
    expectedMinLength: number
    requiredFields?: string[]
    requiredKeywords?: string[]
    forbiddenPatterns?: RegExp[]
  },
): Promise<AiOutputReport> {
  const recommendations: string[] = []

  const evalResult = await evalGate({
    content,
    minLength: options.expectedMinLength,
    requiredFields: options.requiredFields,
    requiredKeywords: options.requiredKeywords,
    forbiddenPatterns: options.forbiddenPatterns,
  })

  if (!evalResult.passed) {
    recommendations.push("AI output failed quality gate — review required")
  }

  const confidence = calculateConfidence({
    modelProvider: options.modelProvider,
    responseTimeMs: options.responseTimeMs,
    sourceCount: options.sourceCount,
    hasAllRequiredFields: evalResult.warnings.length === 0,
    responseLength: content.length,
    expectedMinLength: options.expectedMinLength,
  })

  if (confidence.score < 0.5) {
    recommendations.push("Low confidence — consider regenerating with more context")
  }
  if (options.sourceCount === 0) {
    recommendations.push("No source references — consider adding evidence links")
  }
  if (evalResult.warnings.length > 0) {
    recommendations.push("Eval warnings should be reviewed before using this output")
  }

  return {
    confidenceScore: confidence.score,
    confidenceLevel: confidence.level,
    evalPassed: evalResult.passed,
    evalReasons: evalResult.reasons,
    evalWarnings: evalResult.warnings,
    recommendations,
  }
}
