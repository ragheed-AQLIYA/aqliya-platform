import type { RecommendationInput, RecommendationResult, RecommendationPrerequisites, RecommendationAdapter } from "../recommendation-types"
import { RecommendationOutcome } from "../recommendation-types"
import { determineOutcome, confidenceFromScores, nextActionsForOutcome } from "./common"

export const hiringAdapter: RecommendationAdapter = {
  name: "Hiring Recommendation",
  description: "Capacity/impact/cost/risk logic for hiring decisions",
  prerequisites: (input: RecommendationInput): RecommendationPrerequisites => {
    const missing: string[] = []
    if (input.scenarioScores.length === 0) missing.push("Simulation results required")
    if (!input.strategicFitScore && input.strategicFitScore !== 0) missing.push("Strategic fit score")
    return {
      canRun: missing.length === 0,
      missingInputs: missing,
      recommendedNextStep: missing.length > 0 ? "Complete role impact assessment" : "Recommendation ready to generate",
    }
  },
  generate: (input: RecommendationInput): RecommendationResult => {
    const expectedCase = input.scenarioScores.find((s) => s.scenarioType === "EXPECTED_CASE")
    const overallScore = expectedCase?.overallDecisionScore ?? 0
    const capacityScore = expectedCase?.capacityScore ?? 0
    const hasMissingInputs = (input.missingInputs?.length ?? 0) > 0
    const outcome = determineOutcome(overallScore, input.riskLevel, hasMissingInputs)
    const confidence = confidenceFromScores(input.scenarioScores)

    let rationale = `Hiring analysis shows overall score of ${overallScore}/100. `
    rationale += `Capacity impact: ${capacityScore}/100, Strategic fit: ${input.strategicFitScore}/100. `
    if (capacityScore >= 75) rationale += "Strong capacity improvement supports proceeding with hiring. "
    else if (capacityScore >= 55) rationale += "Moderate capacity gain requires careful role definition and onboarding plan. "
    else rationale += "Limited capacity improvement may not justify hiring cost. "

    let expectedNextState = ""
    if (outcome === RecommendationOutcome.GO) expectedNextState = "Hiring approved, role posted, and onboarding plan initiated"
    else if (outcome === RecommendationOutcome.GO_WITH_CONDITIONS) expectedNextState = "Hiring approved with conditions, pending role refinement and budget confirmation"
    else if (outcome === RecommendationOutcome.DEFER) expectedNextState = "Hiring deferred, current team capacity optimized in interim"
    else if (outcome === RecommendationOutcome.NO_GO) expectedNextState = "Hiring rejected, alternative capacity solutions explored"
    else expectedNextState = "Hiring assessment incomplete, additional role analysis required"

    return {
      outcome,
      confidence,
      recommendedAction: `${outcome} — Hiring ${outcome === RecommendationOutcome.GO ? "approved" : outcome === RecommendationOutcome.NO_GO ? "rejected" : outcome === RecommendationOutcome.DEFER ? "deferred" : outcome === RecommendationOutcome.NEEDS_MORE_DATA ? "pending analysis" : "approved with conditions"}`,
      rationale,
      expectedNextState,
      scopeExclusions: "Does not include compensation negotiation, benefits design, or long-term career pathing. HR processes apply separately.",
      assumptionsUsed: `Risk level: ${input.riskLevel}. Strategic fit: ${input.strategicFitScore}/100. Based on current team capacity and role requirements.`,
      risksAccepted: input.riskLevel === "HIGH" ? "High hiring risk accepted with structured probation and performance milestones." : input.riskLevel === "MEDIUM" ? "Moderate hiring risk accepted with standard onboarding and review cycles." : "Low hiring risk. Standard recruitment process sufficient.",
      risksRejected: "Cultural fit and retention risks not fully quantified. Reference checks and trial periods recommended.",
      humanReviewRequired: outcome !== RecommendationOutcome.GO,
      nextActions: nextActionsForOutcome(outcome, input.riskLevel),
    }
  },
}
