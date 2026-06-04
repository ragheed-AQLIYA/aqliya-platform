/**
 * D3-01 — DecisionOS outcome portfolio metrics (pure functions, no Prisma).
 */

export type OutcomeDashboardDecision = {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  outcome: {
    outcomeStatus: string;
    actualOutcome: string | null;
    variance: number | null;
    reviewedAt: Date | null;
    updatedAt: Date;
  } | null;
};

export type OutcomeDashboardRecentItem = {
  decisionId: string;
  title: string;
  decisionStatus: string;
  priority: string | null;
  outcomeStatus: string;
  hasReview: boolean;
  variance: number | null;
  updatedAt: Date;
};

export type OutcomeDashboardMetrics = {
  totalOutcomes: number;
  coveragePct: number;
  approvedMissingOutcome: number;
  byStatus: Record<string, number>;
  missingReview: number;
  reviewedCount: number;
  avgVariance: number | null;
  recentOutcomes: OutcomeDashboardRecentItem[];
};

const OUTCOME_STATUS_LABELS: Record<string, string> = {
  SUCCESS: "نجاح",
  PARTIAL_SUCCESS: "نجاح جزئي",
  FAILURE: "فشل",
  UNKNOWN: "غير محدد",
};

export function getOutcomeStatusLabel(status: string): string {
  return OUTCOME_STATUS_LABELS[status] ?? status;
}

export function buildOutcomeDashboardMetrics(
  decisions: OutcomeDashboardDecision[],
): OutcomeDashboardMetrics {
  const withOutcome = decisions.filter((d) => d.outcome);
  const approved = decisions.filter((d) => d.status === "APPROVED");

  const byStatus = withOutcome.reduce(
    (acc, d) => {
      const key = d.outcome!.outcomeStatus;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const variances = withOutcome
    .map((d) => d.outcome?.variance)
    .filter((v): v is number => v != null);

  const avgVariance =
    variances.length > 0
      ? Math.round(
          (variances.reduce((sum, v) => sum + v, 0) / variances.length) * 100,
        ) / 100
      : null;

  const recentOutcomes = [...withOutcome]
    .sort(
      (a, b) =>
        b.outcome!.updatedAt.getTime() - a.outcome!.updatedAt.getTime(),
    )
    .slice(0, 8)
    .map((d) => ({
      decisionId: d.id,
      title: d.title,
      decisionStatus: d.status,
      priority: d.priority,
      outcomeStatus: d.outcome!.outcomeStatus,
      hasReview: Boolean(d.outcome!.reviewedAt),
      variance: d.outcome!.variance,
      updatedAt: d.outcome!.updatedAt,
    }));

  return {
    totalOutcomes: withOutcome.length,
    coveragePct:
      decisions.length > 0
        ? Math.round((withOutcome.length / decisions.length) * 100)
        : 0,
    approvedMissingOutcome: approved.filter((d) => !d.outcome).length,
    byStatus,
    missingReview: withOutcome.filter((d) => !d.outcome!.reviewedAt).length,
    reviewedCount: withOutcome.filter((d) => d.outcome!.reviewedAt).length,
    avgVariance,
    recentOutcomes,
  };
}
