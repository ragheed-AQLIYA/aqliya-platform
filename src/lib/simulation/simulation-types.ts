import type { DecisionType, ScenarioType } from "@prisma/client"
import type { DecisionScoringData, DerivedScores } from "./decision-scoring"

export type { DecisionScoringData, DerivedScores } from "./decision-scoring"

export interface SimulationInput {
  decisionId: string
  decisionType: DecisionType
  strategicFitScore: number
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  derivedScores?: DerivedScores
  [key: string]: unknown
}

export interface SimulationScenarioResult {
  scenarioType: ScenarioType
  scenarioName: string
  feasibilityScore: number
  financialScore: number
  capacityScore: number
  riskScore: number
  strategicFitScore: number
  overallDecisionScore: number
  confidence: number
  upside: string
  downside: string
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  rationale: string
  recommendedAction: string
}

export interface SimulationOutput {
  decisionId: string
  decisionType: DecisionType
  scenarios: SimulationScenarioResult[]
  overallConfidence: number
  summary: string
}

export interface SimulationPrerequisites {
  canRun: boolean
  missingInputs: string[]
  recommendedNextStep: string
}

export interface SimulationAdapter {
  name: string
  description: string
  prerequisites: (input: Record<string, unknown>) => SimulationPrerequisites
  run: (input: SimulationInput) => SimulationScenarioResult[]
}
