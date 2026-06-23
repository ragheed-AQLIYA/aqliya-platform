import type { WorkflowContext } from "@/lib/audit/workflow-gating";
import {
  getEngagementStatusLabel,
  getNextWorkflowAction,
  getOperatorStatusDisplay,
  getWorkflowProgressStep,
} from "@/lib/audit/workflow-next-action";

const ENGAGEMENT_ID = "eng-test-001";

function baseContext(overrides: Partial<WorkflowContext> = {}): WorkflowContext {
  return {
    engagementStatus: "in_progress",
    hasTrialBalance: false,
    hasMappings: false,
    hasConfirmedMappings: false,
    hasFinancialStatements: false,
    hasNotes: false,
    hasEvidence: false,
    hasFindings: false,
    hasRecommendations: false,
    hasReviewActivity: false,
    isApproved: false,
    isPublished: false,
    governanceFinalizationAllowed: false,
    ...overrides,
  };
}

describe("AuditOS workflow-next-action", () => {
  it("routes empty engagement to trial balance upload", () => {
    const action = getNextWorkflowAction(ENGAGEMENT_ID, baseContext(), []);
    expect(action.href).toContain("/trial-balance");
    expect(action.label).toMatch(/ميزان/);
  });

  it("routes mapped-but-unconfirmed engagement to mapping", () => {
    const action = getNextWorkflowAction(
      ENGAGEMENT_ID,
      baseContext({ hasTrialBalance: true, hasMappings: true }),
      [],
    );
    expect(action.href).toContain("/mapping");
    expect(action.urgent).toBe(false);
  });

  it("prioritizes blocking issues before approval", () => {
    const action = getNextWorkflowAction(
      ENGAGEMENT_ID,
      baseContext({
        hasTrialBalance: true,
        hasConfirmedMappings: true,
        hasFinancialStatements: true,
        hasNotes: true,
        hasEvidence: true,
        hasFindings: true,
        hasRecommendations: true,
        hasReviewActivity: true,
      }),
      ["Missing partner sign-off"],
    );
    expect(action.href).toContain("/approval");
    expect(action.urgent).toBe(true);
    expect(action.reason).toContain("Missing partner sign-off");
  });

  it("routes approved engagement toward publication", () => {
    const action = getNextWorkflowAction(
      ENGAGEMENT_ID,
      baseContext({
        hasTrialBalance: true,
        hasConfirmedMappings: true,
        hasFinancialStatements: true,
        hasNotes: true,
        hasEvidence: true,
        hasFindings: true,
        hasRecommendations: true,
        hasReviewActivity: true,
        isApproved: true,
      }),
      [],
    );
    expect(action.href).toContain("/publication");
  });

  it("maps progress step from next action href", () => {
    const step = getWorkflowProgressStep(
      ENGAGEMENT_ID,
      baseContext({ hasTrialBalance: true }),
      [],
    );
    expect(step).toBeGreaterThanOrEqual(1);
  });

  it("shows blocked operator status when blocking issues exist", () => {
    const display = getOperatorStatusDisplay("in_progress", ["Gate failed"]);
    expect(display.label).toBe("معوق");
    expect(display.tone).toBe("error");
  });

  it("labels known engagement statuses in Arabic", () => {
    expect(getEngagementStatusLabel("approved")).toBe("معتمد");
    expect(getEngagementStatusLabel("published")).toBe("منشور");
  });
});
