import type { DecisionType, ScenarioType } from "@prisma/client"
import type {
  SimulationInput,
  SimulationScenarioResult,
  SimulationOutput,
  SimulationPrerequisites,
  SimulationAdapter,
} from "./simulation-types"
import { tenderAdapter } from "./simulation-adapters"
import { deriveScores, type DecisionScoringData } from "./decision-scoring"

export type { SimulationInput, SimulationScenarioResult, SimulationOutput, SimulationPrerequisites, SimulationAdapter } from "./simulation-types"
export { deriveScores, getScoreDrivers, type DecisionScoringData, type DerivedScores } from "./decision-scoring"

const SCENARIO_TYPES: ("BEST_CASE" | "EXPECTED_CASE" | "WORST_CASE")[] = ["BEST_CASE", "EXPECTED_CASE", "WORST_CASE"]

function scenarioLabel(type: ScenarioType): string {
  return type.replace("_", " ")
}

function scenarioUpside(type: ScenarioType, score: number): string {
  if (type === "BEST_CASE") return `Best case achieves ${score}/100 — all favorable conditions align`
  if (type === "EXPECTED_CASE") return `Expected case at ${score}/100 — most likely outcome based on current data`
  return `Worst case at ${score}/100 — adverse conditions but still within manageable range`
}

function scenarioDownside(type: ScenarioType, score: number): string {
  if (type === "BEST_CASE") return `Unlikely to exceed ${score}/100 without external catalysts`
  if (type === "EXPECTED_CASE") return `Could drop to worst case if key assumptions fail`
  return `May require decision deferral or significant mitigation`
}

function scenarioRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" {
  if (score >= 75) return "LOW"
  if (score >= 55) return "MEDIUM"
  return "HIGH"
}

function scenarioRecommendedAction(score: number): string {
  if (score >= 75) return "GO — Proceed with confidence"
  if (score >= 55) return "GO WITH CONDITIONS — Address key risks before proceeding"
  return "NO GO — Significant concerns require resolution"
}

function buildGenericResult(
  scenarioType: ScenarioType,
  scores: { feasibility: number; financial: number; capacity: number; risk: number; strategic: number }
): SimulationScenarioResult {
  const overall = Math.round(
    (scores.feasibility * 0.2 + scores.financial * 0.25 + scores.capacity * 0.15 + scores.risk * 0.2 + scores.strategic * 0.2) * 10
  ) / 10

  return {
    scenarioType,
    scenarioName: scenarioLabel(scenarioType),
    feasibilityScore: scores.feasibility,
    financialScore: scores.financial,
    capacityScore: scores.capacity,
    riskScore: scores.risk,
    strategicFitScore: scores.strategic,
    overallDecisionScore: overall,
    confidence: Math.round((overall / 100) * 10) / 10,
    upside: scenarioUpside(scenarioType, overall),
    downside: scenarioDownside(scenarioType, overall),
    riskLevel: scenarioRiskLevel(overall),
    rationale: `Feasibility: ${scores.feasibility}, Financial: ${scores.financial}, Capacity: ${scores.capacity}, Risk: ${scores.risk}, Strategic: ${scores.strategic}`,
    recommendedAction: scenarioRecommendedAction(overall),
  }
}

function applyScenarioMultiplier(base: number, type: ScenarioType): number {
  const multiplier = type === "BEST_CASE" ? 1.15 : type === "WORST_CASE" ? 0.8 : 1.0
  return Math.min(Math.round(base * multiplier * 10) / 10, 100)
}

function getBaseScores(input: SimulationInput): { strategic: number; risk: number; feasibility: number; financial: number; capacity: number } {
  if (input.derivedScores) {
    const d = input.derivedScores
    return {
      strategic: d.strategicFitScore,
      risk: d.riskScore,
      feasibility: d.feasibilityScore,
      financial: d.financialScore,
      capacity: d.capacityScore,
    }
  }

  const riskBase = input.riskLevel === "LOW" ? 75 : input.riskLevel === "MEDIUM" ? 55 : 35
  return {
    strategic: input.strategicFitScore,
    risk: riskBase,
    feasibility: 60,
    financial: 55,
    capacity: 65,
  }
}

function buildResultFromDerived(scenarioType: ScenarioType, base: { strategic: number; risk: number; feasibility: number; financial: number; capacity: number }): SimulationScenarioResult {
  return buildGenericResult(scenarioType, {
    strategic: applyScenarioMultiplier(base.strategic, scenarioType),
    risk: applyScenarioMultiplier(base.risk, scenarioType),
    feasibility: applyScenarioMultiplier(base.feasibility, scenarioType),
    financial: applyScenarioMultiplier(base.financial, scenarioType),
    capacity: applyScenarioMultiplier(base.capacity, scenarioType),
  })
}

// ─── Investment Adapter ───
const investmentAdapter: SimulationAdapter = {
  name: "Investment Simulation",
  description: "ROI, payback, and risk scoring for investment decisions",
  prerequisites: (input: Record<string, unknown>): SimulationPrerequisites => {
    const missing: string[] = []
    if (!input.strategicFitScore && input.strategicFitScore !== 0) missing.push("Strategic fit score (0-100)")
    if (!input.riskLevel) missing.push("Risk level (LOW/MEDIUM/HIGH)")
    return {
      canRun: missing.length === 0,
      missingInputs: missing,
      recommendedNextStep: missing.length > 0 ? "Complete decision intake with risk assessment" : "Simulation ready to run",
    }
  },
  run: (input: SimulationInput): SimulationScenarioResult[] => {
    const base = getBaseScores(input)
    return SCENARIO_TYPES.map((type) => buildResultFromDerived(type, base))
  },
}

