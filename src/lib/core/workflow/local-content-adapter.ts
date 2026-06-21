import "server-only";

import { WorkflowEngine } from "./engine";

export function assertLocalContentGovernanceTransition(
  fromStatus: string,
  toStatus: string,
): void {
  if (fromStatus === toStatus) return;

  const template = WorkflowEngine.getProductTemplate("local_content");
  if (!template) return;

  const allowed = template.transitions.some(
    (transition) =>
      transition.from.includes(fromStatus) && transition.to === toStatus,
  );

  if (!allowed) {
    throw new Error(
      `LocalContent project transition ${fromStatus} → ${toStatus} is not allowed`,
    );
  }
}

export function inferLocalContentGovernanceAction(
  fromStatus: string,
  toStatus: string,
): "submit" | "approve" | "reject" | "return" | "archive" | null {
  const result = templateMatch(fromStatus, toStatus);
  return result?.action ?? null;
}

function templateMatch(fromStatus: string, toStatus: string) {
  const template = WorkflowEngine.getProductTemplate("local_content");
  return template?.transitions.find(
    (transition) =>
      transition.from.includes(fromStatus) && transition.to === toStatus,
  );
}
