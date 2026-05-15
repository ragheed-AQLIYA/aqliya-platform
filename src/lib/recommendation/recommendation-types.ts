import type { DecisionType, RiskLevel } from "@prisma/client"

export enum RecommendationOutcome {
  GO = "GO",
  GO_WITH_CONDITIONS = "GO_WITH_CONDITIONS",
  NO_GO = "NO_GO",
  DEFER = "DEFER",
  NEEDS_MORE_DATA = "NEEDS_MORE_DATA",
}

export interface ScenarioScores {
  scenarioType: string
  feasibilityScore: number
  financialScore: number
  capacityScore: number
  riskScore: number
  strategicFitScore: number
  overallDecisionScore: number
}

export interface RecommendationInput {
  decisionId: string
  decisionType: DecisionType
  scenarioScores: ScenarioScores[]
  riskLevel: RiskLevel
  strategicFitScore: number
  priority?: string
  targetDate?: Date | null
  workflowComplete?: boolean
  missingInputs?: string[]
}

export interface RecommendationResult {
  outcome: RecommendationOutcome
  confidence: number
  recommendedAction: string
  rationale: string
  expectedNextState: string
  scopeExclusions: string
  assumptionsUsed: string
  risksAccepted: string
  risksRejected: string
  humanReviewRequired: boolean
  conditions?: string
  nextActions: string[]
}

export interface RecommendationPrerequisites {
  canRun: boolean
  missingInputs: string[]
  recommendedNextStep: string
}

export interface RecommendationAdapter {
  name: string
  description: string
  prerequisites: (input: RecommendationInput) => RecommendationPrerequisites
  generate: (input: RecommendationInput) => RecommendationResult
}
