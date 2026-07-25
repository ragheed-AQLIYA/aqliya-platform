import type { RecommendationInput, RecommendationResult, RecommendationPrerequisites, RecommendationAdapter } from "../recommendation-types"
import { RecommendationOutcome } from "../recommendation-types"
import { determineOutcome, confidenceFromScores, nextActionsForOutcome } from "./common"

export const genericAdapter: RecommendationAdapter = {
  name: "Generic Recommendation",
  description: "Weighted fallback recommendation for any decision type",
  prerequisites: (input: RecommendationInput): RecommendationPrerequisites => {
    const missing: string[] = []
    if (input.scenarioScores.length === 0) missing.push("Simulation results required")
    return {
      canRun: missing.length === 0,
      missingInputs: missing,
      recommendedNextStep: missing.length > 0 ? "Run simulation first" : "Recommendation ready to generate",
    }
  },
  generate: (input: RecommendationInput): RecommendationResult => {
    const expectedCase = input.scenarioScores.find((s) => s.scenarioType === "EXPECTED_CASE")
    const overallScore = expectedCase?.overallDecisionScore ?? 0
    const hasMissingInputs = (input.missingInputs?.length ?? 0) > 0
    const outcome = determineOutcome(overallScore, input.riskLevel, hasMissingInputs)
    const confidence = confidenceFromScores(input.scenarioScores)

    let rationale = `Decision analysis yields overall score of ${overallScore}/100. `
    rationale += `Risk level: ${input.riskLevel}, Strategic fit: ${input.strategicFitScore}/100. `
    if (overallScore >= 75) rationale += "Strong overall performance across all dimensions supports proceeding. "
    else if (overallScore >= 55) rationale += "Moderate performance with some areas requiring attention before proceeding. "
    else rationale += "Below-threshold performance indicates significant concerns. "

    let expectedNextState = ""
    if (outcome === RecommendationOutcome.GO) expectedNextState = "Decision approved and execution initiated"
    else if (outcome === RecommendationOutcome.GO_WITH_CONDITIONS) expectedNextState = "Decision approved with conditions to be addressed before full execution"
    else if (outcome === RecommendationOutcome.DEFER) expectedNextState = "Decision deferred pending improved conditions"
    else if (outcome === RecommendationOutcome.NO_GO) expectedNextState = "Decision not to proceed, resources reallocated"
    else expectedNextState = "Decision pending, additional data required"

    return {
      outcome,
      confidence,
      recommendedAction: `${outcome} — Decision ${outcome === RecommendationOutcome.GO ? "approved" : outcome === RecommendationOutcome.NO_GO ? "rejected" : outcome === RecommendationOutcome.DEFER ? "deferred" : outcome === RecommendationOutcome.NEEDS_MORE_DATA ? "pending data" : "approved with conditions"}`,
      rationale,
      expectedNextState,
      scopeExclusions: "Scope limited to current decision context. Related decisions require separate evaluation.",
      assumptionsUsed: `Risk level: ${input.riskLevel}. Strategic fit: ${input.strategicFitScore}/100. Based on available simulation data.`,
      risksAccepted: input.riskLevel === "HIGH" ? "High risks accepted with active monitoring and mitigation plan." : input.riskLevel === "MEDIUM" ? "Moderate risks accepted with standard controls." : "Low risk profile. Standard monitoring sufficient.",
      risksRejected: "Uncertainties in external factors not fully captured. Ongoing monitoring recommended.",
      humanReviewRequired: outcome !== RecommendationOutcome.GO,
      nextActions: nextActionsForOutcome(outcome, input.riskLevel),
    }
  },
}
