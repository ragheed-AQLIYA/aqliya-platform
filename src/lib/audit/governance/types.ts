/**
 * Governance Engine — types (AuditOS 2.0 Phase 10)
 */

export interface ApprovalGateCheck {
  gateId: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface FactoryGateSnapshot {
  notes: Array<{
    id: string;
    title: string;
    status: string;
    content: string;
    missingInformation: string[];
    aiDrafted: boolean;
  }>;
  statements: Array<{ id: string; statementType: string; status: string }>;
  validationIssues: Array<{
    severity: string;
    status: string;
    checkType: string;
  }>;
}

export interface FactoryGateEvaluation {
  checklist: ApprovalGateCheck[];
  blockingIssues: string[];
}

export class ApprovalGatesBlockedError extends Error {
  readonly blockingIssues: readonly string[];

  constructor(blockingIssues: string[]) {
    super(
      blockingIssues.length > 0
        ? `Approval gates blocked: ${blockingIssues.join("; ")}`
        : "Approval gates blocked",
    );
    this.name = "ApprovalGatesBlockedError";
    this.blockingIssues = blockingIssues;
  }
}
