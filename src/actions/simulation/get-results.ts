"use server"

import { createLogger } from "@/lib/observability/logger";

import { prisma } from "@/lib/prisma"
import { deriveScores } from "@/lib/simulation/simulation-engine"
import { authorizeForDecision, buildScoringInputFromDecision, isExpectedAccessDeniedError } from "./common"

const logger = createLogger({ product: "platform", action: "unknown" });

export async function getSimulationResults(decisionId: string) {
  try {
    const user = await authorizeForDecision(decisionId)
    if (!user) {
      return { success: false, error: "Decision not found" }
    }

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

    const scoringData = buildScoringInputFromDecision(decision)

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
      logger.error("Error fetching simulation results:", error instanceof Error ? error : undefined)
    }
    return { success: false, error: "Failed to fetch simulation results" }
  }
}
