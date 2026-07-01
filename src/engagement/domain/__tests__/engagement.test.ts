/** Engagement Domain Tests — SPEC-02e pattern */
import { Engagement } from "../engagement";
import { BusinessRuleError } from "../errors";

const ORG = "org1", USER_A = "user-a";

function createEngagement() {
  return Engagement.create({ clientId: "client-1", period: "FY2026", organizationId: ORG, createdById: USER_A });
}

describe("Engagement Aggregate", () => {
  test("create sets Proposal status", () => {
    const e = createEngagement();
    expect(e.status).toBe("Proposal");
    expect(e.version).toBe(1);
  });

  test("transitions through forward stages", () => {
    const e = createEngagement()
      .transition("Accepted", "accept", USER_A)
      .transition("Planning", "plan", USER_A)
      .transition("RiskAssessment", "assess_risk", USER_A)
      .transition("Fieldwork", "start_fieldwork", USER_A)
      .transition("InReview", "submit_review", USER_A)
      .transition("Reporting", "approve_review", USER_A)
      .transition("SignOff", "report", USER_A)
      .transition("Archived", "sign_off", USER_A);
    expect(e.status).toBe("Archived");
  });

  test("supports review loop: InReview → Fieldwork → InReview", () => {
    let e = createEngagement()
      .transition("Fieldwork", "start_fieldwork", USER_A)
      .transition("InReview", "submit_review", USER_A);
    expect(e.status).toBe("InReview");

    e = e.transition("Fieldwork", "return_to_fieldwork", USER_A);
    expect(e.status).toBe("Fieldwork");
    expect(e.revisionCycles).toHaveLength(1);

    e = e.transition("InReview", "submit_review", USER_A);
    expect(e.status).toBe("InReview");
    expect(e.revisionCycles).toHaveLength(1);
  });

  test("multiple revision cycles create revision history", () => {
    let e = createEngagement()
      .transition("Fieldwork", "start_fieldwork", USER_A)
      .transition("InReview", "submit_review", USER_A);
    const rev1 = e.revisionCycles.length;

    e = e.transition("Fieldwork", "return_to_fieldwork", USER_A);
    expect(e.revisionCycles).toHaveLength(rev1 + 1);
    expect(e.revisionCycles[0].revisionNumber).toBe(1);
  });

  test("addReview appends to history", () => {
    const e = createEngagement().addReview({ level: "senior", reviewerId: "r1", decision: "approved", reason: "OK", reviewedAt: new Date().toISOString() });
    expect(e.reviewHistory).toHaveLength(1);
    expect(e.reviewHistory[0].level).toBe("senior");
  });

  test("setMateriality validates hierarchy", () => {
    expect(() => createEngagement().setMateriality({ planning: 100, performance: 200, clearlyTrivial: 300 })).toThrow(BusinessRuleError);
  });

  test("setMateriality accepts valid hierarchy", () => {
    const e = createEngagement().setMateriality({ planning: 100000, performance: 50000, clearlyTrivial: 5000 });
    expect(e.materiality?.planning).toBe(100000);
  });

  test("qualityReviewCompleted flag", () => {
    const e = createEngagement().completeQualityReview();
    expect(e.qualityReviewCompleted).toBe(true);
  });
});
