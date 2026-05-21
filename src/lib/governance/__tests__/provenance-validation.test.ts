import { describe, expect, it } from "@jest/globals";
import {
  attachEvidenceStatus,
  createDraftProvenance,
  explainProvenance,
  markApprovedByHuman,
  markEscalated,
  markReviewRequired,
} from "../provenance";
import { getGovernanceContext } from "../retrieval-router";

describe("governance provenance", () => {
  it("creates a draft provenance record from governance context", () => {
    const context = getGovernanceContext("statement_drafting");
    const metadata = createDraftProvenance({
      taskType: context.taskType,
      doctrineReferences: context.doctrineReferences,
      governanceReferences: context.governanceReferences,
      evidenceRequirements: context.evidenceRequirements,
      reviewRequired: true,
    });

    expect(metadata.approvalState).toBe("draft_generated");
    expect(metadata.reviewRequired).toBe(true);
    expect(metadata.explainabilityMessage).toContain(
      "AI assists. Humans decide. Evidence governs.",
    );
  });

  it("updates evidence, review, escalation, and approval markers", () => {
    const context = getGovernanceContext("audit_findings");
    const draft = createDraftProvenance({
      taskType: context.taskType,
      doctrineReferences: context.doctrineReferences,
      governanceReferences: context.governanceReferences,
      evidenceRequirements: context.evidenceRequirements,
    });

    const withEvidence = attachEvidenceStatus(draft, [
      {
        description: "Linked evidence",
        status: "complete",
        requiredForApproval: true,
      },
    ]);
    const reviewRequired = markReviewRequired(
      withEvidence,
      "Needs reviewer confirmation",
    );
    const escalated = markEscalated(reviewRequired, {
      trigger: "missing_evidence",
      level: "review_required",
      message: "Reviewer must inspect missing support",
      timestamp: new Date().toISOString(),
    });
    const approved = markApprovedByHuman(escalated, "Test Reviewer");

    expect(withEvidence.evidenceRequirements[0]?.status).toBe("complete");
    expect(reviewRequired.approvalState).toBe("review_required");
    expect(escalated.escalationLevel).toBe("review_required");
    expect(approved.approvalState).toBe("approved_by_human");
    expect(approved.approvedBy).toBe("Test Reviewer");
  });

  it("explains provenance in a human-readable summary", () => {
    const context = getGovernanceContext("commercial_claim_review");
    const metadata = createDraftProvenance({
      taskType: context.taskType,
      doctrineReferences: context.doctrineReferences,
      governanceReferences: context.governanceReferences,
      evidenceRequirements: context.evidenceRequirements,
    });

    const explanation = explainProvenance(metadata);

    expect(explanation).toContain("Task: commercial_claim_review");
    expect(explanation).toContain("Status: draft_generated");
    expect(explanation).toContain("Output boundary: draft_only");
  });
});
