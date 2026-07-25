import type { RecommendationInput, RecommendationResult, RecommendationPrerequisites, RecommendationAdapter, ScenarioScores } from "../recommendation-types"
import { RecommendationOutcome } from "../recommendation-types"
import { tenderAdapter } from "./tender"
import { investmentAdapter } from "./investment"
import { strategicAdapter } from "./strategic"
import { hiringAdapter } from "./hiring"
import { genericAdapter } from "./generic"

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

export type { RecommendationInput, RecommendationResult, RecommendationPrerequisites, RecommendationAdapter, ScenarioScores }
export { RecommendationOutcome }
