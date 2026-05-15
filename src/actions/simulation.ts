"use server"

import { prisma } from "@/lib/prisma"
import { ScenarioType } from "@prisma/client"
import { isExpectedAccessDeniedError, requireDecisionAccess } from "@/lib/auth"
import { runGenericSimulation, canRunSimulation, type SimulationInput, buildScoringData, deriveScores } from "@/lib/simulation/simulation-engine"
import { generateRecommendation } from "@/lib/recommendation/tender-recommendation"
import { runSimulation, type TenderInput } from "@/lib/simulation/tender-simulation"
import { generateGenericRecommendation, canGenerateRecommendation, type RecommendationInput } from "@/lib/recommendation/recommendation-engine"

export async function runSimulationAndRecommendation(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "OPERATOR")

    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: {
        tenderProfile: true,
        scenarios: { include: { simulation: true } },
        decisionScenarios: true,
        risks: true,
        objectives: true,
        constraints: true,
        assumptions: true,
        alternatives: true,
        framework: true,
      },
    })

    if (!decision) {
      return { success: false, error: "Decision not found" }
    }

    let scenarioScores: Array<{
      scenarioType: string
      feasibilityScore: number
      financialScore: number
      capacityScore: number
      riskScore: number
      strategicFitScore: number
      overallDecisionScore: number
    }>

    if (decision.type === "TENDER" && decision.tenderProfile) {
      const tender = decision.tenderProfile
      const tenderInput: TenderInput = {
        estimatedContractValue: tender.estimatedContractValue,
        estimatedCost: tender.estimatedCost,
        durationMonths: tender.durationMonths,
        requiredCapacity: tender.requiredCapacity,
        internalAvailableCapacity: tender.internalAvailableCapacity,
        strategicFitScore: tender.strategicFitScore,
        riskLevel: tender.riskLevel as "LOW" | "MEDIUM" | "HIGH",
        marginEstimate: tender.marginEstimate,
      }
      const scenarioTypes: ("BEST_CASE" | "EXPECTED_CASE" | "WORST_CASE")[] = ["BEST_CASE", "EXPECTED_CASE", "WORST_CASE"]
      const tenderResults = runSimulation(tenderInput, scenarioTypes)
      scenarioScores = tenderResults.map((r) => ({
        scenarioType: r.scenarioType,
        feasibilityScore: r.feasibilityScore,
        financialScore: r.financialScore,
        capacityScore: r.capacityScore,
        riskScore: r.riskScore,
        strategicFitScore: r.strategicFitScore,
        overallDecisionScore: r.overallDecisionScore,
      }))
    } else {
      const scoringData = buildScoringData({
        objectives: decision.objectives,
        constraints: decision.constraints,
        assumptions: decision.assumptions,
        alternatives: decision.alternatives,
        risks: decision.risks,
        framework: decision.framework ? {
          context: decision.framework.context,
          purpose: decision.framework.purpose,
          options: decision.framework.options,
          criteria: decision.framework.criteria,
          values: decision.framework.values,
          informationGaps: decision.framework.informationGaps,
          certainty: decision.framework.certainty,
          assumptions: decision.framework.assumptions,
        } : null,
        decisionScenarios: decision.decisionScenarios,
        priority: decision.priority,
        targetDate: decision.targetDate,
      })

      const derived = deriveScores(scoringData)

      const riskLevel = (decision.risks?.[0]?.level as "LOW" | "MEDIUM" | "HIGH") ?? "MEDIUM"

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

    for (const result of scenarioScores) {
      let scenario = decision.scenarios.find((s) => s.type === result.scenarioType)

      if (!scenario) {
        scenario = await prisma.scenario.create({
          data: {
            decisionId: decision.id,
            type: result.scenarioType as ScenarioType,
          },
          include: { simulation: true },
        })
      }

      if (scenario.simulation) {
        await prisma.simulationResult.update({
          where: { id: scenario.simulation.id },
          data: {
            feasibilityScore: result.feasibilityScore,
            financialScore: result.financialScore,
            capacityScore: result.capacityScore,
            riskScore: result.riskScore,
            strategicFitScore: result.strategicFitScore,
            overallDecisionScore: result.overallDecisionScore,
          },
        })
      } else {
        await prisma.simulationResult.create({
          data: {
            decisionId: decision.id,
            scenarioId: scenario.id,
            feasibilityScore: result.feasibilityScore,
            financialScore: result.financialScore,
            capacityScore: result.capacityScore,
            riskScore: result.riskScore,
            strategicFitScore: result.strategicFitScore,
            overallDecisionScore: result.overallDecisionScore,
          },
        })
      }
    }

    if (decision.type === "TENDER" && decision.tenderProfile) {
      const recommendationInput = {
        riskLevel: decision.tenderProfile.riskLevel as "LOW" | "MEDIUM" | "HIGH",
        marginEstimate: decision.tenderProfile.marginEstimate,
      }
      const recommendation = generateRecommendation(scenarioScores as Parameters<typeof generateRecommendation>[0], recommendationInput)

      const existingRecommendation = await prisma.recommendation.findUnique({
        where: { decisionId: decision.id },
      })

      if (existingRecommendation) {
        await prisma.recommendation.update({
          where: { id: existingRecommendation.id },
          data: {
            recommendedAction: recommendation.recommendedAction,
            rationale: recommendation.rationale,
            expectedNextState: recommendation.expectedNextState,
            scopeExclusions: recommendation.scopeExclusions,
            assumptionsUsed: recommendation.assumptionsUsed,
            risksAccepted: recommendation.risksAccepted,
            risksRejected: recommendation.risksRejected,
            humanReviewRequired: recommendation.humanReviewRequired,
          },
        })
      } else {
        await prisma.recommendation.create({
          data: {
            decisionId: decision.id,
            recommendedAction: recommendation.recommendedAction,
            rationale: recommendation.rationale,
            expectedNextState: recommendation.expectedNextState,
            scopeExclusions: recommendation.scopeExclusions,
            assumptionsUsed: recommendation.assumptionsUsed,
            risksAccepted: recommendation.risksAccepted,
            risksRejected: recommendation.risksRejected,
            humanReviewRequired: recommendation.humanReviewRequired,
          },
        })
      }
    } else {
      const riskLevel = (decision.risks?.[0]?.level as "LOW" | "MEDIUM" | "HIGH") ?? "MEDIUM"

      const scoringData = buildScoringData({
        objectives: decision.objectives,
        constraints: decision.constraints,
        assumptions: decision.assumptions,
        alternatives: decision.alternatives,
        risks: decision.risks,
        framework: decision.framework ? {
          context: decision.framework.context,
          purpose: decision.framework.purpose,
          options: decision.framework.options,
          criteria: decision.framework.criteria,
          values: decision.framework.values,
          informationGaps: decision.framework.informationGaps,
          certainty: decision.framework.certainty,
          assumptions: decision.framework.assumptions,
        } : null,
        decisionScenarios: decision.decisionScenarios,
        priority: decision.priority,
        targetDate: decision.targetDate,
      })

      const derived = deriveScores(scoringData)

      const recommendationInput: RecommendationInput = {
        decisionId: decision.id,
        decisionType: decision.type,
        scenarioScores,
        riskLevel,
        strategicFitScore: derived.strategicFitScore,
        priority: decision.priority ?? undefined,
        targetDate: decision.targetDate,
        workflowComplete: derived.missingInputs.length === 0,
        missingInputs: derived.missingInputs.length > 0 ? derived.missingInputs : undefined,
      }

      const prereqs = canGenerateRecommendation(recommendationInput)
      if (!prereqs.canRun) {
        console.warn("Cannot generate recommendation:", prereqs.missingInputs)
      } else {
        const recommendation = generateGenericRecommendation(recommendationInput)

        const existingRecommendation = await prisma.recommendation.findUnique({
          where: { decisionId: decision.id },
        })

        const recData = {
          decisionId: decision.id,
          recommendedAction: recommendation.recommendedAction,
          rationale: recommendation.rationale,
          expectedNextState: recommendation.expectedNextState,
          scopeExclusions: recommendation.scopeExclusions,
          assumptionsUsed: recommendation.assumptionsUsed,
          risksAccepted: recommendation.risksAccepted,
          risksRejected: recommendation.risksRejected,
          humanReviewRequired: recommendation.humanReviewRequired,
        }

        if (existingRecommendation) {
          await prisma.recommendation.update({
            where: { id: existingRecommendation.id },
            data: recData,
          })
        } else {
          await prisma.recommendation.create({
            data: recData,
          })
        }
      }
    }

    return { success: true, data: { scenarios: scenarioScores, decisionType: decision.type } }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error running simulation:", error)
    }
    return { success: false, error: "Failed to run simulation" }
  }
}

