/**
 * DecisionOS adapter for the shared decision engine.
 *
 * Moved from src/lib/core/decision/adapters/ → src/lib/decision/adapters/
 * per ADR-003 (Platform Neutrality) — product-specific adapters belong
 * in product directories, not in Core.
 */

import type { DecisionType } from "@prisma/client";
import { getDecisionTypeConfig } from "@/lib/decision/decision-type-config";
import { evaluateDecisionIntake } from "@/lib/core/decision/evaluators/intake";
import { evaluateDecisionFramework } from "@/lib/core/decision/evaluators/framework";
import { evaluateDecisionScenarios } from "@/lib/core/decision/evaluators/scenarios";
import { evaluateDecisionRiskAnalysis } from "@/lib/core/decision/evaluators/risk-analysis";
import { evaluateDecisionRecommendation } from "@/lib/core/decision/evaluators/recommendation";
import type {
  DecisionForEngine,
  DecisionCompletionState,
  DecisionEngineConfig,
  DecisionModuleConfig,
  DecisionStageState,
} from "@/lib/core/decision/types";
import {
  getDecisionCompletionState as coreGetCompletionState,
  getNextDecisionStep as coreGetNextStep,
  getDecisionProgressSummary as coreGetProgressSummary,
} from "@/lib/core/decision/engine";

// ─── Stage Evaluators ───

const stageEvaluators: Record<string, { evaluate(d: DecisionForEngine): DecisionStageState }> = {
  intake: {
    evaluate(decision: DecisionForEngine): DecisionStageState {
      const intake = evaluateDecisionIntake({
        title: decision.title,
        objectives: decision.objectives ?? undefined,
        alternatives: decision.alternatives ?? undefined,
        risks: decision.risks ?? undefined,
      });
      const status = intake.status === "accepted" ? "complete"
        : intake.status === "rejected" ? "blocked" : "incomplete";
      return { id: "intake", label: "Intake", href: "/intake", status, description: "Define objectives, alternatives, and risks" };
    },
  },
  framework: {
    evaluate(decision: DecisionForEngine): DecisionStageState {
      const intake = evaluateDecisionIntake({
        title: decision.title,
        objectives: decision.objectives ?? undefined,
        alternatives: decision.alternatives ?? undefined,
        risks: decision.risks ?? undefined,
      });
      if (intake.status !== "accepted") return { id: "framework", label: "Framework", href: "/framework", status: "blocked", description: "Capture context, purpose, options, and criteria" };
      if (!decision.framework) return { id: "framework", label: "Framework", href: "/framework", status: "not_started", description: "Capture context, purpose, options, and criteria" };
      const state = evaluateDecisionFramework(decision.framework);
      return { id: "framework", label: "Framework", href: "/framework", status: state.isComplete ? "complete" : "incomplete", description: "Capture context, purpose, options, and criteria" };
    },
  },
  scenarios: {
    evaluate(decision: DecisionForEngine): DecisionStageState {
      const intake = evaluateDecisionIntake({
        title: decision.title,
        objectives: decision.objectives ?? undefined,
        alternatives: decision.alternatives ?? undefined,
        risks: decision.risks ?? undefined,
      });
      const frameworkState = evaluateDecisionFramework(decision.framework);
      if (intake.status !== "accepted" || !frameworkState.isComplete)
        return { id: "scenarios", label: "Scenarios", href: "/scenarios", status: "blocked", description: "Define possible future paths" };
      if (!decision.decisionScenarios || decision.decisionScenarios.length === 0)
        return { id: "scenarios", label: "Scenarios", href: "/scenarios", status: "not_started", description: "Define possible future paths" };
      const state = evaluateDecisionScenarios(decision.decisionScenarios);
      return { id: "scenarios", label: "Scenarios", href: "/scenarios", status: state.isComplete ? "complete" : "incomplete", description: "Define possible future paths" };
    },
  },
  risks: {
    evaluate(decision: DecisionForEngine): DecisionStageState {
      const intake = evaluateDecisionIntake({
        title: decision.title,
        objectives: decision.objectives ?? undefined,
        alternatives: decision.alternatives ?? undefined,
        risks: decision.risks ?? undefined,
      });
      const frameworkState = evaluateDecisionFramework(decision.framework);
      const scenarioState = evaluateDecisionScenarios(decision.decisionScenarios ?? []);
      if (intake.status !== "accepted" || !frameworkState.isComplete || !scenarioState.isComplete)
        return { id: "risks", label: "Risks", href: "/risks", status: "blocked", description: "Analyze risks and trade-offs per scenario" };
      if (!decision.riskAnalyses || decision.riskAnalyses.length === 0)
        return { id: "risks", label: "Risks", href: "/risks", status: "not_started", description: "Analyze risks and trade-offs per scenario" };
      const state = evaluateDecisionRiskAnalysis(decision.decisionScenarios ?? [], decision.riskAnalyses);
      return { id: "risks", label: "Risks", href: "/risks", status: state.isComplete ? "complete" : "incomplete", description: "Analyze risks and trade-offs per scenario" };
    },
  },
  recommendation: {
    evaluate(decision: DecisionForEngine): DecisionStageState {
      if (!decision.recommendation)
        return { id: "recommendation", label: "Recommendation", href: "/recommendation", status: "not_started", description: "Define recommended action and rationale" };
      const state = evaluateDecisionRecommendation(decision.recommendation);
      return { id: "recommendation", label: "Recommendation", href: "/recommendation", status: state.isComplete ? "complete" : "incomplete", description: "Define recommended action and rationale" };
    },
  },
};

// ─── Engine Config ───

export function createDecisionOSEngineConfig(decisionType: DecisionType): DecisionEngineConfig {
  const typeConfig = getDecisionTypeConfig(decisionType);
  return {
    modules: typeConfig.modules.map((m) => ({
      id: m.id,
      label: m.label,
      href: m.href,
      description: m.description,
      required: m.required,
    })),
    getStageEvaluator(moduleId: string) {
      return stageEvaluators[moduleId] ?? null;
    },
  };
}

// ─── Public API ───

export function getDecisionOSCompletionState(decision: DecisionForEngine): DecisionCompletionState {
  const config = createDecisionOSEngineConfig(decision.type as DecisionType);
  return coreGetCompletionState(decision, config);
}

export function getDecisionOSNextStep(decision: DecisionForEngine): DecisionModuleConfig | null {
  const config = createDecisionOSEngineConfig(decision.type as DecisionType);
  return coreGetNextStep(decision, config);
}

export function getDecisionOSProgressSummary(decision: DecisionForEngine): {
  completed: number; total: number; percentage: number; nextLabel: string
} {
  const config = createDecisionOSEngineConfig(decision.type as DecisionType);
  return coreGetProgressSummary(decision, config);
}
