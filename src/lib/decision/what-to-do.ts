import { evaluateDecisionIntake } from "./intake"
import { evaluateDecisionFramework } from "./framework"
import { evaluateDecisionScenarios } from "./scenarios"
import { evaluateDecisionRiskAnalysis } from "./risk-analysis"
import { evaluateDecisionRecommendation } from "./recommendation"

export interface WhatToDoNowOutput {
  immediateAction: string
  nextSteps: string[]
  blockers: string[]
  priority: "INFO" | "LOW" | "MEDIUM" | "HIGH"
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateWhatToDoNow(decision: any): WhatToDoNowOutput {
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
  const recommendationState = evaluateDecisionRecommendation(decision.recommendation)

  const blockers: string[] = []
  const nextSteps: string[] = []

  // Check each stage
  if (intake.status !== "accepted") {
    blockers.push("Intake not accepted")
    nextSteps.push("Complete and accept the decision intake")
  }

  if (!frameworkState.isComplete) {
    blockers.push("Framework incomplete")
    nextSteps.push("Complete all framework fields (context, purpose, options, criteria, values)")
  }

  if (!scenarioState.isComplete) {
    blockers.push("Scenarios incomplete")
    nextSteps.push("Define at least 3 complete scenarios")
  }

  if (!riskAnalysisState.isComplete) {
    blockers.push("Risk analysis incomplete")
    nextSteps.push("Complete risk and trade-off analysis for all scenarios")
  }

  if (!recommendationState.isComplete) {
    blockers.push("Recommendation incomplete")
    nextSteps.push("Complete the recommendation with all required fields")
  }

  // Determine immediate action
  let immediateAction = ""
  let priority: "INFO" | "LOW" | "MEDIUM" | "HIGH" = "INFO"

  if (blockers.length === 0 && decision.recommendation) {
    immediateAction = `Review and execute: ${decision.recommendation.recommendedAction}`
    priority = "LOW"
  } else if (intake.status !== "accepted") {
    immediateAction = "Complete decision intake first"
    priority = "HIGH"
  } else if (!frameworkState.isComplete) {
    immediateAction = "Complete decision framework"
    priority = "HIGH"
  } else if (!scenarioState.isComplete) {
    immediateAction = "Define and complete scenarios"
    priority = "MEDIUM"
  } else if (!riskAnalysisState.isComplete) {
    immediateAction = "Complete risk analysis for all scenarios"
    priority = "MEDIUM"
  } else {
    immediateAction = "Complete the recommendation"
    priority = "LOW"
  }

  return { immediateAction, nextSteps, blockers, priority }
}
