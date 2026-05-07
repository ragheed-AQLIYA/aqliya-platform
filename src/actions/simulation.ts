"use server"

import { prisma } from "@/lib/prisma"
import { runSimulation, type TenderInput } from "@/lib/simulation/tender-simulation"
import { generateRecommendation } from "@/lib/recommendation/tender-recommendation"
import { ScenarioType } from "@prisma/client"
import { isExpectedAccessDeniedError, requireDecisionAccess } from "@/lib/auth"

export async function runSimulationAndRecommendation(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "OPERATOR")
    // 1. Get decision with tender profile
    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      include: {
        tenderProfile: true,
        scenarios: {
          include: {
            simulation: true,
          },
        },
      },
    })

    if (!decision || !decision.tenderProfile) {
      return { success: false, error: "Decision or Tender Profile not found" }
    }

    const tender = decision.tenderProfile

    // 2. Prepare input for simulation
    const tenderInput: TenderInput = {
      estimatedContractValue: tender.estimatedContractValue,
      estimatedCost: tender.estimatedCost,
      durationMonths: tender.durationMonths,
      requiredCapacity: tender.requiredCapacity,
      internalAvailableCapacity: tender.internalAvailableCapacity,
      strategicFitScore: tender.strategicFitScore,
      riskLevel: tender.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH',
      marginEstimate: tender.marginEstimate,
    }

    // 3. Run simulation for all scenarios
    const scenarioTypes: ('BEST_CASE' | 'EXPECTED_CASE' | 'WORST_CASE')[] = ['BEST_CASE', 'EXPECTED_CASE', 'WORST_CASE']
    const results = runSimulation(tenderInput, scenarioTypes)

    // 4. Save simulation results
    for (const result of results) {
      // Find or create scenario
      let scenario = decision.scenarios.find(s => s.type === result.scenarioType)

      if (!scenario) {
        scenario = await prisma.scenario.create({
          data: {
            decisionId: decision.id,
            type: result.scenarioType as ScenarioType,
          },
          include: {
            simulation: true,
          },
        })
      }

      // Update or create simulation result
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

    // 5. Generate recommendation based on Expected Case
    const recommendationInput = {
      riskLevel: tender.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH',
      marginEstimate: tender.marginEstimate,
    }

    const recommendation = generateRecommendation(results, recommendationInput)

    // 6. Save recommendation
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

    return { success: true, data: { results, recommendation } }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error('Error running simulation:', error)
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
        scenarios: {
          include: {
            simulation: true,
          },
        },
        recommendation: true,
        tenderProfile: true,
      },
    })

    if (!decision) {
      return { success: false, error: "Decision not found" }
    }

    const scenarios = decision.scenarios.map(s => ({
      type: s.type,
      simulation: s.simulation,
    }))

    return {
      success: true,
      data: {
        scenarios,
        recommendation: decision.recommendation,
        tenderProfile: decision.tenderProfile,
      },
    }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error('Error fetching simulation results:', error)
    }
    return { success: false, error: "Failed to fetch simulation results" }
  }
}
