import type { Prisma } from "@prisma/client"

export interface CanonicalScenario {
  id: string
  name: string
  description: string
  assumptions: string
  expectedOutcome: string
  affectedStakeholders: string
  requiredConditions: string
  hasRiskAnalysis: boolean
  hasSimulation: boolean
}

export interface SimulationScenario {
  id: string
  type: "BEST_CASE" | "EXPECTED_CASE" | "WORST_CASE"
  feasibilityScore: number | null
  financialScore: number | null
  capacityScore: number | null
  riskScore: number | null
  strategicFitScore: number | null
  overallDecisionScore: number | null
}

export interface ScenarioReadiness {
  businessScenarios: CanonicalScenario[]
  simulationScenarios: SimulationScenario[]
  businessScenarioCount: number
  simulationScenarioCount: number
  allBusinessComplete: boolean
  allSimulationComplete: boolean
  hasRiskAnalysisForAll: boolean
  readinessScore: number
}

export function mapDecisionScenarios(
  scenarios: Array<{
    id: string
    name: string
    description: string
    assumptions: string
    expectedOutcome: string
    affectedStakeholders: string
    requiredConditions: string
    riskAnalysis?: { id: string } | null
  }>,
  simulationResults?: Array<{
    scenarioId: string | null
    feasibilityScore: number | null
    financialScore: number | null
    capacityScore: number | null
    riskScore: number | null
    strategicFitScore: number | null
    overallDecisionScore: number | null
  }>
): CanonicalScenario[] {
  const simIds = new Set(simulationResults?.filter((s) => s.scenarioId).map((s) => s.scenarioId) ?? [])
  return scenarios.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    assumptions: s.assumptions,
    expectedOutcome: s.expectedOutcome,
    affectedStakeholders: s.affectedStakeholders,
    requiredConditions: s.requiredConditions,
    hasRiskAnalysis: !!s.riskAnalysis,
    hasSimulation: simIds.has(s.id),
  }))
}

export function mapSimulationScenarios(
  scenarios: Array<{
    id: string
    type: string
    simulation?: {
      feasibilityScore: number | null
      financialScore: number | null
      capacityScore: number | null
      riskScore: number | null
      strategicFitScore: number | null
      overallDecisionScore: number | null
    } | null
  }>
): SimulationScenario[] {
  return scenarios.map((s) => ({
    id: s.id,
    type: s.type as "BEST_CASE" | "EXPECTED_CASE" | "WORST_CASE",
    feasibilityScore: s.simulation?.feasibilityScore ?? null,
    financialScore: s.simulation?.financialScore ?? null,
    capacityScore: s.simulation?.capacityScore ?? null,
    riskScore: s.simulation?.riskScore ?? null,
    strategicFitScore: s.simulation?.strategicFitScore ?? null,
    overallDecisionScore: s.simulation?.overallDecisionScore ?? null,
  }))
}

export function evaluateScenarioReadiness(
  businessScenarios: CanonicalScenario[],
  simulationScenarios: SimulationScenario[]
): ScenarioReadiness {
  const businessCount = businessScenarios.length
  const simulationCount = simulationScenarios.length

  const allBusinessComplete = businessCount >= 3 &&
    businessScenarios.every((s) => s.name && s.description && s.expectedOutcome)

  const allSimulationComplete = simulationScenarios.length === 3 &&
    simulationScenarios.every((s) => s.overallDecisionScore !== null)

  const hasRiskAnalysisForAll = businessCount > 0 &&
    businessScenarios.every((s) => s.hasRiskAnalysis)

  let readinessScore = 0
  if (businessCount >= 3) readinessScore += 25
  else if (businessCount > 0) readinessScore += (businessCount / 3) * 25
  if (allBusinessComplete) readinessScore += 25
  if (hasRiskAnalysisForAll) readinessScore += 25
  if (allSimulationComplete) readinessScore += 25
  else if (simulationCount > 0) readinessScore += (simulationCount / 3) * 25

  return {
    businessScenarios,
    simulationScenarios,
    businessScenarioCount: businessCount,
    simulationScenarioCount: simulationCount,
    allBusinessComplete,
    allSimulationComplete,
    hasRiskAnalysisForAll,
    readinessScore: Math.round(readinessScore),
  }
}

export function getScenarioSimulationInputs(scenarios: CanonicalScenario[]): Record<string, unknown> {
  const inputs: Record<string, unknown> = {}
  inputs.scenarioCount = scenarios.length
  inputs.scenarioNames = scenarios.map((s) => s.name)
  inputs.hasAssumptions = scenarios.some((s) => s.assumptions.length > 0)
  inputs.hasStakeholders = scenarios.some((s) => s.affectedStakeholders.length > 0)
  inputs.hasConditions = scenarios.some((s) => s.requiredConditions.length > 0)
  return inputs
}
