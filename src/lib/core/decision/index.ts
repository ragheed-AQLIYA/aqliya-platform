/**
 * Decision Engine facade — foundation for cross-product decision evaluation.
 * IC-P3.2: Decision Engine Extraction (facade phase).
 */
export {
  getDecisionCompletionState,
  getNextDecisionStep,
  getDecisionProgressSummary,
  type DecisionCompletionState,
  type DecisionStageState,
  type DecisionForEngine,
} from "@/lib/decision/decision-engine";
