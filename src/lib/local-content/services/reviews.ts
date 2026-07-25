import {
  prisma,
  createLocalContentAuditEvent,
  AuditActions,
  computeApprovalRoutingState,
  validateApprovalSubmission,
  validateReviewSubmission,
  type ApprovalRoutingState,
} from "./common";

export async function listReviews(projectId: string) {
  return prisma.localContentReview.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getProjectApprovalRoutingState(
  projectId: string,
): Promise<ApprovalRoutingState> {
  const [reviews, approvals] = await Promise.all([
    listReviews(projectId),
    listApprovals(projectId),
  ]);
  return computeApprovalRoutingState(reviews, approvals);
}

export async function createReview(input: {
  projectId: string;
  reviewerId: string;
  reviewerName: string;
  action: string;
  comments?: string;
}) {
  const existing = await listReviews(input.projectId);
  validateReviewSubmission({
    reviewerId: input.reviewerId,
    action: input.action,
    reviews: existing,
  });

  const reviewStatus =
    input.action === "returned"
      ? "returned"
      : input.action === "submitted"
        ? "completed"
        : "in_review";

  const review = await prisma.localContentReview.create({
    data: {
      projectId: input.projectId,
      reviewerId: input.reviewerId,
      reviewerName: input.reviewerName,
      action: input.action,
      comments: input.comments ?? null,
      status: reviewStatus,
    },
  });

  await createLocalContentAuditEvent({
    projectId: review.projectId,
    actorId: input.reviewerId,
    actorName: input.reviewerName,
    action: AuditActions.REVIEW_SUBMITTED,
    entityType: "LocalContentReview",
    entityId: review.id,
    metadata: { action: input.action },
  });

  return review;
}

export async function listApprovals(projectId: string) {
  return prisma.localContentApproval.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function createApproval(input: {
  projectId: string;
  approverId: string;
  approverName: string;
  decision: string;
  comments?: string;
  snapshot?: Record<string, unknown>;
}) {
  const [reviews, approvals] = await Promise.all([
    listReviews(input.projectId),
    listApprovals(input.projectId),
  ]);
  validateApprovalSubmission({ reviews, approvals });

  const approval = await prisma.localContentApproval.create({
    data: {
      projectId: input.projectId,
      approverId: input.approverId,
      approverName: input.approverName,
      decision: input.decision,
      comments: input.comments ?? null,
      approvalSnapshot: (input.snapshot ?? undefined) as unknown as
        | import("@prisma/client").Prisma.InputJsonValue
        | undefined,
    },
  });

  await createLocalContentAuditEvent({
    projectId: approval.projectId,
    actorId: input.approverId,
    actorName: input.approverName,
    action: AuditActions.APPROVAL_DECIDED,
    entityType: "LocalContentApproval",
    entityId: approval.id,
    after: JSON.stringify({ decision: approval.decision }),
  });

  return approval;
}
