import { describe, expect, it } from "@jest/globals";
import {
  getGovernanceContext,
  listSupportedGovernanceTasks,
} from "../retrieval-router";
import type { GovernanceTaskType } from "../runtime-types";

const ALL_TASK_TYPES: GovernanceTaskType[] = [
  "trial_balance_upload",
  "account_mapping",
  "statement_drafting",
  "notes_generation",
  "evidence_review",
  "audit_findings",
  "commercial_claim_review",
  "pilot_decision",
  "approval_review",
  "disclosure_enrichment",
];

describe("governance retrieval router", () => {
  it("lists every supported governance task", () => {
    expect(listSupportedGovernanceTasks().sort()).toEqual(
      ALL_TASK_TYPES.sort(),
    );
  });

  it.each(ALL_TASK_TYPES)(
    "returns a complete context for %s",
    (taskType: GovernanceTaskType) => {
      const context = getGovernanceContext(taskType);

      expect(context.taskType).toBe(taskType);
      expect(context.doctrineReferences.length).toBeGreaterThan(0);
      expect(context.governanceReferences.length).toBeGreaterThan(0);
      expect(context.evidenceRequirements.length).toBeGreaterThan(0);
      expect(context.recommendedPromptLayers).toEqual([
        "system_doctrine",
        "product_doctrine",
        "governance",
        "evidence",
        "human_approval",
        "task_specific",
      ]);
    },
  );

  it("keeps commercial claim review behind review-required boundaries", () => {
    const context = getGovernanceContext("commercial_claim_review");

    expect(context.outputBoundary).toBe("review_required");
    expect(context.humanApprovalRequired).toBe(true);
    expect(context.escalationTriggers).toEqual(
      expect.arrayContaining([
        "commercial_overclaim_risk",
        "governance_ambiguity",
      ]),
    );
  });
});
