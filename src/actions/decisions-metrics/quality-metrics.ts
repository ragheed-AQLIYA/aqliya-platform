import type { DecisionMetricsRecord } from "./common";

export interface QualityMetrics {
  avgCompletion: number;
  evidenceBackedCount: number;
  missingEvidenceCount: number;
  inReviewWithoutEvidence: number;
  humanReviewRequiredCount: number;
  readyForReviewCount: number;
  publishedWithoutSnapshotCount: number;
  highPriorityPendingApprovalCount: number;
}

export function computeQualityMetrics(
  decisions: DecisionMetricsRecord[],
): QualityMetrics {
  const completionRates = decisions.map((d) => {
    let stages = 0;
    let complete = 0;

    if (d.title) {
      stages++;
      complete++;
    }
    if (d.objectives.length > 0) {
      stages++;
      complete++;
    }
    if (d.framework) {
      stages++;
      complete++;
    }
    if (d.decisionScenarios.length >= 3) {
      stages++;
      complete++;
    }
    if (d.riskAnalyses.length > 0) {
      stages++;
      complete++;
    }
    if (d.recommendation) {
      stages++;
      complete++;
    }
    if (d.approvals.some((a) => a.status === "APPROVED")) {
      stages++;
      complete++;
    }

    return stages > 0 ? (complete / stages) * 100 : 0;
  });

  const avgCompletion =
    completionRates.length > 0
      ? Math.round(
          completionRates.reduce((a, b) => a + b, 0) / completionRates.length,
        )
      : 0;

  const evidenceBackedCount = decisions.filter(
    (d) => d.evidence.length > 0,
  ).length;
  const missingEvidenceCount = decisions.length - evidenceBackedCount;
  const inReviewWithoutEvidence = decisions.filter(
    (d) => d.status === "IN_REVIEW" && d.evidence.length === 0,
  ).length;
  const humanReviewRequiredCount = decisions.filter(
    (d) => d.recommendation?.humanReviewRequired,
  ).length;
  const readyForReviewCount = decisions.filter(
    (d) =>
      d.status === "DRAFT" && !!d.recommendation && d.evidence.length > 0,
  ).length;
  const publishedWithoutSnapshotCount = decisions.filter(
    (d) =>
      d.recommendation?.isClientVisible &&
      !d.recommendation.publishedFromSnapshot,
  ).length;
  const highPriorityPendingApprovalCount = decisions.filter(
    (d) =>
      !!d.recommendation &&
      !d.approvals.some((a) => a.status === "APPROVED") &&
      ["HIGH", "CRITICAL"].includes(d.priority || ""),
  ).length;

  return {
    avgCompletion,
    evidenceBackedCount,
    missingEvidenceCount,
    inReviewWithoutEvidence,
    humanReviewRequiredCount,
    readyForReviewCount,
    publishedWithoutSnapshotCount,
    highPriorityPendingApprovalCount,
  };
}
