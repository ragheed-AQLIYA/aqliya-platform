import type { RecommendationInput, RecommendationResult, RecommendationPrerequisites, RecommendationAdapter } from "../recommendation-types"
import { RecommendationOutcome } from "../recommendation-types"
import { determineOutcome, confidenceFromScores, nextActionsForOutcome } from "./common"

export const investmentAdapter: RecommendationAdapter = {
  name: "Investment Recommendation",
  description: "ROI/risk/strategic fit weighted logic for investment decisions",
  prerequisites: (input: RecommendationInput): RecommendationPrerequisites => {
    const missing: string[] = []
    if (input.scenarioScores.length === 0) missing.push("Simulation results required")
    if (!input.strategicFitScore && input.strategicFitScore !== 0) missing.push("Strategic fit score")
    return {
      canRun: missing.length === 0,
      missingInputs: missing,
      recommendedNextStep: missing.length > 0 ? "Complete investment analysis" : "Recommendation ready to generate",
    }
  },
  generate: (input: RecommendationInput): RecommendationResult => {
    const expectedCase = input.scenarioScores.find((s) => s.scenarioType === "EXPECTED_CASE")
    const overallScore = expectedCase?.overallDecisionScore ?? 0
    const financialScore = expectedCase?.financialScore ?? 0
    const riskScore = expectedCase?.riskScore ?? 0
    const hasMissingInputs = (input.missingInputs?.length ?? 0) > 0
    const outcome = determineOutcome(overallScore, input.riskLevel, hasMissingInputs)
    const confidence = confidenceFromScores(input.scenarioScores)

    let rationale = `Investment analysis shows overall score of ${overallScore}/100. `
    rationale += `Financial viability: ${financialScore}/100, Risk-adjusted return: ${riskScore}/100, Strategic alignment: ${input.strategicFitScore}/100. `
    if (financialScore >= 70) rationale += "Strong financial returns support proceeding. "
    else if (financialScore >= 50) rationale += "Moderate returns require careful risk management. "
    else rationale += "Financial returns are below acceptable threshold. "

    let expectedNextState = ""
    if (outcome === RecommendationOutcome.GO) expectedNextState = "Investment approved, capital allocated, and project initiated within 30 days"
    else if (outcome === RecommendationOutcome.GO_WITH_CONDITIONS) expectedNextState = "Investment approved with conditions, pending risk mitigation and financial safeguards"
    else if (outcome === RecommendationOutcome.DEFER) expectedNextState = "Investment deferred, capital preserved for higher-return opportunities"
    else if (outcome === RecommendationOutcome.NO_GO) expectedNextState = "Investment rejected, resources redirected to alternative opportunities"
    else expectedNextState = "Analysis pending, additional data required before investment decision"

    return {
      outcome,
      confidence,
      recommendedAction: `${outcome} — Investment ${outcome === RecommendationOutcome.GO ? "approved" : outcome === RecommendationOutcome.NO_GO ? "rejected" : outcome === RecommendationOutcome.DEFER ? "deferred" : outcome === RecommendationOutcome.NEEDS_MORE_DATA ? "pending data" : "approved with conditions"}`,
      rationale,
      expectedNextState,
      scopeExclusions: "Does not include follow-on investments or expansion phases. Each phase requires separate evaluation.",
      assumptionsUsed: `Risk level: ${input.riskLevel}. Strategic fit: ${input.strategicFitScore}/100. Financial projections based on current market conditions.`,
      risksAccepted: input.riskLevel === "HIGH" ? "High investment risk accepted with active monitoring and exit strategy." : input.riskLevel === "MEDIUM" ? "Moderate investment risk accepted with standard controls." : "Low risk profile. Standard monitoring sufficient.",
      risksRejected: "Market volatility and regulatory changes excluded from base case. Sensitivity analysis recommended.",
      humanReviewRequired: outcome !== RecommendationOutcome.GO,
      nextActions: nextActionsForOutcome(outcome, input.riskLevel),
    }
  },
}
