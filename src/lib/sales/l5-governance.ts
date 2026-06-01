import { prisma } from "@/lib/prisma";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "./audit-events";
import {
  recordReviewDecision,
  type ReviewDecision,
} from "./governance";
import {
  createSalesProposal,
  updateSalesProposalStatus,
} from "./repositories/proposals";
import {
  createSalesReview,
  listPendingSalesReviews,
  updateSalesReviewStatus,
} from "./repositories/reviews";
import { createSalesApproval } from "./repositories/approvals";
import { assertDealInOrg } from "./repositories/org-scope";
import { SALES_REVIEW_TARGET_DEAL } from "./l5-types";
import type { SalesActor, SalesOrgScope } from "./services";

export interface SubmitOpportunityReviewResult {
  reviewId: string;
  proposalId: string | null;
  metadataRecordId: string;
}

export async function submitSalesOpportunityForReview(
  scope: SalesOrgScope,
  params: {
    dealId: string;
    reason: string;
    stageSlug?: string | null;
    proposalTitle?: string | null;
    proposalDraft?: string;
  },
  actor: SalesActor,
): Promise<SubmitOpportunityReviewResult> {
  const deal = await assertDealInOrg(params.dealId, scope);
  const reason = params.reason.trim();
  if (!reason) {
    throw new Error("SalesOS validation: submission reason is required");
  }

  let proposalId: string | null = null;
  try {
    const proposal = await createSalesProposal(
      scope,
      {
        dealId: deal.id,
        title: params.proposalTitle ?? deal.title,
        draft: params.proposalDraft ?? "",
      },
      actor,
    );
    proposalId = proposal.id;
    await updateSalesProposalStatus(
      proposal.id,
      scope,
      "submitted",
      actor,
      { submittedAt: new Date() },
    );
  } catch (err) {
    console.warn(
      `[SalesOS L5] Proposal table unavailable, metadata-only fallback: ${
        err instanceof Error ? err.message : "unknown"
      }`,
    );
  }

  let reviewId = "";
  try {
    const review = await createSalesReview(
      scope,
      {
        reviewType: "opportunity_governance",
        targetType: SALES_REVIEW_TARGET_DEAL,
        targetId: deal.id,
        dealId: deal.id,
        proposalId,
        reason,
        stageSlug: params.stageSlug ?? deal.stage?.slug ?? null,
        status: "pending",
      },
      actor,
    );
    reviewId = review.id;
  } catch (err) {
    console.warn(
      `[SalesOS L5] Review table unavailable: ${
        err instanceof Error ? err.message : "unknown"
      }`,
    );
  }

  const metadataRecord = await recordReviewDecision(scope, {
    dealId: deal.id,
    decision: "pending" as ReviewDecision,
    reason,
    stageSlug: params.stageSlug ?? deal.stage?.slug ?? null,
    actor,
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.PROPOSAL_SUBMITTED,
    targetType: "SalesDeal",
    targetId: deal.id,
    metadata: {
      reviewId: reviewId || null,
      proposalId,
      reason,
    },
  });

  return {
    reviewId,
    proposalId,
    metadataRecordId: metadataRecord.id,
  };
}

