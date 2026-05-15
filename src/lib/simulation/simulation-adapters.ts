import type { ScenarioType } from "@prisma/client"
import type { SimulationInput, SimulationScenarioResult, SimulationPrerequisites, SimulationAdapter } from "./simulation-types"
import { runSimulation } from "./tender-simulation"

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

function scenarioRationale(type: ScenarioType, scores: { financial: number; capacity: number; risk: number; strategic: number }): string {
  const strongest = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  const weakest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0]
  return `${scenarioLabel(type)}: Strongest in ${strongest[0]} (${strongest[1]}), weakest in ${weakest[0]} (${weakest[1]})`
}

function scenarioRecommendedAction(score: number): string {
  if (score >= 75) return "GO — Proceed with confidence"
  if (score >= 55) return "GO WITH CONDITIONS — Address key risks before proceeding"
  return "NO GO — Significant concerns require resolution"
}

export const tenderAdapter: SimulationAdapter = {
  name: "Tender Simulation",
  description: "Financial, capacity, and risk scoring for tender decisions",
  prerequisites: (input: Record<string, unknown>): SimulationPrerequisites => {
    const missing: string[] = []
    if (!input.estimatedContractValue) missing.push("Estimated contract value")
    if (!input.estimatedCost) missing.push("Estimated cost")
    if (!input.durationMonths) missing.push("Duration in months")
    if (!input.requiredCapacity) missing.push("Required capacity")
    if (!input.internalAvailableCapacity) missing.push("Internal available capacity")
    if (!input.marginEstimate) missing.push("Margin estimate")
    return {
      canRun: missing.length === 0,
      missingInputs: missing,
      recommendedNextStep: missing.length > 0 ? "Complete the Tender Profile with financial and capacity details" : "Simulation ready to run",
    }
  },
  run: (input: SimulationInput): SimulationScenarioResult[] => {
    const tenderInput = {
      estimatedContractValue: input.estimatedContractValue as number,
      estimatedCost: input.estimatedCost as number,
      durationMonths: input.durationMonths as number,
      requiredCapacity: input.requiredCapacity as number,
      internalAvailableCapacity: input.internalAvailableCapacity as number,
      strategicFitScore: input.strategicFitScore,
      riskLevel: input.riskLevel,
      marginEstimate: input.marginEstimate as number,
    }

    const scenarioTypes: ("BEST_CASE" | "EXPECTED_CASE" | "WORST_CASE")[] = ["BEST_CASE", "EXPECTED_CASE", "WORST_CASE"]
    const results = runSimulation(tenderInput, scenarioTypes)

    return results.map((r) => ({
      scenarioType: r.scenarioType,
      scenarioName: scenarioLabel(r.scenarioType),
      feasibilityScore: r.feasibilityScore,
      financialScore: r.financialScore,
      capacityScore: r.capacityScore,
      riskScore: r.riskScore,
      strategicFitScore: r.strategicFitScore,
      overallDecisionScore: r.overallDecisionScore,
      confidence: Math.round((r.overallDecisionScore / 100) * 10) / 10,
      upside: scenarioUpside(r.scenarioType, r.overallDecisionScore),
      downside: scenarioDownside(r.scenarioType, r.overallDecisionScore),
      riskLevel: scenarioRiskLevel(r.overallDecisionScore),
      rationale: scenarioRationale(r.scenarioType, {
        financial: r.financialScore,
        capacity: r.capacityScore,
        risk: r.riskScore,
        strategic: r.strategicFitScore,
      }),
      recommendedAction: scenarioRecommendedAction(r.overallDecisionScore),
    }))
  },
}
