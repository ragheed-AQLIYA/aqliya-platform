import "server-only";

import {
  evaluateTransition,
  getProductTemplate,
  type WorkflowTransitionAction,
} from "./state-machine";

export const WorkflowEngine = {
  getProductTemplate,
  evaluateTransition,
};

export { evaluateTransition, getProductTemplate };
export type { WorkflowTransitionAction };
