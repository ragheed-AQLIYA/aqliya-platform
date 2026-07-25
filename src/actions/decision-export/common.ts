import {
  buildRecommendationDiff,
  getDiffSummary,
} from "@/lib/recommendation/recommendation-diff";

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

interface ApprovalWithRelations {
  id: string;
  status: string;
  createdAt: Date;
  snapshotAction: string | null;
  snapshotRationale: string | null;
  snapshotExpectedNextState: string | null;
  snapshotScopeExclusions: string | null;
  snapshotAssumptionsUsed: string | null;
  snapshotRisksAccepted: string | null;
  snapshotRisksRejected: string | null;
  snapshotConditions: string | null;
  snapshotConfidence: number | null;
  snapshotScore: number | null;
  snapshotOverrideReason: string | null;
  snapshotCreatedAt: Date | null;
  snapshotRisks: unknown;
  snapshotNextActions: unknown;
  approver: { name: string | null } | null;
  recommendation: {
    recommendedAction: string;
    rationale: string;
    expectedNextState: string;
    scopeExclusions: string;
    assumptionsUsed: string;
    risksAccepted: string;
    risksRejected: string;
  } | null;
  recommendationId: string | null;
}

interface RecommendationFields {
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
  createdAt: Date | null;
}

export function buildApprovedSnapshot(
  approvals: ApprovalWithRelations[],
  recommendation: RecommendationFields | null,
): ExportData["approvedSnapshot"] {
  const latestApproval = approvals[approvals.length - 1];
  if (!latestApproval) return null;

  const hasImmutableSnapshot = !!(
    latestApproval.snapshotAction && latestApproval.snapshotRationale
  );

  if (hasImmutableSnapshot) {
    return {
      action: latestApproval.snapshotAction,
      rationale: latestApproval.snapshotRationale,
      expectedNextState: latestApproval.snapshotExpectedNextState,
      scopeExclusions: latestApproval.snapshotScopeExclusions,
      assumptionsUsed: latestApproval.snapshotAssumptionsUsed,
      risksAccepted: latestApproval.snapshotRisksAccepted,
      risksRejected: latestApproval.snapshotRisksRejected,
      conditions: latestApproval.snapshotConditions,
      confidence: latestApproval.snapshotConfidence,
      score: latestApproval.snapshotScore,
      overrideReason: latestApproval.snapshotOverrideReason,
      approvedAt:
        latestApproval.snapshotCreatedAt || latestApproval.createdAt,
      approver: latestApproval.approver?.name || null,
      isImmutable: true,
    };
  }

  return {
    action: latestApproval.recommendation?.recommendedAction || null,
    rationale: latestApproval.recommendation?.rationale || null,
    expectedNextState:
      latestApproval.recommendation?.expectedNextState || null,
    scopeExclusions:
      latestApproval.recommendation?.scopeExclusions || null,
    assumptionsUsed:
      latestApproval.recommendation?.assumptionsUsed || null,
    risksAccepted: latestApproval.recommendation?.risksAccepted || null,
    risksRejected: latestApproval.recommendation?.risksRejected || null,
    conditions: null,
    confidence: null,
    score: null,
    overrideReason: null,
    approvedAt: latestApproval.createdAt,
    approver: latestApproval.approver?.name || null,
    isImmutable: false,
  };
}

export function getHasImmutableSnapshot(
  approvals: ApprovalWithRelations[],
): boolean {
  const latestApproval = approvals[approvals.length - 1];
  if (!latestApproval) return false;
  return !!(
    latestApproval.snapshotAction && latestApproval.snapshotRationale
  );
}

export function buildDiffSummary(
  latestApproval: ApprovalWithRelations | undefined,
  recommendation: RecommendationFields | null,
  hasImmutableSnapshot: boolean,
): string | null {
  if (!hasImmutableSnapshot || !recommendation || !latestApproval) return null;

  const approvedData: Record<string, unknown> = {
    recommendedAction: latestApproval.snapshotAction,
    rationale: latestApproval.snapshotRationale,
    expectedNextState: latestApproval.snapshotExpectedNextState,
    scopeExclusions: latestApproval.snapshotScopeExclusions,
    assumptionsUsed: latestApproval.snapshotAssumptionsUsed,
    risksAccepted: latestApproval.snapshotRisksAccepted,
    risksRejected: latestApproval.snapshotRisksRejected,
    conditions: latestApproval.snapshotConditions,
    confidence: latestApproval.snapshotConfidence,
    score: latestApproval.snapshotScore,
    risks: latestApproval.snapshotRisks,
    nextActions: latestApproval.snapshotNextActions,
  };
  const currentData: Record<string, unknown> = {
    recommendedAction: recommendation.recommendedAction,
    rationale: recommendation.rationale,
    expectedNextState: recommendation.expectedNextState,
    scopeExclusions: recommendation.scopeExclusions,
    assumptionsUsed: recommendation.assumptionsUsed,
    risksAccepted: recommendation.risksAccepted,
    risksRejected: recommendation.risksRejected,
    conditions: null,
    confidence: null,
    score: null,
    risks: null,
    nextActions: null,
  };
  const diff = buildRecommendationDiff(approvedData, currentData);
  return getDiffSummary(diff);
}

export function buildWarnings(
  approvedSnapshot: ExportData["approvedSnapshot"],
  decisionStatus: string,
  evidenceCount: number,
  recommendation: RecommendationFields | null,
): string[] {
  const warnings: string[] = [];
  if (!approvedSnapshot) warnings.push("No approval snapshot exists");
  else if (!approvedSnapshot.isImmutable)
    warnings.push(
      "Legacy approval — content not frozen, may have changed since approval",
    );
  if (decisionStatus !== "APPROVED")
    warnings.push("Decision is not currently approved");
  if (evidenceCount === 0)
    warnings.push("No supporting evidence attached to this decision");
  if (recommendation?.humanReviewRequired)
    warnings.push(
      "Human review remains required before relying on this export as a final decision record",
    );
  if (approvedSnapshot && recommendation) {
    const differs =
      approvedSnapshot.action !== recommendation.recommendedAction ||
      approvedSnapshot.rationale !== recommendation.rationale;
    if (differs)
      warnings.push("Current recommendation differs from approved snapshot");
  }
  if (
    recommendation?.isClientVisible &&
    !approvedSnapshot?.isImmutable
  ) {
    warnings.push("Published content may not match approved version");
  }

  return warnings;
}
