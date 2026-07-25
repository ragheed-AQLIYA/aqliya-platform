import type { DecisionMetricsRecord } from "./common";

export interface AggregationMetrics {
  totalDecisions: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  approvedCount: number;
  pendingApproval: number;
  draftCount: number;
  inProgressCount: number;
}

export function computeAggregationMetrics(
  decisions: DecisionMetricsRecord[],
): AggregationMetrics {
  const totalDecisions = decisions.length;

  const byStatus = decisions.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const byType = decisions.reduce(
    (acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const byPriority = decisions.reduce(
    (acc, d) => {
      const p = d.priority || "MEDIUM";
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const approvedCount = decisions.filter((d) =>
    d.approvals.some((a) => a.status === "APPROVED"),
  ).length;

  const pendingApproval = decisions.filter(
    (d) =>
      d.recommendation && !d.approvals.some((a) => a.status === "APPROVED"),
  ).length;

  const draftCount = byStatus["DRAFT"] || 0;
  const inProgressCount = totalDecisions - draftCount - approvedCount;

  return {
    totalDecisions,
    byStatus,
    byType,
    byPriority,
    approvedCount,
    pendingApproval,
    draftCount,
    inProgressCount,
  };
}
