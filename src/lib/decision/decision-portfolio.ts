/**
 * D3-05 — decision portfolio aggregates (deterministic).
 */

export type DecisionPortfolioItem = {
  id: string;
  title: string;
  status: string;
  type: string;
  priority: string | null;
};

export type DecisionPortfolioSnapshot = {
  total: number;
  active: number;
  approved: number;
  draft: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  highPriorityOpen: number;
};

export function buildDecisionPortfolioSnapshot(
  decisions: DecisionPortfolioItem[],
): DecisionPortfolioSnapshot {
  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let active = 0;
  let approved = 0;
  let draft = 0;
  let highPriorityOpen = 0;

  for (const d of decisions) {
    byType[d.type] = (byType[d.type] ?? 0) + 1;
    byStatus[d.status] = (byStatus[d.status] ?? 0) + 1;
    if (d.status === "APPROVED") approved += 1;
    if (d.status === "DRAFT") draft += 1;
    if (d.status !== "APPROVED" && d.status !== "REJECTED" && d.status !== "ARCHIVED") {
      active += 1;
      if (d.priority === "HIGH") highPriorityOpen += 1;
    }
  }

  return {
    total: decisions.length,
    active,
    approved,
    draft,
    byType,
    byStatus,
    highPriorityOpen,
  };
}