export async function getSimulationResults(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "OPERATOR")
    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: {
        scenarios: { include: { simulation: true } },
        decisionScenarios: true,
        recommendation: true,
        tenderProfile: true,
        objectives: true,
        constraints: true,
        assumptions: true,
        alternatives: true,
        risks: true,
        framework: true,
      },
    })

    if (!decision) {
      return { success: false, error: "Decision not found" }
    }

    const scenarios = decision.scenarios.map((s) => ({
      type: s.type,
      simulation: s.simulation,
    }))

      const scoringData = buildScoringData({
        objectives: decision.objectives,
        constraints: decision.constraints,
        assumptions: decision.assumptions,
        alternatives: decision.alternatives,
        risks: decision.risks,
        framework: decision.framework ? {
          context: decision.framework.context,
          purpose: decision.framework.purpose,
          options: decision.framework.options,
          criteria: decision.framework.criteria,
          values: decision.framework.values,
          informationGaps: decision.framework.informationGaps,
          certainty: decision.framework.certainty,
          assumptions: decision.framework.assumptions,
        } : null,
        decisionScenarios: decision.decisionScenarios,
        priority: decision.priority,
        targetDate: decision.targetDate,
      })

    const derived = deriveScores(scoringData)
    const { getScoreDrivers } = await import("@/lib/simulation/decision-scoring")
    const scoreDrivers = getScoreDrivers(scoringData)

    return {
      success: true,
      data: {
        scenarios,
        recommendation: decision.recommendation,
        tenderProfile: decision.type === "TENDER" ? decision.tenderProfile : null,
        decisionType: decision.type,
        derivedScores: derived,
        scoreDrivers,
      },
    }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching simulation results:", error)
    }
    return { success: false, error: "Failed to fetch simulation results" }
  }
}
