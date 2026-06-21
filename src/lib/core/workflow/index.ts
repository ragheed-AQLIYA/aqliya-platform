export {
  WorkflowEngine,
  evaluateTransition,
  getProductTemplate,
} from "./engine";

export type { WorkflowTransitionAction } from "./engine";

export { assertWorkflowOsTransition } from "./workflowos-adapter";
export { assertDecisionOsTransition } from "./decision-os-adapter";
export {
  assertLocalContentGovernanceTransition,
  inferLocalContentGovernanceAction,
} from "./local-content-adapter";

export type {
  ProductWorkflowTemplate,
  WorkflowTransition,
  WorkflowTransitionAction as TransitionAction,
} from "./state-machine";
