import type { RecommendationInput, RecommendationResult, RecommendationPrerequisites, RecommendationAdapter } from "../recommendation-types"
import { RecommendationOutcome } from "../recommendation-types"
import { determineOutcome, confidenceFromScores, nextActionsForOutcome } from "./common"

export const strategicAdapter: RecommendationAdapter = {
  name: "Strategic Recommendation",
  description: "Strategic alignment/optionality/risk logic",
  prerequisites: (input: RecommendationInput): RecommendationPrerequisites => {
    const missing: string[] = []
    if (input.scenarioScores.length === 0) missing.push("Simulation results required")
    if (!input.strategicFitScore && input.strategicFitScore !== 0) missing.push("Strategic fit score")
    return {
      canRun: missing.length === 0,
      missingInputs: missing,
      recommendedNextStep: missing.length > 0 ? "Complete strategic alignment assessment" : "Recommendation ready to generate",
    }
  },
  generate: (input: RecommendationInput): RecommendationResult => {
    const expectedCase = input.scenarioScores.find((s) => s.scenarioType === "EXPECTED_CASE")
    const overallScore = expectedCase?.overallDecisionScore ?? 0
    const strategicScore = expectedCase?.strategicFitScore ?? input.strategicFitScore
    const hasMissingInputs = (input.missingInputs?.length ?? 0) > 0
    const outcome = determineOutcome(overallScore, input.riskLevel, hasMissingInputs)
    const confidence = confidenceFromScores(input.scenarioScores)

    let rationale = `Strategic analysis yields overall score of ${overallScore}/100. `
    rationale += `Strategic alignment: ${strategicScore}/100. `
    if (strategicScore >= 75) rationale += "Strong alignment with organizational strategy and long-term objectives. "
    else if (strategicScore >= 55) rationale += "Moderate alignment with some strategic gaps to address. "
    else rationale += "Limited strategic alignment requires reconsideration of approach. "

    let expectedNextState = ""
    if (outcome === RecommendationOutcome.GO) expectedNextState = "Strategic initiative approved and integrated into organizational roadmap"
    else if (outcome === RecommendationOutcome.GO_WITH_CONDITIONS) expectedNextState = "Strategic initiative approved with alignment conditions and milestone reviews"
    else if (outcome === RecommendationOutcome.DEFER) expectedNextState = "Strategic initiative deferred pending strategic realignment or market changes"
    else if (outcome === RecommendationOutcome.NO_GO) expectedNextState = "Strategic initiative rejected as misaligned with current priorities"
    else expectedNextState = "Strategic assessment incomplete, additional analysis required"

    return {
      outcome,
      confidence,
      recommendedAction: `${outcome} — Strategic ${outcome === RecommendationOutcome.GO ? "initiative approved" : outcome === RecommendationOutcome.NO_GO ? "initiative rejected" : outcome === RecommendationOutcome.DEFER ? "initiative deferred" : outcome === RecommendationOutcome.NEEDS_MORE_DATA ? "assessment pending" : "initiative approved with conditions"}`,
      rationale,
      expectedNextState,
      scopeExclusions: "Does not include operational execution details or resource allocation. Separate planning required.",
      assumptionsUsed: `Risk level: ${input.riskLevel}. Strategic fit: ${strategicScore}/100. Based on current strategic plan and market positioning.`,
      risksAccepted: input.riskLevel === "HIGH" ? "Strategic risks accepted with active portfolio monitoring." : input.riskLevel === "MEDIUM" ? "Moderate strategic risks accepted with periodic review." : "Low strategic risk. Standard governance sufficient.",
      risksRejected: "Opportunity cost of alternative strategies not fully evaluated. Scenario planning recommended.",
      humanReviewRequired: outcome !== RecommendationOutcome.GO,
      nextActions: nextActionsForOutcome(outcome, input.riskLevel),
    }
  },
}
