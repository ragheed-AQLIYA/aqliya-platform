import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const SalesAuditActions = {
  DEAL_CREATED: "sales.deal.created",
  DEAL_UPDATED: "sales.deal.updated",
  DEAL_STAGE_CHANGED: "sales.deal.stage_changed",
  DEAL_STATUS_CHANGED: "sales.deal.status_changed",
  DEAL_NEXT_ACTION_SET: "sales.deal.next_action_set",
  ACCOUNT_CREATED: "sales.account.created",
  ACCOUNT_UPDATED: "sales.account.updated",
  ACCOUNT_VIEWED: "sales.account.viewed",
  PIPELINE_VIEWED: "sales.pipeline.viewed",
  EVIDENCE_LINKED: "sales.evidence.linked",
  EVIDENCE_UNLINKED: "sales.evidence.unlinked",
  INTERACTION_CREATED: "sales.interaction.created",
  INTERACTION_UPDATED: "sales.interaction.updated",
  INTERACTION_DELETED: "sales.interaction.deleted",
  SIGNAL_CREATED: "sales.signal.created",
  OUTREACH_DRAFT_CREATED: "sales.outreach.draft_created",
  OUTREACH_REVIEWED: "sales.outreach.reviewed",
  GOVERNANCE_OVERRIDE: "sales.governance.override",
  GOVERNANCE_REVIEW_DECISION: "sales.governance.review_decision",
  GOVERNANCE_APPROVAL_GRANTED: "sales.governance.approval_granted",
  GOVERNANCE_APPROVAL_REJECTED: "sales.governance.approval_rejected",
  PROPOSAL_SUBMITTED: "sales.proposal.submitted",
  CONVERSION_MEMO_UPDATED: "sales.conversion_memo.updated",
  FOLLOWUP_DRAFTED: "sales.followup.drafted",
  AGENT_ICP_SCORED: "sales.agent.icp_scored",
  AGENT_DEAL_RISK_COMPUTED: "sales.agent.deal_risk_computed",
  FOLLOWUP_APPROVED: "sales.followup.approved",
  FOLLOWUP_REJECTED: "sales.followup.rejected",
  OUTREACH_DRAFT_SUBMITTED: "sales.outreach.draft_submitted",
  CLAIM_FLAGGED: "sales.claim.flagged",
  CLAIM_REVIEWED: "sales.claim.reviewed",
  RESEARCH_GENERATED: "sales.research.generated",
  RESEARCH_REVIEWED: "sales.research.reviewed",
  REPORTS_VIEWED: "sales.reports.viewed",
} as const;

export interface SalesAuditEventInput {
  organizationId: string;
  platformOrganizationId?: string | null;
  actorId: string;
  actorName?: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}

export async function recordSalesAuditEvent(
  input: SalesAuditEventInput,
): Promise<void> {
  try {
    await prisma.salesAuditEvent.create({
      data: {
        organizationId: input.organizationId,
        platformOrganizationId: input.platformOrganizationId ?? null,
        actorId: input.actorId,
        actorName: input.actorName ?? null,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        metadata: (input.metadata ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
      },
    });
  } catch (error) {
    console.warn(
      `[SalesOS] Audit event write failed: ${error instanceof Error ? error.message : "unknown"}`,
    );
  }
}
