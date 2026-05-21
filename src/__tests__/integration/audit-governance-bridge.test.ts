import {
  checkPublicationGovernance,
  evaluateFindingEscalation,
  evaluateEvidenceEscalation,
  buildEvidenceRequirementsFromEvidenceList,
  mapEngagementStatusToApprovalState,
  mapFindingStatusToApprovalState,
  mapRecommendationStatusToApprovalState,
  buildProvenanceMetadata,
  getGovernanceAuditMetadata,
} from "@/lib/audit/governance-bridge";

// ─── Governance Bridge Pure Function Tests ───

describe("Governance Bridge — checkPublicationGovernance", () => {
  it("blocks publication when engagement status is in_progress (not approved)", () => {
    const result = checkPublicationGovernance({
      engagementStatus: "in_progress",
      evidenceRequirements: [
        {
          description: "All required evidence collected",
          status: "complete",
          requiredForApproval: true,
        },
      ],
      taskType: "approval_review",
    });
    expect(result.allowed).toBe(false);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.reasons.some((r) => r.includes("approv"))).toBe(true);
  });

  it("blocks publication when evidence is missing", () => {
    const result = checkPublicationGovernance({
      engagementStatus: "approved",
      evidenceRequirements: [
        {
          description: "Inventory evidence",
          status: "missing",
          requiredForApproval: true,
        },
        {
          description: "Revenue confirmation",
          status: "missing",
          requiredForApproval: true,
        },
      ],
      taskType: "approval_review",
    });
    expect(result.allowed).toBe(false);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(
      result.reasons.some(
        (r) => r.includes("evidence") || r.includes("Inventory"),
      ),
    ).toBe(true);
  });

  it("blocks publication when escalation is blocked", () => {
    const result = checkPublicationGovernance({
      engagementStatus: "approved",
      evidenceRequirements: [
        {
          description: "Evidence verified",
          status: "complete",
          requiredForApproval: true,
        },
      ],
      escalationLevel: "blocked",
      taskType: "approval_review",
    });
    expect(result.allowed).toBe(false);
    expect(result.reasons.some((r) => r.includes("blocked"))).toBe(true);
  });

  it("allows publication when all governance rules pass", () => {
    const result = checkPublicationGovernance({
      engagementStatus: "approved",
      evidenceRequirements: [
        {
          description: "All evidence collected",
          status: "complete",
          requiredForApproval: true,
        },
        {
          description: "No rejected evidence",
          status: "complete",
          requiredForApproval: true,
        },
      ],
      escalationLevel: "none",
      taskType: "approval_review",
      approvedBy: "Test Approver",
    });
    expect(result.allowed).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it("returns multiple blocking reasons when multiple rules fail", () => {
    const result = checkPublicationGovernance({
      engagementStatus: "in_progress",
      evidenceRequirements: [
        {
          description: "Evidence A",
          status: "missing",
          requiredForApproval: true,
        },
        {
          description: "Evidence B",
          status: "missing",
          requiredForApproval: true,
        },
      ],
      escalationLevel: "blocked",
      taskType: "approval_review",
    });
    expect(result.allowed).toBe(false);
    expect(result.reasons.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── Finding Escalation Tests ───

describe("Governance Bridge — evaluateFindingEscalation", () => {
  it("triggers senior_review_required for critical severity", () => {
    const result = evaluateFindingEscalation("critical");
    expect(result.level).toBe("senior_review_required");
    expect(result.triggers.length).toBeGreaterThan(0);
    expect(result.requiresHumanResolution).toBe(true);
  });

  it("triggers senior_review_required for high severity", () => {
    const result = evaluateFindingEscalation("high");
    expect(result.level).toBe("senior_review_required");
    expect(result.requiresHumanResolution).toBe(true);
  });

  it("does not trigger escalation for low severity", () => {
    const result = evaluateFindingEscalation("low");
    expect(result.level).toBe("none");
    expect(result.triggers.length).toBe(0);
    expect(result.requiresHumanResolution).toBe(false);
  });

  it("does not trigger escalation for medium severity", () => {
    const result = evaluateFindingEscalation("medium");
    expect(result.level).toBe("none");
    expect(result.triggers.length).toBe(0);
  });
});

// ─── Evidence Escalation Tests ───

describe("Governance Bridge — evaluateEvidenceEscalation", () => {
  it("triggers review_required for missing evidence", () => {
    const result = evaluateEvidenceEscalation("missing");
    expect(result.level).toBe("review_required");
    expect(result.triggers.length).toBeGreaterThan(0);
    expect(result.requiresHumanResolution).toBe(true);
  });

  it("triggers review_required for rejected evidence", () => {
    const result = evaluateEvidenceEscalation("rejected");
    expect(result.level).toBe("review_required");
    expect(result.triggers.length).toBeGreaterThan(0);
  });

  it("does not trigger escalation for accepted evidence", () => {
    const result = evaluateEvidenceEscalation("accepted");
    expect(result.level).toBe("none");
    expect(result.triggers.length).toBe(0);
  });
});

// ─── Evidence Requirements Builder Tests ───

describe("Governance Bridge — buildEvidenceRequirementsFromEvidenceList", () => {
  it("marks evidence as missing when items have missing state", () => {
    const result = buildEvidenceRequirementsFromEvidenceList([
      { state: "missing" },
      { state: "accepted" },
    ]);
    expect(result[0].status).toBe("missing");
    expect(result[0].requiredForApproval).toBe(true);
  });

  it("marks evidence as conflicting when rejected exists", () => {
    const result = buildEvidenceRequirementsFromEvidenceList([
      { state: "rejected" },
    ]);
    expect(result[1].status).toBe("conflicting");
    expect(result[1].requiredForApproval).toBe(true);
  });

  it("marks evidence as complete when none are missing or rejected", () => {
    const result = buildEvidenceRequirementsFromEvidenceList([
      { state: "accepted" },
      { state: "reviewed" },
      { state: "uploaded" },
    ]);
    expect(result[0].status).toBe("complete");
    expect(result[1].status).toBe("complete");
  });

  it("returns complete for empty evidence list", () => {
    const result = buildEvidenceRequirementsFromEvidenceList([]);
    expect(result[0].status).toBe("complete");
  });
});

// ─── Status Mapping Tests ───

describe("Governance Bridge — mapEngagementStatusToApprovalState", () => {
  it("maps draft to evidence_pending", () => {
    expect(mapEngagementStatusToApprovalState("draft")).toBe(
      "evidence_pending",
    );
  });
  it("maps setup to evidence_pending", () => {
    expect(mapEngagementStatusToApprovalState("setup")).toBe(
      "evidence_pending",
    );
  });
  it("maps in_progress to review_required", () => {
    expect(mapEngagementStatusToApprovalState("in_progress")).toBe(
      "review_required",
    );
  });
  it("maps under_review to under_review", () => {
    expect(mapEngagementStatusToApprovalState("under_review")).toBe(
      "under_review",
    );
  });
  it("maps awaiting_client to changes_requested", () => {
    expect(mapEngagementStatusToApprovalState("awaiting_client")).toBe(
      "changes_requested",
    );
  });
  it("maps approved to approved_by_human", () => {
    expect(mapEngagementStatusToApprovalState("approved")).toBe(
      "approved_by_human",
    );
  });
  it("maps published to finalized", () => {
    expect(mapEngagementStatusToApprovalState("published")).toBe("finalized");
  });
});

describe("Governance Bridge — mapFindingStatusToApprovalState", () => {
  it("maps draft to draft_generated", () => {
    expect(mapFindingStatusToApprovalState("draft")).toBe("draft_generated");
  });
  it("maps open to evidence_pending", () => {
    expect(mapFindingStatusToApprovalState("open")).toBe("evidence_pending");
  });
  it("maps in_review to under_review", () => {
    expect(mapFindingStatusToApprovalState("in_review")).toBe("under_review");
  });
  it("maps accepted to approved_by_human", () => {
    expect(mapFindingStatusToApprovalState("accepted")).toBe(
      "approved_by_human",
    );
  });
  it("maps resolved to finalized", () => {
    expect(mapFindingStatusToApprovalState("resolved")).toBe("finalized");
  });
  it("maps dismissed to rejected_by_human", () => {
    expect(mapFindingStatusToApprovalState("dismissed")).toBe(
      "rejected_by_human",
    );
  });
});

describe("Governance Bridge — mapRecommendationStatusToApprovalState", () => {
  it("maps suggested to draft_generated", () => {
    expect(mapRecommendationStatusToApprovalState("suggested")).toBe(
      "draft_generated",
    );
  });
  it("maps under_review to under_review", () => {
    expect(mapRecommendationStatusToApprovalState("under_review")).toBe(
      "under_review",
    );
  });
  it("maps accepted to approved_by_human", () => {
    expect(mapRecommendationStatusToApprovalState("accepted")).toBe(
      "approved_by_human",
    );
  });
  it("maps rejected to rejected_by_human", () => {
    expect(mapRecommendationStatusToApprovalState("rejected")).toBe(
      "rejected_by_human",
    );
  });
  it("maps implemented to finalized", () => {
    expect(mapRecommendationStatusToApprovalState("implemented")).toBe(
      "finalized",
    );
  });
});

// ─── Provenance Metadata Tests ───

describe("Governance Bridge — buildProvenanceMetadata", () => {
  it("creates provenance metadata with evidence_pending state", () => {
    const result = buildProvenanceMetadata({
      taskType: "audit_findings",
      approvalState: "evidence_pending",
      evidenceRequirements: [
        {
          description: "Test evidence",
          status: "missing",
          requiredForApproval: true,
        },
      ],
    });
    expect(result.taskType).toBe("audit_findings");
    expect(result.approvalState).toBe("evidence_pending");
    expect(result.reviewRequired).toBe(true);
    expect(result.humanApprovalRequired).toBe(true);
    expect(result.doctrineReferences.length).toBeGreaterThan(0);
    expect(result.governanceReferences.length).toBeGreaterThan(0);
  });

  it("sets reviewRequired false for finalized state", () => {
    const result = buildProvenanceMetadata({
      taskType: "approval_review",
      approvalState: "finalized",
      evidenceRequirements: [],
    });
    expect(result.reviewRequired).toBe(false);
  });

  it("includes approvedBy when provided", () => {
    const result = buildProvenanceMetadata({
      taskType: "approval_review",
      approvalState: "approved_by_human",
      evidenceRequirements: [],
      approvedBy: "Senior Reviewer",
    });
    expect(result.approvedBy).toBe("Senior Reviewer");
  });
});

// ─── Governance Audit Metadata Tests ───

describe("Governance Bridge — getGovernanceAuditMetadata", () => {
  it("creates structured metadata for audit events", () => {
    const provenance = buildProvenanceMetadata({
      taskType: "audit_findings",
      approvalState: "evidence_pending",
      evidenceRequirements: [
        { description: "E1", status: "complete", requiredForApproval: true },
        { description: "E2", status: "missing", requiredForApproval: true },
        { description: "E3", status: "partial", requiredForApproval: false },
      ],
    });
    const metadata = getGovernanceAuditMetadata("audit_findings", provenance);
    expect(metadata.governanceTaskType).toBe("audit_findings");
    expect(metadata.governanceApprovalState).toBe("evidence_pending");
    expect(metadata.governanceEvidenceComplete).toBe(1);
    expect(metadata.governanceEvidenceRequired).toBe(2);
    expect(metadata.governanceEvidenceCount).toBe(3);
  });
});
