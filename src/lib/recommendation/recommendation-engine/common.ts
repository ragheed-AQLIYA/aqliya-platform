import type { RiskLevel } from "@prisma/client"
import type { ScenarioScores } from "../recommendation-types"
import { RecommendationOutcome } from "../recommendation-types"

export function determineOutcome(overallScore: number, riskLevel: RiskLevel, hasMissingInputs: boolean): RecommendationOutcome {
  if (hasMissingInputs) return RecommendationOutcome.NEEDS_MORE_DATA
  if (overallScore >= 75) return RecommendationOutcome.GO
  if (overallScore >= 55) return RecommendationOutcome.GO_WITH_CONDITIONS
  if (overallScore >= 40) return RecommendationOutcome.DEFER
  return RecommendationOutcome.NO_GO
}

export function confidenceFromScores(scenarios: ScenarioScores[]): number {
  const expected = scenarios.find((s) => s.scenarioType === "EXPECTED_CASE")
  const best = scenarios.find((s) => s.scenarioType === "BEST_CASE")
  const worst = scenarios.find((s) => s.scenarioType === "WORST_CASE")
  if (!expected || !best || !worst) return 50
  const variance = best.overallDecisionScore - worst.overallDecisionScore
  const baseConfidence = Math.max(0, Math.min(100, expected.overallDecisionScore))
  const variancePenalty = Math.max(0, (variance - 20) * 1.5)
  return Math.round(Math.max(0, baseConfidence - variancePenalty))
}

export function riskLevelScore(riskLevel: RiskLevel): number {
  return riskLevel === "LOW" ? 85 : riskLevel === "MEDIUM" ? 60 : 35
}

export function nextActionsForOutcome(outcome: RecommendationOutcome, riskLevel: RiskLevel): string[] {
  const actions: string[] = []
  switch (outcome) {
    case RecommendationOutcome.GO:
      actions.push("Proceed with execution plan")
      actions.push("Assign resources and set milestones")
      if (riskLevel === "MEDIUM" || riskLevel === "HIGH") actions.push("Activate risk monitoring plan")
      break
    case RecommendationOutcome.GO_WITH_CONDITIONS:
      actions.push("Address identified conditions before proceeding")
      actions.push("Document mitigation strategies for key risks")
      actions.push("Re-evaluate after conditions are met")
      break
    case RecommendationOutcome.DEFER:
      actions.push("Defer decision until conditions improve")
      actions.push("Monitor key indicators for re-evaluation trigger")
      actions.push("Reallocate resources to higher-value opportunities")
      break
    case RecommendationOutcome.NO_GO:
      actions.push("Do not proceed at this time")
      actions.push("Document lessons learned")
      actions.push("Reallocate resources to alternative opportunities")
      break
    case RecommendationOutcome.NEEDS_MORE_DATA:
      actions.push("Complete missing information before re-evaluation")
      actions.push("Consult domain experts for critical gaps")
      break
  }
  return actions
}
