import {
  computeApprovalRoutingState,
  validateApprovalSubmission,
  validateReviewSubmission,
  ApprovalRoutingError,
  LOCAL_CONTENT_REVIEW_POLICY,
} from "../approval-routing";

function review(
  id: string,
  reviewerId: string,
  action: string,
  at: string,
  status = "completed",
) {
  return {
    id,
    reviewerId,
    reviewerName: reviewerId,
    action,
    status,
    createdAt: new Date(at),
  };
}

describe("LC-03 approval routing", () => {
  it("requires two distinct submitters before approval", () => {
    const state = computeApprovalRoutingState(
      [review("r1", "u1", "submitted", "2026-01-01")],
      [],
    );
    expect(state.phase).toBe("awaiting_reviews");
    expect(state.distinctSubmitters).toBe(1);
    expect(state.canSubmitApproval).toBe(false);
    expect(() =>
      validateApprovalSubmission({
        reviews: [review("r1", "u1", "submitted", "2026-01-01")],
        approvals: [],
      }),
    ).toThrow(ApprovalRoutingError);
  });

  it("allows approval after two independent reviewers", () => {
    const reviews = [
      review("r1", "u1", "submitted", "2026-01-01"),
      review("r2", "u2", "submitted", "2026-01-02"),
    ];
    const state = computeApprovalRoutingState(reviews, []);
    expect(state.phase).toBe("ready_for_approval");
    expect(state.canSubmitApproval).toBe(true);
    expect(() => validateApprovalSubmission({ reviews, approvals: [] })).not.toThrow();
  });

  it("blocks duplicate reviewer in the same cycle", () => {
    const reviews = [review("r1", "u1", "submitted", "2026-01-01")];
    expect(() =>
      validateReviewSubmission({
        reviewerId: "u1",
        action: "submitted",
        reviews,
      }),
    ).toThrow(ApprovalRoutingError);
  });

  it("resets cycle after return and requires two new reviewers", () => {
    const reviews = [
      review("r1", "u1", "submitted", "2026-01-01"),
      review("r2", "u2", "submitted", "2026-01-02"),
      review("r3", "u3", "returned", "2026-01-03"),
      review("r4", "u4", "submitted", "2026-01-04"),
    ];
    const state = computeApprovalRoutingState(reviews, []);
    expect(state.phase).toBe("returned");
    expect(state.distinctSubmitters).toBe(1);
    expect(state.requiredReviewers).toBe(
      LOCAL_CONTENT_REVIEW_POLICY.minDistinctReviewers,
    );
  });
});
