export type ExportData = {
  metadata: {
    id: string;
    title: string;
    type: string;
    status: string;
    priority: string | null;
    description: string | null;
    targetDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    owner: string | null;
    organization: string | null;
  };
  recommendation: {
    id: string;
    recommendedAction: string;
    rationale: string;
    expectedNextState: string;
    scopeExclusions: string;
    assumptionsUsed: string;
    risksAccepted: string;
    risksRejected: string;
    publishedVersion: number;
    publishedAt: Date | null;
    isClientVisible: boolean;
    publishedFromSnapshot: boolean;
    humanReviewRequired: boolean;
    updatedAt: Date;
  } | null;
  approvedSnapshot: {
    action: string | null;
    rationale: string | null;
    expectedNextState: string | null;
    scopeExclusions: string | null;
    assumptionsUsed: string | null;
    risksAccepted: string | null;
    risksRejected: string | null;
    conditions: string | null;
    confidence: number | null;
    score: number | null;
    overrideReason: string | null;
    approvedAt: Date | null;
    approver: string | null;
    isImmutable: boolean;
  } | null;
  approvalHistory: {
    status: string;
    approver: string | null;
    comments: string | null;
    conditions: string | null;
    createdAt: Date;
    recommendationId: string | null;
  }[];
  diffSummary: string | null;
  timeline: {
    type: string;
    label: string;
    date: Date;
    actor: string | null;
    details: string | null;
    isCritical: boolean;
    category: string;
  }[];
  exportMetadata: {
    exportedAt: Date;
    exportedBy: string;
    requestedFormat: "json" | "markdown";
    snapshotSource: string;
    evidenceCount: number;
    warnings: string[];
  };
};
