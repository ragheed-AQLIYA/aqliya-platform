// LC-03 — deterministic multi-reviewer approval routing (no schema change)

export const LOCAL_CONTENT_REVIEW_POLICY = {
  minDistinctReviewers: 2,
  submitActions: ["submitted"] as const,
  returnAction: "returned" as const,
} as const;

export type LocalContentReviewRow = {
  id: string;
  reviewerId: string;
  reviewerName: string;
  action: string;
  status: string;
  createdAt: Date;
};

export type LocalContentApprovalRow = {
  id: string;
  approverId: string;
  decision: string;
  createdAt: Date;
};

export type ApprovalRoutingPhase =
  | "awaiting_reviews"
  | "ready_for_approval"
  | "returned"
  | "approved"
  | "rejected";

export interface ApprovalRoutingState {
  phase: ApprovalRoutingPhase;
  requiredReviewers: number;
  distinctSubmitters: number;
  submitterIds: string[];
  slotsRemaining: number;
  hasReturn: boolean;
  canSubmitApproval: boolean;
  blockReason?: string;
}

export class ApprovalRoutingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApprovalRoutingError";
  }
}

function distinctSubmitReviews(reviews: LocalContentReviewRow[]): LocalContentReviewRow[] {
  const seen = new Set<string>();
  const result: LocalContentReviewRow[] = [];
  for (const r of [...reviews].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )) {
    if (!LOCAL_CONTENT_REVIEW_POLICY.submitActions.includes(r.action as "submitted")) {
      continue;
    }
    if (seen.has(r.reviewerId)) continue;
    seen.add(r.reviewerId);
    result.push(r);
  }
  return result;
}

function effectiveReviewsForCycle(
  reviews: LocalContentReviewRow[],
): LocalContentReviewRow[] {
  const latestReturn = [...reviews]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .find((r) => r.action === LOCAL_CONTENT_REVIEW_POLICY.returnAction);
  if (!latestReturn) return reviews;
  const returnTime = latestReturn.createdAt.getTime();
  return reviews.filter((r) => r.createdAt.getTime() > returnTime);
}

export function computeApprovalRoutingState(
  reviews: LocalContentReviewRow[],
  approvals: LocalContentApprovalRow[],
): ApprovalRoutingState {
  const requiredReviewers = LOCAL_CONTENT_REVIEW_POLICY.minDistinctReviewers;
  const latestReturn = [...reviews]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .find((r) => r.action === LOCAL_CONTENT_REVIEW_POLICY.returnAction);

  const cycleReviews = effectiveReviewsForCycle(reviews);
  const submitters = distinctSubmitReviews(cycleReviews);
  const distinctSubmitters = submitters.length;
  const slotsRemaining = Math.max(0, requiredReviewers - distinctSubmitters);

  const latestApproval = [...approvals].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )[0];

  if (latestApproval?.decision === "approved") {
    return {
      phase: "approved",
      requiredReviewers,
      distinctSubmitters,
      submitterIds: submitters.map((s) => s.reviewerId),
      slotsRemaining: 0,
      hasReturn: Boolean(latestReturn),
      canSubmitApproval: false,
      blockReason: "تم الاعتماد مسبقاً.",
    };
  }

  if (latestApproval?.decision === "rejected") {
    return {
      phase: "rejected",
      requiredReviewers,
      distinctSubmitters,
      submitterIds: submitters.map((s) => s.reviewerId),
      slotsRemaining: 0,
      hasReturn: Boolean(latestReturn),
      canSubmitApproval: false,
      blockReason: "تم رفض التقييم مسبقاً.",
    };
  }

  if (
    latestReturn &&
    distinctSubmitters < requiredReviewers &&
    cycleReviews.length > 0
  ) {
    return {
      phase: "returned",
      requiredReviewers,
      distinctSubmitters,
      submitterIds: submitters.map((s) => s.reviewerId),
      slotsRemaining,
      hasReturn: true,
      canSubmitApproval: false,
      blockReason:
        "المشروع مرتجع للتعديل — يلزم مراجعتان مستقلتان بعد الإرجاع قبل الاعتماد.",
    };
  }

  if (distinctSubmitters < requiredReviewers) {
    return {
      phase: "awaiting_reviews",
      requiredReviewers,
      distinctSubmitters,
      submitterIds: submitters.map((s) => s.reviewerId),
      slotsRemaining,
      hasReturn: Boolean(latestReturn),
      canSubmitApproval: false,
      blockReason: `يلزم ${requiredReviewers} مراجعين مستقلين (${distinctSubmitters}/${requiredReviewers} مكتمل).`,
    };
  }

  return {
    phase: "ready_for_approval",
    requiredReviewers,
    distinctSubmitters,
    submitterIds: submitters.map((s) => s.reviewerId),
    slotsRemaining: 0,
    hasReturn: Boolean(latestReturn),
    canSubmitApproval: true,
  };
}

export function validateReviewSubmission(input: {
  reviewerId: string;
  action: string;
  reviews: LocalContentReviewRow[];
}): void {
  if (input.action === LOCAL_CONTENT_REVIEW_POLICY.returnAction) {
    return;
  }

  if (
    !LOCAL_CONTENT_REVIEW_POLICY.submitActions.includes(
      input.action as "submitted",
    )
  ) {
    return;
  }

  const routing = computeApprovalRoutingState(input.reviews, []);
  if (routing.phase === "approved" || routing.phase === "rejected") {
    throw new ApprovalRoutingError(
      "لا يمكن تقديم مراجعة بعد صدور قرار اعتماد نهائي.",
    );
  }

  const alreadySubmitted = distinctSubmitReviews(input.reviews).some(
    (r) => r.reviewerId === input.reviewerId,
  );
  if (alreadySubmitted) {
    const latestReturn = [...input.reviews]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .find((r) => r.action === LOCAL_CONTENT_REVIEW_POLICY.returnAction);
    if (!latestReturn) {
      throw new ApprovalRoutingError(
        "سبق لهذا المراجع تقديم مراجعة — مطلوب مراجع مستقل آخر.",
      );
    }
    const returnTime = latestReturn.createdAt.getTime();
    const resubmitAfterReturn = input.reviews.some(
      (r) =>
        r.reviewerId === input.reviewerId &&
        r.action === "submitted" &&
        r.createdAt.getTime() > returnTime,
    );
    if (resubmitAfterReturn) {
      throw new ApprovalRoutingError(
        "سبق لهذا المراجع تقديم مراجعة بعد الإرجاع.",
      );
    }
  }
}

export function validateApprovalSubmission(input: {
  reviews: LocalContentReviewRow[];
  approvals: LocalContentApprovalRow[];
}): void {
  const routing = computeApprovalRoutingState(
    input.reviews,
    input.approvals,
  );
  if (!routing.canSubmitApproval) {
    throw new ApprovalRoutingError(
      routing.blockReason ?? "الاعتماد غير مسموح في هذه المرحلة.",
    );
  }
}
