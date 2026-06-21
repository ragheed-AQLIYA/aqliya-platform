import "server-only";

import { WorkflowEngine } from "./engine";

export function assertDecisionOsTransition(
  fromStatus: string,
  action: "submit" | "approve" | "reject" | "return",
): string | null {
  const result = WorkflowEngine.evaluateTransition({
    productKey: "decisionos",
    fromStatus,
    action,
  });
  if (!result.allowed) {
    throw new Error(result.reason ?? "Invalid DecisionOS transition");
  }
  return result.toStatus ?? null;
}
