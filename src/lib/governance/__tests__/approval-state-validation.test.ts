import { describe, expect, it } from "@jest/globals";
import {
  canTransitionApprovalState,
  getApprovalBlockingReasons,
  isFinalizationAllowed,
  requireHumanApproval,
} from "../approval-state";
import type { GovernanceTaskType, ProvenanceMetadata } from "../runtime-types";

function makeMetadata(
  overrides: Partial<ProvenanceMetadata> = {},
): ProvenanceMetadata {
  return {
    taskType: "statement_drafting",
    generatedAt: new Date().toISOString(),
    approvalState: "draft_generated",
    reviewRequired: true,
    doctrineReferences: [],
    governanceReferences: [],
    evidenceRequirements: [],
    escalationLevel: "none",
    outputBoundary: "draft_only",
    humanApprovalRequired: true,
    explainabilityMessage: "test",
    ...overrides,
  };
}

describe("governance approval state", () => {
  it("blocks AI from jumping into human approval or finalization", () => {
    expect(
      canTransitionApprovalState("draft_generated", "approved_by_human", true),
    ).toBe(false);
    expect(
      canTransitionApprovalState("approved_by_human", "finalized", true),
    ).toBe(false);
  });

  it("allows humans to make the same transitions", () => {
    expect(
      canTransitionApprovalState("draft_generated", "approved_by_human", false),
    ).toBe(true);
    expect(
      canTransitionApprovalState("approved_by_human", "finalized", false),
    ).toBe(true);
  });

  it("requires human approval for professional tasks only", () => {
    const professionalTasks: GovernanceTaskType[] = [
      "statement_drafting",
      "notes_generation",
      "audit_findings",
      "commercial_claim_review",
    ];

    for (const taskType of professionalTasks) {
      expect(requireHumanApproval(taskType)).toBe(true);
    }

    expect(requireHumanApproval("trial_balance_upload")).toBe(false);
  });

  it("only allows finalization when approved, complete, and not escalated", () => {
    expect(
      isFinalizationAllowed(
        makeMetadata({
          approvalState: "approved_by_human",
          evidenceRequirements: [
            {
              description: "Evidence",
              status: "complete",
              requiredForApproval: true,
            },
          ],
        }),
      ),
    ).toBe(true);

    expect(
      isFinalizationAllowed(
        makeMetadata({
          approvalState: "approved_by_human",
          escalationLevel: "review_required",
          evidenceRequirements: [
            {
              description: "Evidence",
              status: "complete",
              requiredForApproval: true,
            },
          ],
        }),
      ),
    ).toBe(false);
  });

  it("reports missing evidence and approval blockers", () => {
    const reasons = getApprovalBlockingReasons(
      makeMetadata({
        evidenceRequirements: [
          {
            description: "Signed support",
            status: "missing",
            requiredForApproval: true,
          },
        ],
      }),
    );

    expect(reasons.join(" ")).toContain("approved by a human");
    expect(reasons.join(" ")).toContain("Missing required evidence");
  });
});
