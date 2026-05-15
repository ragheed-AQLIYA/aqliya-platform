import type { DecisionType } from "@prisma/client"
import { evaluateDecisionIntake } from "./intake"
import { evaluateDecisionFramework } from "./framework"
import { evaluateDecisionScenarios } from "./scenarios"
import { evaluateDecisionRiskAnalysis } from "./risk-analysis"
import { evaluateDecisionRecommendation } from "./recommendation"
import { getDecisionTypeConfig, type DecisionModuleConfig } from "./decision-type-config"

export interface DecisionStageState {
  id: string
  label: string
  href: string
  status: "complete" | "incomplete" | "blocked" | "not_started" | "optional"
  description: string
}

export interface DecisionCompletionState {
  stages: DecisionStageState[]
  overallProgress: number
  nextStep: DecisionModuleConfig | null
  isComplete: boolean
  blockedStages: string[]
}

export interface DecisionForEngine {
  id: string
  type: DecisionType
  title: string
  status: string
  objectives?: Array<{ description: string }> | null
  alternatives?: Array<{ description: string }> | null
  risks?: Array<{ description: string; level?: string }> | null
  framework?: Record<string, string | null> | null
  decisionScenarios?: Array<{ id: string; name: string; description?: string | null }> | null
  riskAnalyses?: Array<{ scenarioId: string; risks?: string | null; tradeoffs?: string | null }> | null
  recommendation?: {
    recommendedAction?: string | null
    rationale?: string | null
    expectedNextState?: string | null
    scopeExclusions?: string | null
    assumptionsUsed?: string | null
    risksAccepted?: string | null
    risksRejected?: string | null
    humanReviewRequired?: boolean | null
  } | null
  tenderProfile?: unknown | null
}

function evaluateStageState(
  moduleId: string,
  decision: DecisionForEngine
): "complete" | "incomplete" | "blocked" | "not_started" | "optional" {
  const objectives = decision.objectives ?? undefined
  const alternatives = decision.alternatives ?? undefined
  const risks = decision.risks ?? undefined

  switch (moduleId) {
    case "intake": {
      const intake = evaluateDecisionIntake({
        title: decision.title,
        objectives,
        alternatives,
        risks,
      })
      return intake.status === "accepted" ? "complete" : intake.status === "rejected" ? "blocked" : "incomplete"
    }
    case "framework": {
      const intake = evaluateDecisionIntake({
        title: decision.title,
        objectives,
        alternatives,
        risks,
      })
      if (intake.status !== "accepted") return "blocked"
      if (!decision.framework) return "not_started"
      const state = evaluateDecisionFramework(decision.framework)
      return state.isComplete ? "complete" : "incomplete"
    }
    case "scenarios": {
      const intake = evaluateDecisionIntake({
        title: decision.title,
        objectives,
        alternatives,
        risks,
      })
      const frameworkState = evaluateDecisionFramework(decision.framework)
      if (intake.status !== "accepted" || !frameworkState.isComplete) return "blocked"
      if (!decision.decisionScenarios || decision.decisionScenarios.length === 0) return "not_started"
      const state = evaluateDecisionScenarios(decision.decisionScenarios)
      return state.isComplete ? "complete" : "incomplete"
    }
    case "risks": {
      const intake = evaluateDecisionIntake({
        title: decision.title,
        objectives,
        alternatives,
        risks,
      })
      const frameworkState = evaluateDecisionFramework(decision.framework)
      const scenarioState = evaluateDecisionScenarios(decision.decisionScenarios || [])
      if (intake.status !== "accepted" || !frameworkState.isComplete || !scenarioState.isComplete) return "blocked"
      if (!decision.riskAnalyses || decision.riskAnalyses.length === 0) return "not_started"
      const state = evaluateDecisionRiskAnalysis(decision.decisionScenarios || [], decision.riskAnalyses)
      return state.isComplete ? "complete" : "incomplete"
    }
    case "recommendation": {
      if (!decision.recommendation) return "not_started"
      const state = evaluateDecisionRecommendation(decision.recommendation)
      return state.isComplete ? "complete" : "incomplete"
    }
    default:
      return "optional"
  }
}

export function getDecisionCompletionState(decision: DecisionForEngine): DecisionCompletionState {
  const config = getDecisionTypeConfig(decision.type)
  const stages: DecisionStageState[] = config.modules.map((module) => ({
    id: module.id,
    label: module.label,
    href: module.href,
    status: module.required ? evaluateStageState(module.id, decision) : "optional",
    description: module.description,
  }))

  const requiredStages = stages.filter((s) => s.status !== "optional")
  const completedStages = requiredStages.filter((s) => s.status === "complete")
  const blockedStages = requiredStages.filter((s) => s.status === "blocked").map((s) => s.id)

  const overallProgress = requiredStages.length > 0
    ? Math.round((completedStages.length / requiredStages.length) * 100)
    : 0

  const isComplete = requiredStages.every((s) => s.status === "complete")

  const nextStep = config.modules.find((m) => {
    const stage = stages.find((s) => s.id === m.id)
    return stage && (stage.status === "not_started" || stage.status === "incomplete")
  }) || null

  return {
    stages,
    overallProgress,
    nextStep,
    isComplete,
    blockedStages,
  }
}

export function getNextDecisionStep(decision: DecisionForEngine): DecisionModuleConfig | null {
  const state = getDecisionCompletionState(decision)
  return state.nextStep
}

export function getDecisionProgressSummary(decision: DecisionForEngine): {
  completed: number
  total: number
  percentage: number
  nextLabel: string
} {
  const state = getDecisionCompletionState(decision)
  const completed = state.stages.filter((s) => s.status === "complete").length
  const total = state.stages.filter((s) => s.status !== "optional").length
  return {
    completed,
    total,
    percentage: state.overallProgress,
    nextLabel: state.nextStep?.label || "All stages complete",
  }
}
