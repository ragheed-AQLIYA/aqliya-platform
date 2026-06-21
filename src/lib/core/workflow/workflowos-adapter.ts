import "server-only";

import { WorkflowEngine } from "./engine";

export function assertWorkflowOsTransition(
  fromStatus: string,
  action: "submit" | "approve" | "return" | "archive",
): string {
  const result = WorkflowEngine.evaluateTransition({
    productKey: "workflowos",
    fromStatus,
    action,
  });
  if (!result.allowed || !result.toStatus) {
    throw new Error(result.reason ?? "Invalid WorkflowOS transition");
  }
  return result.toStatus;
}
