import type {
  DecisionForEngine,
  DecisionCompletionState,
  DecisionStageState,
  DecisionEngineConfig,
} from "./types";

/**
 * Generic Decision Engine — evaluates multi-stage decision completion.
 * Driven by a DecisionEngineConfig that maps module IDs to stage evaluators.
 * No product-specific imports.
 */
function evaluateStageState(
  moduleId: string,
  decision: DecisionForEngine,
  config: DecisionEngineConfig,
): DecisionStageState {
  const evaluator = config.getStageEvaluator(moduleId);
  if (!evaluator) {
    const moduleConfig = config.modules.find((m) => m.id === moduleId);
    return {
      id: moduleId,
      label: moduleConfig?.label ?? moduleId,
      href: moduleConfig?.href ?? `/${moduleId}`,
      status: "optional",
      description: moduleConfig?.description ?? "",
    };
  }
  return evaluator.evaluate(decision);
}

export function getDecisionCompletionState(
  decision: DecisionForEngine,
  config: DecisionEngineConfig,
): DecisionCompletionState {
  const stages: DecisionStageState[] = config.modules.map((module) =>
    evaluateStageState(module.id, decision, config),
  );

  const requiredStages = stages.filter((s) => s.status !== "optional");
  const completedStages = requiredStages.filter((s) => s.status === "complete");
  const blockedStages = requiredStages.filter((s) => s.status === "blocked").map((s) => s.id);

  const overallProgress = requiredStages.length > 0
    ? Math.round((completedStages.length / requiredStages.length) * 100)
    : 0;

  const isComplete = requiredStages.every((s) => s.status === "complete");

  const nextStep = config.modules.find((m) => {
    const stage = stages.find((s) => s.id === m.id);
    return stage && (stage.status === "not_started" || stage.status === "incomplete");
  }) ?? null;

  return { stages, overallProgress, nextStep, isComplete, blockedStages };
}

export function getNextDecisionStep(
  decision: DecisionForEngine,
  config: DecisionEngineConfig,
): DecisionModuleConfig | null {
  const state = getDecisionCompletionState(decision, config);
  return state.nextStep;
}

export function getDecisionProgressSummary(
  decision: DecisionForEngine,
  config: DecisionEngineConfig,
): { completed: number; total: number; percentage: number; nextLabel: string } {
  const state = getDecisionCompletionState(decision, config);
  const completed = state.stages.filter((s) => s.status === "complete").length;
  const total = state.stages.filter((s) => s.status !== "optional").length;
  return {
    completed,
    total,
    percentage: state.overallProgress,
    nextLabel: state.nextStep?.label ?? "All stages complete",
  };
}

export const DecisionEngine = {
  getCompletionState: getDecisionCompletionState,
  getNextStep: getNextDecisionStep,
  getProgressSummary: getDecisionProgressSummary,
};

import type { DecisionModuleConfig } from "./types";
