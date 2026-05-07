export type RecommendationField =
  | "recommendedAction"
  | "rationale"
  | "expectedNextState"
  | "scopeExclusions"
  | "assumptionsUsed"
  | "risksAccepted"
  | "risksRejected"
  | "humanReviewRequired"

export interface DecisionRecommendationInput {
  id?: string
  recommendedAction?: string | null
  rationale?: string | null
  expectedNextState?: string | null
  scopeExclusions?: string | null
  assumptionsUsed?: string | null
  risksAccepted?: string | null
  risksRejected?: string | null
  humanReviewRequired?: boolean | null
}

export type NormalizedDecisionRecommendationInput = {
  recommendedAction: string
  rationale: string
  expectedNextState: string
  scopeExclusions: string
  assumptionsUsed: string
  risksAccepted: string
  risksRejected: string
  humanReviewRequired: boolean
}

const fieldLabels: Record<RecommendationField, string> = {
  recommendedAction: "recommended action",
  rationale: "rationale",
  expectedNextState: "expected next state",
  scopeExclusions: "scope exclusions",
  assumptionsUsed: "assumptions used",
  risksAccepted: "risks accepted",
  risksRejected: "risks rejected",
  humanReviewRequired: "human review required",
}

function hasValue(value?: string | null) {
  return Boolean(value?.trim())
}

export function normalizeDecisionRecommendation(input: DecisionRecommendationInput): NormalizedDecisionRecommendationInput {
  return {
    recommendedAction: input.recommendedAction?.trim() ?? "",
    rationale: input.rationale?.trim() ?? "",
    expectedNextState: input.expectedNextState?.trim() ?? "",
    scopeExclusions: input.scopeExclusions?.trim() ?? "",
    assumptionsUsed: input.assumptionsUsed?.trim() ?? "",
    risksAccepted: input.risksAccepted?.trim() ?? "",
    risksRejected: input.risksRejected?.trim() ?? "",
    humanReviewRequired: Boolean(input.humanReviewRequired),
  }
}

export function evaluateDecisionRecommendation(rec?: DecisionRecommendationInput | null): {
  isComplete: boolean
  missingFields: RecommendationField[]
  nextSteps: string[]
} {
  const normalized = normalizeDecisionRecommendation(rec ?? {})
  const missingFields = (Object.keys(fieldLabels) as RecommendationField[]).filter(
    (field) => (field === "humanReviewRequired" ? normalized[field] === false : !hasValue(normalized[field]))
  )

  if (missingFields.length > 0) {
    return {
      isComplete: false,
      missingFields,
      nextSteps: missingFields.map((field) => `Define ${fieldLabels[field]}.`),
    }
  }

  return {
    isComplete: true,
    missingFields: [],
    nextSteps: ["Recommendation is complete. Do not auto-execute; remains human-facing and reviewable."],
  }
}

export function withDecisionRecommendation<T extends {
  recommendation?: DecisionRecommendationInput | null
}>(decision: T): T & { recommendationState: ReturnType<typeof evaluateDecisionRecommendation> } {
  return {
    ...decision,
    recommendationState: evaluateDecisionRecommendation(decision.recommendation),
  }
}
