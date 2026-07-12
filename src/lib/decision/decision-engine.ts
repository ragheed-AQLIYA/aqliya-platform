/**
 * Backward-compatible re-export. Decision Engine moved to @/lib/core/decision/.
 * Core engine is generic (interface-driven). DecisionOS uses adapter with
 * DecisionOS-specific stage evaluators and type config.
 *
 * New code should import from @/lib/core/decision instead.
 */
export {
  getDecisionOSCompletionState as getDecisionCompletionState,
  getDecisionOSNextStep as getNextDecisionStep,
  getDecisionOSProgressSummary as getDecisionProgressSummary,
} from "@/lib/decision/adapters/core-engine-adapter";

export type {
  DecisionStageState,
  DecisionCompletionState,
  DecisionForEngine,
} from "@/lib/core/decision/types";
