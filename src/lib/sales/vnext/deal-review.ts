// ─── SalesOS deal review via review-approval contract ───

import { SALESOS_PRODUCT_KEY } from "../core-adoption";

// SALESOS_VNEXT_PLACEHOLDER: inline type — replace when @/lib/platform/contracts/review-approval-contract exists
interface ReviewApprovalActor {
  id: string;
  role: string;
}

// SALESOS_VNEXT_PLACEHOLDER: inline type — replace when @/lib/platform/contracts/review-approval-contract exists
interface ReviewApprovalPackage {
  id: string;
  productSlug: string;
  resourceType: string;
  resourceId: string;
  organizationId: string;
  ownerId: string;
  evidenceComplete: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  reviewerRoles: string[];
  approverRoles: string[];
  currentApprovers: { id: string; role: string }[];
  actions: { action: string; actorId: string; timestamp: string }[];
}

// SALESOS_VNEXT_PLACEHOLDER: inline stub — replace when @/lib/platform/contracts/review-approval-runtime exists
function createReviewState(input: {
  productSlug: string;
  resourceType: string;
  resourceId: string;
  organizationId: string;
  ownerId: string;
  evidenceComplete: boolean;
}): ReviewApprovalPackage {
  throw new Error("TODO: SalesOS vnext placeholder — implement when @/lib/platform/contracts/review-approval-runtime exists");
}

// SALESOS_VNEXT_PLACEHOLDER: inline stub — replace when @/lib/platform/contracts/review-approval-runtime exists
function getRequiredApprovers(productSlug: string): { reviewerRoles: string[]; approverRoles: string[] } {
  throw new Error("TODO: SalesOS vnext placeholder — implement when @/lib/platform/contracts/review-approval-runtime exists");
}

// SALESOS_VNEXT_PLACEHOLDER: inline stub — replace when @/lib/platform/contracts/review-approval-runtime exists
function transitionReviewState(pkg: ReviewApprovalPackage, action: string, actor: ReviewApprovalActor): unknown {
  throw new Error("TODO: SalesOS vnext placeholder — implement when @/lib/platform/contracts/review-approval-runtime exists");
}

// SALESOS_VNEXT_PLACEHOLDER: inline stub — replace when @/lib/platform/contracts/review-approval-runtime exists
function validateApprovalAction(pkg: ReviewApprovalPackage, actor: ReviewApprovalActor, decision: string): { allowed: boolean; reason?: string } {
  throw new Error("TODO: SalesOS vnext placeholder — implement when @/lib/platform/contracts/review-approval-runtime exists");
}

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
