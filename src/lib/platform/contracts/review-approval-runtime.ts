import type { ReviewApprovalActor, ReviewApprovalPackage } from "./review-approval-contract";

export function createReviewState(input: {
  resourceType: string;
  resourceId: string;
  organizationId: string;
  productSlug: string;
  submittedBy: ReviewApprovalActor;
  assignedReviewers: ReviewApprovalActor[];
}): ReviewApprovalPackage {
  return {
    id: `review-${input.resourceType}-${input.resourceId}-${Date.now()}`,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    organizationId: input.organizationId,
    productSlug: input.productSlug,
    status: "draft",
    submittedBy: input.submittedBy,
    assignedReviewers: input.assignedReviewers,
    decisions: [],
    currentCycle: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getRequiredApprovers(
  _productSlug: string,
  _resourceType: string,
): number {
  return 1;
}

export function transitionReviewState(
  pkg: ReviewApprovalPackage,
  actor: ReviewApprovalActor,
  decision: "approved" | "rejected" | "amend",
  comment?: string,
): ReviewApprovalPackage {
  const updated: ReviewApprovalPackage = {
    ...pkg,
    decisions: [
      ...pkg.decisions,
      { actor, decision, comment, timestamp: new Date().toISOString() },
    ],
    updatedAt: new Date().toISOString(),
  };
  if (decision === "approved" && updated.decisions.length >= 1) {
    updated.status = "approved";
  } else if (decision === "rejected") {
    updated.status = "rejected";
  } else if (decision === "amend") {
    updated.status = "amend";
    updated.currentCycle += 1;
  }
  return updated;
}

export function validateApprovalAction(
  _pkg: ReviewApprovalPackage,
  _actor: ReviewApprovalActor,
): { valid: boolean; reason?: string } {
  return { valid: true };
}
