import { buildAuditPortfolioSnapshot } from "../portfolio-analytics";

describe("portfolio-analytics (A1-07)", () => {
  it("ranks high-risk engagements first", () => {
    const snap = buildAuditPortfolioSnapshot([
      {
        engagementId: "a",
        clientName: "A",
        fiscalPeriod: "2024",
        status: "draft",
        openFindings: 0,
        missingEvidence: 0,
        approvalCount: 0,
        lastEventAt: null,
      },
      {
        engagementId: "b",
        clientName: "B",
        fiscalPeriod: "2024",
        status: "under_review",
        openFindings: 6,
        missingEvidence: 4,
        approvalCount: 1,
        lastEventAt: null,
      },
    ]);
    expect(snap.rows[0].engagementId).toBe("b");
    expect(snap.rows[0].riskBand).toBe("high");
    expect(snap.totals.openFindings).toBe(6);
  });
});