// ─── Strategic Adapter ───
const strategicAdapter: SimulationAdapter = {
  name: "Strategic Simulation",
  description: "Strategic alignment, optionality, and risk scoring",
  prerequisites: (input: Record<string, unknown>): SimulationPrerequisites => {
    const missing: string[] = []
    if (!input.strategicFitScore && input.strategicFitScore !== 0) missing.push("Strategic fit score (0-100)")
    if (!input.riskLevel) missing.push("Risk level (LOW/MEDIUM/HIGH)")
    return {
      canRun: missing.length === 0,
      missingInputs: missing,
      recommendedNextStep: missing.length > 0 ? "Complete decision intake with strategic alignment assessment" : "Simulation ready to run",
    }
  },
  run: (input: SimulationInput): SimulationScenarioResult[] => {
    const base = getBaseScores(input)
    return SCENARIO_TYPES.map((type) => buildResultFromDerived(type, base))
  },
}

// ─── Hiring Adapter ───
const hiringAdapter: SimulationAdapter = {
  name: "Hiring Simulation",
  description: "Capacity impact, cost, and risk scoring for hiring decisions",
  prerequisites: (input: Record<string, unknown>): SimulationPrerequisites => {
    const missing: string[] = []
    if (!input.strategicFitScore && input.strategicFitScore !== 0) missing.push("Strategic fit score (0-100)")
    if (!input.riskLevel) missing.push("Risk level (LOW/MEDIUM/HIGH)")
    return {
      canRun: missing.length === 0,
      missingInputs: missing,
      recommendedNextStep: missing.length > 0 ? "Complete decision intake with role impact assessment" : "Simulation ready to run",
    }
  },
  run: (input: SimulationInput): SimulationScenarioResult[] => {
    const base = getBaseScores(input)
    return SCENARIO_TYPES.map((type) => buildResultFromDerived(type, base))
  },
}

// ─── Generic Fallback Adapter ───
const genericAdapter: SimulationAdapter = {
  name: "Generic Simulation",
  description: "Weighted scoring simulation for any decision type",
  prerequisites: (input: Record<string, unknown>): SimulationPrerequisites => {
    const missing: string[] = []
    if (!input.strategicFitScore && input.strategicFitScore !== 0) missing.push("Strategic fit score (0-100)")
    if (!input.riskLevel) missing.push("Risk level (LOW/MEDIUM/HIGH)")
    return {
      canRun: missing.length === 0,
      missingInputs: missing,
      recommendedNextStep: missing.length > 0 ? "Complete decision intake with risk and strategic fit assessment" : "Simulation ready to run",
    }
  },
  run: (input: SimulationInput): SimulationScenarioResult[] => {
    const base = getBaseScores(input)
    return SCENARIO_TYPES.map((type) => buildResultFromDerived(type, base))
  },
}

// ─── Adapter Registry ───
const ADAPTERS: Record<string, SimulationAdapter> = {
  TENDER: tenderAdapter,
  INVESTMENT: investmentAdapter,
  STRATEGIC: strategicAdapter,
  HIRING: hiringAdapter,
}

export function getSimulationAdapter(decisionType: DecisionType): SimulationAdapter {
  return ADAPTERS[decisionType] ?? genericAdapter
}

export function canRunSimulation(
  decisionType: DecisionType,
  inputData: Record<string, unknown>
): SimulationPrerequisites {
  const adapter = getSimulationAdapter(decisionType)
  return adapter.prerequisites(inputData)
}

export function runGenericSimulation(input: SimulationInput): SimulationScenarioResult[] {
  const adapter = getSimulationAdapter(input.decisionType)
  return adapter.run(input)
}

export function getSimulationSummary(output: SimulationOutput): string {
  const expected = output.scenarios.find((s) => s.scenarioType === "EXPECTED_CASE")
  if (!expected) return "Simulation results unavailable"

  const best = output.scenarios.find((s) => s.scenarioType === "BEST_CASE")
  const worst = output.scenarios.find((s) => s.scenarioType === "WORST_CASE")

  const range = best && worst ? `${worst.overallDecisionScore}–${best.overallDecisionScore}` : expected.overallDecisionScore.toString()

  return `Expected case score: ${expected.overallDecisionScore}/100 (range: ${range}). ${expected.recommendedAction}.`
}

export function buildScoringData(decision: {
  objectives: Array<{ description: string }>
  constraints: Array<{ description: string }>
  assumptions: Array<{ description: string }>
  alternatives: Array<{ description: string }>
  risks: Array<{ description: string; level: string }>
  framework: {
    context: string
    purpose: string
    options: string
    criteria: string
    values: string
    informationGaps: string
    certainty: string
    assumptions: string
  } | null
  decisionScenarios: Array<{ name: string; description: string }>
  priority: string | null
  targetDate: Date | null
}): DecisionScoringData {
  return {
    objectives: decision.objectives,
    constraints: decision.constraints,
    assumptions: decision.assumptions,
    alternatives: decision.alternatives,
    risks: decision.risks as Array<{ description: string; level: "LOW" | "MEDIUM" | "HIGH" }>,
    framework: decision.framework,
    businessScenarioCount: decision.decisionScenarios.length,
    businessScenariosComplete: decision.decisionScenarios.length >= 3 &&
      decision.decisionScenarios.every((s) => s.name && s.description),
    priority: decision.priority,
    targetDate: decision.targetDate,
  }
}
