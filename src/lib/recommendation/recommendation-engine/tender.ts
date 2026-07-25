import type { RecommendationInput, RecommendationResult, RecommendationPrerequisites, RecommendationAdapter } from "../recommendation-types"
import { generateRecommendation as generateTenderRecommendation } from "../tender-recommendation"
import { determineOutcome, confidenceFromScores, nextActionsForOutcome } from "./common"

export const tenderAdapter: RecommendationAdapter = {
  name: "Tender Recommendation",
  description: "Uses existing tender recommendation logic",
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
    const tenderInput = {
      riskLevel: input.riskLevel,
      marginEstimate: 15,
    }
    const tenderResult = generateTenderRecommendation(input.scenarioScores as Parameters<typeof generateTenderRecommendation>[0], tenderInput)
    const expectedCase = input.scenarioScores.find((s) => s.scenarioType === "EXPECTED_CASE")
    const overallScore = expectedCase?.overallDecisionScore ?? 0
    const outcome = determineOutcome(overallScore, input.riskLevel, false)

    return {
      outcome,
      confidence: confidenceFromScores(input.scenarioScores),
      recommendedAction: tenderResult.recommendedAction,
      rationale: tenderResult.rationale,
      expectedNextState: tenderResult.expectedNextState,
      scopeExclusions: tenderResult.scopeExclusions,
      assumptionsUsed: tenderResult.assumptionsUsed,
      risksAccepted: tenderResult.risksAccepted,
      risksRejected: tenderResult.risksRejected,
      humanReviewRequired: tenderResult.humanReviewRequired,
      nextActions: nextActionsForOutcome(outcome, input.riskLevel),
    }
  },
}
