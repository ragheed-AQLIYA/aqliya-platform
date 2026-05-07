import { Prisma } from "@prisma/client"
import { evaluateDecisionIntake } from "./intake"
import { evaluateDecisionFramework } from "./framework"
import { evaluateDecisionScenarios } from "./scenarios"
import { evaluateDecisionRiskAnalysis } from "./risk-analysis"
import { evaluateDecisionRecommendation } from "./recommendation"

export interface ExecutiveOverviewOutput {
  executiveSummary: string
  strategicFit: string
  riskPosture: string
  recommendation: string
  decisionQuality: number
}

type DecisionWithRelations = Prisma.DecisionGetPayload<{
  include: {
    objectives: true
    alternatives: true
    risks: true
    framework: true
    decisionScenarios: {
      include: {
        riskAnalysis: true
      }
    }
    riskAnalyses: {
      include: {
        scenario: true
      }
    }
    recommendation: true
  }
}>

export function generateExecutiveOverview(decision: DecisionWithRelations): ExecutiveOverviewOutput {
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

  // Compute decision quality (0-100)
  let decisionQuality = 0
  if (intake.status === "accepted") decisionQuality += 20
  if (frameworkState.isComplete) decisionQuality += 20
  if (scenarioState.isComplete) decisionQuality += 20
  if (riskAnalysisState.isComplete) decisionQuality += 20
  if (recommendationState.isComplete) decisionQuality += 20

  // Executive summary (3-5 sentences)
  let executiveSummary = `Decision "${decision.title}" `
  if (decisionQuality >= 80) {
    executiveSummary += `is fully prepared with all A-1 stages complete (${decisionQuality}% quality score). `
  } else {
    executiveSummary += `has ${decisionQuality}% completeness across A-1 stages. `
  }
  if (decision.recommendation?.recommendedAction) {
    executiveSummary += `The recommended action is: ${decision.recommendation.recommendedAction}. `
  }
  if (decision.recommendation?.rationale) {
    executiveSummary += `Rationale: ${decision.recommendation.rationale.substring(0, 100)}...`
  }

  // Strategic fit
  let strategicFit = ""
  if (frameworkState.isComplete && decision.framework) {
    strategicFit = `Framework context: ${decision.framework.context?.substring(0, 150) || "Not defined"}. `
    strategicFit += `Strategic alignment: ${intake.status === "accepted" ? "Strong - intake accepted" : "Pending - intake not accepted"}.`
  } else {
    strategicFit = "Framework not complete - strategic fit cannot be assessed."
  }

  // Risk posture
  let riskPosture = ""
  if (riskAnalysisState.isComplete) {
    const scenarios = decision.decisionScenarios || []
    riskPosture = `Risk analysis complete for ${scenarios.length} scenarios. `
      const uncertaintyLevels = (decision.riskAnalyses || []).map((a: { uncertaintyLevel?: string }) => a.uncertaintyLevel).filter(Boolean)
    if (uncertaintyLevels.length > 0) {
      riskPosture += `Uncertainty levels: ${uncertaintyLevels.join(", ")}.`
    }
  } else {
    riskPosture = "Risk analysis incomplete - posture unknown."
  }

  // Recommendation
  let recommendationText = ""
  if (recommendationState.isComplete && decision.recommendation) {
    recommendationText = `Recommended: ${decision.recommendation.recommendedAction}. `
    recommendationText += `Expected next state: ${decision.recommendation.expectedNextState?.substring(0, 100) || ""}. `
    recommendationText += `Human review required: ${decision.recommendation.humanReviewRequired ? "Yes" : "No"}.`
  } else {
    recommendationText = "Recommendation not yet complete."
  }

  return { executiveSummary, strategicFit, riskPosture, recommendation: recommendationText, decisionQuality }
}
