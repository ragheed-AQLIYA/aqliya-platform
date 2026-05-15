import type { RiskLevel } from "@prisma/client"
import type { RecommendationInput, RecommendationResult, RecommendationPrerequisites, RecommendationAdapter, ScenarioScores } from "./recommendation-types"
import { RecommendationOutcome } from "./recommendation-types"
import { generateRecommendation as generateTenderRecommendation } from "./tender-recommendation"

function determineOutcome(overallScore: number, riskLevel: RiskLevel, hasMissingInputs: boolean): RecommendationOutcome {
  if (hasMissingInputs) return RecommendationOutcome.NEEDS_MORE_DATA
  if (overallScore >= 75) return RecommendationOutcome.GO
  if (overallScore >= 55) return RecommendationOutcome.GO_WITH_CONDITIONS
  if (overallScore >= 40) return RecommendationOutcome.DEFER
  return RecommendationOutcome.NO_GO
}

function confidenceFromScores(scenarios: ScenarioScores[]): number {
  const expected = scenarios.find((s) => s.scenarioType === "EXPECTED_CASE")
  const best = scenarios.find((s) => s.scenarioType === "BEST_CASE")
  const worst = scenarios.find((s) => s.scenarioType === "WORST_CASE")
  if (!expected || !best || !worst) return 50
  const variance = best.overallDecisionScore - worst.overallDecisionScore
  const baseConfidence = Math.max(0, Math.min(100, expected.overallDecisionScore))
  const variancePenalty = Math.max(0, (variance - 20) * 1.5)
  return Math.round(Math.max(0, baseConfidence - variancePenalty))
}

function riskLevelScore(riskLevel: RiskLevel): number {
  return riskLevel === "LOW" ? 85 : riskLevel === "MEDIUM" ? 60 : 35
}

function nextActionsForOutcome(outcome: RecommendationOutcome, riskLevel: RiskLevel): string[] {
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

// ─── Tender Adapter ───
const tenderAdapter: RecommendationAdapter = {
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

// ─── Investment Adapter ───
const investmentAdapter: RecommendationAdapter = {
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

// ─── Strategic Adapter ───
const strategicAdapter: RecommendationAdapter = {
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

// ─── Hiring Adapter ───
const hiringAdapter: RecommendationAdapter = {
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

// ─── Generic Fallback Adapter ───
const genericAdapter: RecommendationAdapter = {
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

// ─── Adapter Registry ───
const ADAPTERS: Record<string, RecommendationAdapter> = {
  TENDER: tenderAdapter,
  INVESTMENT: investmentAdapter,
  STRATEGIC: strategicAdapter,
  HIRING: hiringAdapter,
}

export function getRecommendationAdapter(decisionType: string): RecommendationAdapter {
  return ADAPTERS[decisionType] ?? genericAdapter
}

export function canGenerateRecommendation(input: RecommendationInput): RecommendationPrerequisites {
  const adapter = getRecommendationAdapter(input.decisionType)
  return adapter.prerequisites(input)
}

export function generateGenericRecommendation(input: RecommendationInput): RecommendationResult {
  const adapter = getRecommendationAdapter(input.decisionType)
  return adapter.generate(input)
}

export type { RecommendationInput, RecommendationResult, RecommendationPrerequisites, RecommendationAdapter, ScenarioScores } from "./recommendation-types"
export { RecommendationOutcome } from "./recommendation-types"
