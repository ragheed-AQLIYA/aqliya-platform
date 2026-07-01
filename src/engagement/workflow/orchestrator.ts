/** Non-linear Workflow Orchestrator — SPEC-02c. Tests loops, guards, SLA reset. */
import { Engagement } from "../domain/engagement";
import type { EngagementStatus } from "../domain/engagement";
import { BusinessRuleError, GovernanceBlockedError } from "../domain/errors";

const TRANSITIONS: Record<string, EngagementStatus> = {
  accept: "Accepted", plan: "Planning", assess_risk: "RiskAssessment", start_fieldwork: "Fieldwork",
  submit_review: "InReview", approve_review: "Reporting", report: "SignOff", sign_off: "Archived",
  return_to_fieldwork: "Fieldwork",
};
const GUARDS: Record<string, string[]> = {
  submit_review: ["evidenceGate"],
  approve_review: ["reviewerNotOwner"],
  report: ["qualityReviewDone"],
  sign_off: ["canSignOff"],
  return_to_fieldwork: ["returnRequiresReason"],
};

export class EngagementWorkflow {
  async transition(e: Engagement, action: string, actorId: string, options?: { reason?: string }): Promise<Engagement> {
    const target = TRANSITIONS[action];
    if (!target) throw new BusinessRuleError(`Invalid action: ${action}`);

    // Guards
    const guards = GUARDS[action] ?? [];
    for (const guard of guards) {
      if (guard === "returnRequiresReason" && !options?.reason) throw new BusinessRuleError("Reason required for return");
      if (guard === "evidenceGate" && e.status !== "Fieldwork") throw new GovernanceBlockedError("Evidence incomplete", "evidence_gate");
      if (guard === "reviewerNotOwner" && actorId === e.toJSON().createdById) throw new BusinessRuleError("Reviewer cannot be author");
      if (guard === "qualityReviewDone" && !e.toJSON().qualityReviewCompleted) throw new GovernanceBlockedError("Quality review required", "quality_gate");
    }
    return e.transition(target, action, actorId);
  }
}
