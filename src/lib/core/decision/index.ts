/**
 * Decision Engine — generic multi-criteria decision evaluation.
 * IC-P3.2: Decision Engine Extraction.
 *
 * Architecture:
 *   Product → Adapter → Core Decision Engine → Evaluators
 *
 * Evaluators are pure functions with no product imports.
 * Adapters bridge product-specific config to the generic engine.
 */

// ─── Core Engine ───
export {
  DecisionEngine,
  getDecisionCompletionState,
  getNextDecisionStep,
  getDecisionProgressSummary,
} from "./engine";

export type {
  DecisionCompletionState,
  DecisionEngineConfig,
  DecisionForEngine,
  DecisionModuleConfig,
  DecisionStageState,
  StageEvaluator,
} from "./types";

// ─── Evaluators (pure, reusable) ───
export {
  evaluateDecisionIntake,
  evaluateDecisionFramework,
  evaluateDecisionScenarios,
  evaluateDecisionRiskAnalysis,
  evaluateDecisionRecommendation,
  createDefaultDecisionScenarios,
  normalizeDecisionFramework,
  normalizeDecisionScenario,
  normalizeDecisionRiskAnalysis,
  normalizeDecisionRecommendation,
  withDecisionRecommendation,
  type DecisionFrameworkInput,
  type DecisionFrameworkState,
  type DecisionIntakeInput,
  type DecisionIntakeResult,
  type DecisionScenarioInput,
  type DecisionScenariosState,
  type DecisionRiskAnalysisInput,
  type DecisionRiskAnalysisState,
  type DecisionRecommendationInput,
  type FrameworkField,
  type IntakeReasonCode,
  type IntakeStatus,
  type RecommendationField,
  type RiskAnalysisField,
  type ScenarioField,
} from "./evaluators";

// ─── Adapters ───
// DecisionOS-specific adapters moved to @/lib/decision/adapters/ per ADR-003
// Import from @/lib/decision/adapters/core-engine-adapter for product-specific engine config
