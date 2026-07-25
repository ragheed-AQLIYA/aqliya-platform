"use server"

import { createLogger } from "@/lib/observability/logger";

import { prisma } from "@/lib/prisma"
import { authorizeForDecision, isExpectedAccessDeniedError } from "../common"
import { auditLogger, Product } from "@/lib/platform/audit-logger"
import { runSimulationCore } from "./simulation"
import { persistScenarioResults } from "./persist-scenarios"
import { handleRecommendation } from "./recommendation"


const logger = createLogger({ product: "platform", action: "unknown" });

export async function runSimulationAndRecommendation(decisionId: string) {
  try {
    const user = await authorizeForDecision(decisionId)
    if (!user) {
      return { success: false, error: "Decision not found" }
    }

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

    const simResult = await runSimulationCore(decision.id, decision)
    if (!simResult.success) return simResult

    const { scenarioScores } = simResult

    await persistScenarioResults(decision.id, scenarioScores, decision.scenarios)

    await handleRecommendation(decision as Parameters<typeof handleRecommendation>[0], scenarioScores)

    try {
      const alog = auditLogger({ productKey: Product.DECISION_OS, sourceSystem: "simulation", actor: { id: user.id, name: user.name, email: user.email } });
      await alog.record("simulation.completed", { type: "Decision", id: decisionId }, { severity: "info", metadata: { scenarioCount: scenarioScores.length, decisionType: decision.type } });
    } catch { /* audit failure non-blocking */ }

    return { success: true, data: { scenarios: scenarioScores, decisionType: decision.type } }
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      logger.error("Error running simulation:", error instanceof Error ? error : undefined)
    }
    return { success: false, error: "Failed to run simulation" }
  }
}
