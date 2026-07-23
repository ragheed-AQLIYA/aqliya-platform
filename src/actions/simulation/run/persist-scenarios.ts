"use server"

import { prisma } from "@/lib/prisma"
import { ScenarioType } from "@prisma/client"
import type { ScenarioScore } from "./common"

export async function persistScenarioResults(
  decisionId: string,
  scenarioScores: ScenarioScore[],
  existingScenarios: { id: string; type: string; simulation: { id: string } | null }[],
): Promise<void> {
  const missingScenarios = scenarioScores.filter(
    (r) => !existingScenarios.find((s) => s.type === r.scenarioType),
  )

  if (missingScenarios.length > 0) {
    await prisma.scenario.createMany({
      data: missingScenarios.map((r) => ({
        decisionId,
        type: r.scenarioType as ScenarioType,
      })),
    })
    const createdScenarios = await prisma.scenario.findMany({
      where: {
        decisionId,
        type: { in: missingScenarios.map((r) => r.scenarioType as ScenarioType) },
      },
      include: { simulation: true },
    })
    existingScenarios.push(...createdScenarios)
  }

  const toUpdate: { scenarioId: string; scenarioType: string }[] = []
  const toCreate: ScenarioScore[] = []

  for (const result of scenarioScores) {
    const scenario = existingScenarios.find((s) => s.type === result.scenarioType)
    if (scenario?.simulation) {
      toUpdate.push({ scenarioId: scenario.simulation.id, scenarioType: result.scenarioType })
    } else if (scenario) {
      toCreate.push(result)
    }
  }

  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate.map((u) => {
        const result = scenarioScores.find((r) => r.scenarioType === u.scenarioType)!
        return prisma.simulationResult.update({
          where: { id: u.scenarioId },
          data: {
            feasibilityScore: result.feasibilityScore,
            financialScore: result.financialScore,
            capacityScore: result.capacityScore,
            riskScore: result.riskScore,
            strategicFitScore: result.strategicFitScore,
            overallDecisionScore: result.overallDecisionScore,
          },
        })
      }),
    )
  }

  if (toCreate.length > 0) {
    const scenarioMap = new Map(existingScenarios.map((s) => [s.type, s]))
    await prisma.simulationResult.createMany({
      data: toCreate.map((r) => ({
        decisionId,
        scenarioId: scenarioMap.get(r.scenarioType as ScenarioType)!.id,
        feasibilityScore: r.feasibilityScore,
        financialScore: r.financialScore,
        capacityScore: r.capacityScore,
        riskScore: r.riskScore,
        strategicFitScore: r.strategicFitScore,
        overallDecisionScore: r.overallDecisionScore,
      })),
    })
  }
}