export async function approveSalesOpportunity(
  scope: SalesOrgScope,
  params: {
    dealId: string;
    reviewId?: string | null;
    reason: string;
    note?: string | null;
  },
  actor: SalesActor,
) {
  const deal = await assertDealInOrg(params.dealId, scope);
  const reason = params.reason.trim();
  if (!reason) {
    throw new Error("SalesOS validation: approval reason is required");
  }

  let reviewId = params.reviewId ?? null;
  if (!reviewId) {
    try {
      const review = await createSalesReview(
        scope,
        {
          reviewType: "opportunity_governance",
          targetType: SALES_REVIEW_TARGET_DEAL,
          targetId: deal.id,
          dealId: deal.id,
          reason,
          status: "approved",
        },
        actor,
      );
      reviewId = review.id;
    } catch {
      reviewId = null;
    }
  } else {
    try {
      await updateSalesReviewStatus(reviewId, scope, "approved");
    } catch {
      /* table may not exist until migrate */
    }
  }

  if (reviewId) {
    try {
      await createSalesApproval(
        scope,
        {
          reviewId,
          kind: "opportunity_stage",
          status: "approved",
          note: params.note,
          dealId: deal.id,
        },
        actor,
      );
    } catch {
      /* table may not exist until migrate */
    }
  }

  const metadataRecord = await recordReviewDecision(scope, {
    dealId: deal.id,
    decision: "approved",
    reason,
    actor,
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.GOVERNANCE_APPROVAL_GRANTED,
    targetType: "SalesDeal",
    targetId: deal.id,
    metadata: { reviewId, reason, note: params.note ?? null },
  });

  return metadataRecord;
}

export async function rejectSalesOpportunity(
  scope: SalesOrgScope,
  params: {
    dealId: string;
    reviewId?: string | null;
    reason: string;
    note?: string | null;
  },
  actor: SalesActor,
) {
  const deal = await assertDealInOrg(params.dealId, scope);
  const reason = params.reason.trim();
  if (!reason) {
    throw new Error("SalesOS validation: rejection reason is required");
  }

  let reviewId = params.reviewId ?? null;
  if (reviewId) {
    try {
      await updateSalesReviewStatus(reviewId, scope, "rejected");
    } catch {
      reviewId = null;
    }
  }

  if (reviewId) {
    try {
      await createSalesApproval(
        scope,
        {
          reviewId,
          kind: "opportunity_stage",
          status: "rejected",
          note: params.note,
          dealId: deal.id,
        },
        actor,
      );
    } catch {
      /* optional until migrate */
    }
  }

  const metadataRecord = await recordReviewDecision(scope, {
    dealId: deal.id,
    decision: "rejected",
    reason,
    actor,
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.GOVERNANCE_APPROVAL_REJECTED,
    targetType: "SalesDeal",
    targetId: deal.id,
    metadata: { reviewId, reason },
  });

  return metadataRecord;
}

export async function submitOpportunityForReview(
  scope: SalesOrgScope,
  params: {
    dealId: string;
    reason: string;
    stageSlug?: string | null;
    title?: string | null;
    draft?: string | null;
  },
  actor: SalesActor,
) {
  return submitSalesOpportunityForReview(scope, {
    dealId: params.dealId,
    reason: params.reason,
    stageSlug: params.stageSlug,
    proposalTitle: params.title,
    proposalDraft: params.draft ?? undefined,
  }, actor);
}

export async function decideOpportunityReview(
  scope: SalesOrgScope,
  params: {
    dealId: string;
    reviewId: string;
    decision: "approved" | "rejected";
    note?: string | null;
  },
  actor: SalesActor,
) {
  const reason =
    params.note?.trim() ||
    (params.decision === "approved"
      ? "Opportunity approved"
      : "Opportunity rejected");

  if (params.decision === "approved") {
    return approveSalesOpportunity(
      scope,
      {
        dealId: params.dealId,
        reviewId: params.reviewId,
        reason,
        note: params.note,
      },
      actor,
    );
  }

  return rejectSalesOpportunity(
    scope,
    {
      dealId: params.dealId,
      reviewId: params.reviewId,
      reason,
      note: params.note,
    },
    actor,
  );
}

export async function listPendingOpportunityReviews(organizationId: string) {
  try {
    return await listPendingSalesReviews({
      organizationId,
      platformOrganizationId: null,
    });
  } catch {
    return [];
  }
}

export async function listOrgSalesApprovals(organizationId: string) {
  try {
    return prisma.salesApproval.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        review: { select: { id: true, status: true, reason: true, dealId: true } },
        deal: { select: { id: true, title: true } },
      },
    });
  } catch {
    return [];
  }
}
