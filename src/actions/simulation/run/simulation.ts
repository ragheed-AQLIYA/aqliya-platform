"use server"

import { runGenericSimulation, canRunSimulation, type SimulationInput, deriveScores } from "@/lib/simulation/simulation-engine"
import { runSimulation, type TenderInput } from "@/lib/simulation/tender-simulation"
import { buildScoringInputFromDecision, adaptDecisionToScoringInput, isValidDecisionType } from "../common"
import type { ScenarioScore, SimulationExecutionResult } from "./common"

export async function runSimulationCore(
  decisionId: string,
  decision: {
    id: string
    type: string
    tenderProfile: {
      estimatedContractValue: number
      estimatedCost: number
      durationMonths: number
      requiredCapacity: number
      internalAvailableCapacity: number
      strategicFitScore: number
      riskLevel: string
      marginEstimate: number
    } | null
    risks: { level: string }[]
    objectives: unknown
    constraints: unknown
    assumptions: unknown
    alternatives: unknown
    framework: unknown
  },
): Promise<SimulationExecutionResult> {
  let scenarioScores: ScenarioScore[]

  if (decision.type === "TENDER" && decision.tenderProfile) {
    const tender = decision.tenderProfile
    const tenderInput: TenderInput = {
      estimatedContractValue: tender.estimatedContractValue,
      estimatedCost: tender.estimatedCost,
      riskLevel: tender.riskLevel as "LOW" | "MEDIUM" | "HIGH",
      strategicFitScore: tender.strategicFitScore,
      internalAvailableCapacity: tender.internalAvailableCapacity,
      requiredCapacity: tender.requiredCapacity,
      marginEstimate: tender.marginEstimate,
      durationMonths: tender.durationMonths,
    }
    const results = runSimulation(tenderInput, ["BEST_CASE", "EXPECTED_CASE", "WORST_CASE"])
    scenarioScores = results.map((r) => ({
      scenarioType: r.scenarioType,
      feasibilityScore: r.feasibilityScore,
      financialScore: r.financialScore,
      capacityScore: r.capacityScore,
      riskScore: r.riskScore,
      strategicFitScore: r.strategicFitScore,
      overallDecisionScore: r.overallDecisionScore,
    }))
  } else {
    const scoringInput = adaptDecisionToScoringInput(decision)
    const scoringData = buildScoringInputFromDecision(scoringInput)
    const derived = deriveScores(scoringData)
    const riskLevel = (decision.risks?.[0]?.level as "LOW" | "MEDIUM" | "HIGH") ?? "MEDIUM"

    if (!isValidDecisionType(decision.type)) {
      return { success: false, error: `Invalid decision type: ${decision.type}`, missingInputs: [], recommendedNextStep: "Fix decision type" }
    }

    const prereqs = canRunSimulation(decision.type, {
      strategicFitScore: derived.strategicFitScore,
      riskLevel,
    })
    if (!prereqs.canRun) {
      return { success: false, error: `Cannot run simulation: ${prereqs.missingInputs.join(", ")}`, missingInputs: prereqs.missingInputs, recommendedNextStep: prereqs.recommendedNextStep }
    }

    const simulationInput: SimulationInput = {
      decisionId,
      decisionType: decision.type,
      strategicFitScore: derived.strategicFitScore,
      riskLevel,
      derivedScores: derived,
    }
    const genericResults = runGenericSimulation(simulationInput)
    scenarioScores = genericResults.map((r) => ({
      scenarioType: r.scenarioType,
      feasibilityScore: r.feasibilityScore,
      financialScore: r.financialScore,
      capacityScore: r.capacityScore,
      riskScore: r.riskScore,
      strategicFitScore: r.strategicFitScore,
      overallDecisionScore: r.overallDecisionScore,
    }))
  }

  return { success: true, scenarioScores }
}
