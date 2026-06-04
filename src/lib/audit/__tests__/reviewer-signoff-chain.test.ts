import { buildReviewerSignoffChain } from "../reviewer-signoff-chain";

describe("reviewer-signoff-chain (A1-08)", () => {
  it("completes chain when fieldwork, review, and partner approve", () => {
    const chain = buildReviewerSignoffChain({
      engagementStatus: "ready_for_approval",
      hasTrialBalance: true,
      hasStatements: true,
      openReviewComments: 0,
      approvalRecords: [
        {
          approverRole: "reviewer",
          approverName: "Reviewer",
          action: "approved",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
        {
          approverRole: "partner",
          approverName: "Partner",
          action: "approved",
          createdAt: "2026-01-02T00:00:00.000Z",
        },
      ],
    });
    expect(chain.overallProgressPct).toBe(100);
    expect(chain.stages.every((s) => s.status === "complete")).toBe(true);
  });

  it("blocks partner stage when review comments remain open", () => {
    const chain = buildReviewerSignoffChain({
      engagementStatus: "under_review",
      hasTrialBalance: true,
      hasStatements: true,
      openReviewComments: 2,
      approvalRecords: [],
    });
    const partner = chain.stages.find((s) => s.key === "partner_signoff");
    expect(partner?.status).toBe("blocked");
  });
});
