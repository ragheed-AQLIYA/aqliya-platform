import { evaluateDecisionIntake } from "./intake"
import { evaluateDecisionFramework } from "./framework"
import { evaluateDecisionScenarios } from "./scenarios"
import { evaluateDecisionRiskAnalysis } from "./risk-analysis"
import { evaluateDecisionRecommendation } from "./recommendation"

export interface StrategicInsightOutput {
  summary: string
  keyFactors: string[]
  confidence: number
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH"
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateStrategicInsight(decision: any): StrategicInsightOutput {
  const intake = evaluateDecisionIntake({
    title: decision.title,
    objectives: decision.objectives,
    alternatives: decision.alternatives,
    risks: decision.risks,
  })

  const frameworkState = evaluateDecisionFramework(decision.framework)
  const scenarioState = evaluateDecisionScenarios(decision.decisionScenarios)
  const riskAnalysisState = evaluateDecisionRiskAnalysis(
    decision.decisionScenarios,
    decision.riskAnalyses
  )
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const recommendationState = evaluateDecisionRecommendation(decision.recommendation)

  // Compute confidence based on A-1 completeness
  let confidence = 0
  if (intake.status === "accepted") confidence += 25
  if (frameworkState.isComplete) confidence += 25
  if (scenarioState.isComplete) confidence += 25
  if (riskAnalysisState.isComplete) confidence += 25

  // Determine severity
  let severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" = "INFO"
  if (confidence >= 90) severity = "LOW"
  if (confidence >= 75) severity = "MEDIUM"
  if (confidence >= 50) severity = "HIGH"

  // Generate summary (2-3 sentences)
  let summary = ""
  if (confidence >= 75) {
    summary = `Decision "${decision.title}" is well-structured with ${confidence}% completeness across all A-1 stages. `
    summary += `The recommendation "${decision.recommendation?.recommendedAction}" is supported by complete intake, framework, scenarios, and risk analysis.`
  } else {
    summary = `Decision "${decision.title}" has incomplete A-1 stages with ${confidence}% completeness. `
    summary += `Review the missing prerequisites before proceeding with the recommendation.`
  }

  // Key factors
  const keyFactors: string[] = []
  if (intake.status === "accepted") {
    keyFactors.push("Intake accepted with clear objectives and alternatives")
  } else {
    keyFactors.push("Intake not yet accepted - blocking downstream stages")
  }

  if (frameworkState.isComplete) {
    keyFactors.push("Framework complete with context, purpose, and criteria defined")
  } else {
    keyFactors.push("Framework incomplete - missing required fields")
  }

  if (scenarioState.isComplete) {
    keyFactors.push(`${decision.decisionScenarios?.length || 0} scenarios defined and complete`)
  } else {
    keyFactors.push("Scenarios incomplete - need ≥3 complete scenarios")
  }

  if (riskAnalysisState.isComplete) {
    keyFactors.push("Risk analysis complete for all scenarios")
  } else {
    keyFactors.push("Risk analysis incomplete - some scenarios missing analysis")
  }

  return { summary, keyFactors, confidence, severity }
}
