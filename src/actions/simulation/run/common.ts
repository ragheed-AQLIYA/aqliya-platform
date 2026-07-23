"use server"

export type ScenarioScore = {
  scenarioType: string
  feasibilityScore: number
  financialScore: number
  capacityScore: number
  riskScore: number
  strategicFitScore: number
  overallDecisionScore: number
}

export type SimulationExecutionResult =
  | { success: true; scenarioScores: ScenarioScore[] }
  | { success: false; error: string; missingInputs?: string[]; recommendedNextStep?: string }
