import { prisma } from "@/lib/prisma"
import { evaluateDecisionIntake } from "@/lib/decision/intake"
import { evaluateDecisionFramework } from "@/lib/decision/framework"
import { evaluateDecisionScenarios } from "@/lib/decision/scenarios"
import { evaluateDecisionRiskAnalysis } from "@/lib/decision/risk-analysis"

export type GateMissingReason =
  | "intake_not_accepted"
  | "framework_incomplete"
  | "scenarios_missing"
  | "scenarios_incomplete"
  | "risks_missing"
  | "risks_incomplete"

export interface GateResult {
  allowed: boolean
  missing: GateMissingReason[]
}

export async function validateRecommendationGate(decisionId: string): Promise<GateResult> {
  const decision = await prisma.decision.findUnique({
    where: { id: decisionId },
    include: {
      objectives: true,
      alternatives: true,
      risks: true,
      framework: true,
      decisionScenarios: {
        orderBy: { createdAt: 'asc' },
      },
      riskAnalyses: {
        include: { scenario: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!decision) {
    return { allowed: false, missing: ["intake_not_accepted"] }
  }

  const missing: GateMissingReason[] = []

  const intake = evaluateDecisionIntake({
    title: decision.title,
    objectives: decision.objectives,
    alternatives: decision.alternatives,
    risks: decision.risks,
  })

  if (intake.status !== "accepted") {
    missing.push("intake_not_accepted")
  }

  const frameworkState = evaluateDecisionFramework(decision.framework)

  if (!decision.framework || !frameworkState.isComplete) {
    missing.push("framework_incomplete")
  }

  const scenarioState = evaluateDecisionScenarios(decision.decisionScenarios)

  if (decision.decisionScenarios.length < 3) {
    missing.push("scenarios_missing")
  }

  if (!scenarioState.isComplete) {
    missing.push("scenarios_incomplete")
  }

  const riskAnalysisState = evaluateDecisionRiskAnalysis(
    decision.decisionScenarios,
    decision.riskAnalyses
  )

  if (riskAnalysisState.missingScenarioAnalyses.length > 0) {
    missing.push("risks_missing")
  }

  if (riskAnalysisState.incompleteAnalyses.length > 0) {
    missing.push("risks_incomplete")
  }

  return {
    allowed: missing.length === 0,
    missing,
  }
}
