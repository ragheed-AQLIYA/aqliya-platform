// ─── SalesOS deal review via review-approval contract ───

import {
  createReviewState,
  getRequiredApprovers,
  transitionReviewState,
  validateApprovalAction,
} from "@/lib/platform/contracts/review-approval-runtime";
import type {
  ReviewApprovalActor,
  ReviewApprovalPackage,
} from "@/lib/platform/contracts/review-approval-contract";
import { SALESOS_PRODUCT_KEY } from "../core-adoption";

export interface DealReviewContext {
  package: ReviewApprovalPackage;
  reviewerRoles: readonly string[];
  approverRoles: readonly string[];
  exportAllowed: boolean;
}

export function createDealReviewPackage(input: {
  opportunityId: string;
  organizationId: string;
  ownerId: string;
  evidenceComplete: boolean;
  approvalStatus?: string;
}): DealReviewContext {
  const pkg = createReviewState({
    productSlug: SALESOS_PRODUCT_KEY,
    resourceType: "SalesOpportunity",
    resourceId: input.opportunityId,
    organizationId: input.organizationId,
    ownerId: input.ownerId,
    evidenceComplete: input.evidenceComplete,
  });

  const roles = getRequiredApprovers(SALESOS_PRODUCT_KEY);

  return {
    package: pkg,
    reviewerRoles: roles.reviewerRoles,
    approverRoles: roles.approverRoles,
    exportAllowed: input.approvalStatus === "Approved" && input.evidenceComplete,
  };
}

export function submitDealForReview(
  ctx: DealReviewContext,
  actor: ReviewApprovalActor,
) {
  return transitionReviewState(ctx.package, "submit_for_review", actor);
}

export function decideDealReview(
  ctx: DealReviewContext,
  actor: ReviewApprovalActor,
  decision: "approved" | "rejected",
) {
  const check = validateApprovalAction(ctx.package, actor, decision);
  if (!check.allowed) return { allowed: false as const, reason: check.reason };
  const action = decision === "approved" ? ("approve" as const) : ("reject" as const);
  return { allowed: true as const, result: transitionReviewState(ctx.package, action, actor) };
}
