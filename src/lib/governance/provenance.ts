import {
  ProvenanceMetadata,
  GovernanceTaskType,
  EscalationRecord,
  DoctrineReference,
  GovernanceReference,
  EvidenceRequirement,
} from "./runtime-types";

export function createDraftProvenance(params: {
  taskType: GovernanceTaskType;
  doctrineReferences: DoctrineReference[];
  governanceReferences: GovernanceReference[];
  evidenceRequirements: EvidenceRequirement[];
  reviewRequired?: boolean;
}): ProvenanceMetadata {
  const requiresReview = params.reviewRequired ?? true;
  return {
    taskType: params.taskType,
    generatedAt: new Date().toISOString(),
    approvalState: "draft_generated",
    reviewRequired: requiresReview,
    doctrineReferences: params.doctrineReferences,
    governanceReferences: params.governanceReferences,
    evidenceRequirements: params.evidenceRequirements,
    escalationLevel: "none",
    outputBoundary: "draft_only",
    humanApprovalRequired: true,
    explainabilityMessage: [
      `TASK: ${params.taskType.replace(/_/g, " ")}`,
      `STATUS: Draft generated — not final. This output requires human review and approval before any professional use.`,
      `DOCTRINE: ${params.doctrineReferences.map((d) => `[${d.documentId}] ${d.principle}`).join("; ")}`,
      `GOVERNANCE: ${params.governanceReferences.map((g) => g.rule).join("; ")}`,
      `EVIDENCE: ${params.evidenceRequirements.map((e) => `${e.description} (${e.status})`).join("; ")}`,
      ``,
      `AI assists. Humans decide. Evidence governs.`,
      `This output is not a final professional conclusion. It is an assistive draft.`,
    ].join("\n"),
  };
}

export function attachEvidenceStatus(
  metadata: ProvenanceMetadata,
  evidenceRequirements: EvidenceRequirement[],
): ProvenanceMetadata {
  return { ...metadata, evidenceRequirements };
}

export function markReviewRequired(
  metadata: ProvenanceMetadata,
  reason: string,
): ProvenanceMetadata {
  return {
    ...metadata,
    approvalState: "review_required",
    reviewRequired: true,
    explainabilityMessage: `Review required: ${reason}`,
  };
}

export function markEscalated(
  metadata: ProvenanceMetadata,
  record: EscalationRecord,
): ProvenanceMetadata {
  return {
    ...metadata,
    escalationLevel: record.level,
    escalatedAt: record.timestamp,
    reviewRequired: true,
    explainabilityMessage: `Escalated: ${record.message}`,
  };
}

export function markApprovedByHuman(
  metadata: ProvenanceMetadata,
  reviewer: string,
): ProvenanceMetadata {
  return {
    ...metadata,
    approvalState: "approved_by_human",
    reviewedBy: reviewer,
    approvedBy: reviewer,
    reviewRequired: false,
    humanApprovalRequired: false,
    explainabilityMessage: `Approved by human reviewer: ${reviewer}`,
  };
}

export function explainProvenance(metadata: ProvenanceMetadata): string {
  const parts: string[] = [];
  parts.push(`Task: ${metadata.taskType}`);
  parts.push(`Status: ${metadata.approvalState}`);
  parts.push(`Review required: ${metadata.reviewRequired}`);
  parts.push(`Output boundary: ${metadata.outputBoundary}`);
  parts.push(
    `Human approval: ${metadata.humanApprovalRequired ? "required" : "obtained"}`,
  );
  if (metadata.approvedBy) parts.push(`Approved by: ${metadata.approvedBy}`);
  if (metadata.escalationLevel !== "none")
    parts.push(`Escalation: ${metadata.escalationLevel}`);
  parts.push(
    `\nDoctrine references: ${metadata.doctrineReferences.map((d) => `${d.documentId} (${d.principle})`).join("; ")}`,
  );
  parts.push(
    `Governance references: ${metadata.governanceReferences.map((g) => g.rule).join("; ")}`,
  );
  parts.push(`\n${metadata.explainabilityMessage}`);
  return parts.join("\n");
}
