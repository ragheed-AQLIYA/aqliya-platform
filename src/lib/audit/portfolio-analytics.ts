/**
 * A1-07 — org-level AuditOS portfolio analytics (deterministic aggregates).
 */

export type EngagementPortfolioInput = {
  engagementId: string;
  clientName: string;
  fiscalPeriod: string;
  status: string;
  openFindings: number;
  missingEvidence: number;
  approvalCount: number;
  lastEventAt: string | null;
};

export type EngagementPortfolioRow = EngagementPortfolioInput & {
  riskBand: "low" | "medium" | "high";
};

export type AuditPortfolioSnapshot = {
  totals: {
    engagements: number;
    active: number;
    openFindings: number;
    missingEvidence: number;
    pendingReview: number;
    readyForApproval: number;
    published: number;
  };
  byStatus: Record<string, number>;
  rows: EngagementPortfolioRow[];
  topRisks: EngagementPortfolioRow[];
  disclaimerAr: string;
};

const ACTIVE_EXCLUDE = new Set(["archived", "published"]);

function riskBand(
  openFindings: number,
  missingEvidence: number,
): "low" | "medium" | "high" {
  if (openFindings >= 5 || missingEvidence >= 3) return "high";
  if (openFindings >= 2 || missingEvidence >= 1) return "medium";
  return "low";
}

export function buildAuditPortfolioSnapshot(
  rows: EngagementPortfolioInput[],
): AuditPortfolioSnapshot {
  const byStatus: Record<string, number> = {};
  let openFindings = 0;
  let missingEvidence = 0;
  let pendingReview = 0;
  let readyForApproval = 0;
  let published = 0;
  let active = 0;

  const enriched: EngagementPortfolioRow[] = rows.map((r) => {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    openFindings += r.openFindings;
    missingEvidence += r.missingEvidence;
    if (r.status === "under_review" || r.status === "awaiting_client") {
      pendingReview += 1;
    }
    if (r.status === "ready_for_approval") readyForApproval += 1;
    if (r.status === "published") published += 1;
    if (!ACTIVE_EXCLUDE.has(r.status)) active += 1;
    return {
      ...r,
      riskBand: riskBand(r.openFindings, r.missingEvidence),
    };
  });

  enriched.sort((a, b) => {
    const score = (x: EngagementPortfolioRow) =>
      x.openFindings * 2 + x.missingEvidence * 3;
    return score(b) - score(a);
  });

  return {
    totals: {
      engagements: rows.length,
      active,
      openFindings,
      missingEvidence,
      pendingReview,
      readyForApproval,
      published,
    },
    byStatus,
    rows: enriched,
    topRisks: enriched.filter((r) => r.riskBand !== "low").slice(0, 8),
    disclaimerAr:
      "محفظة التدقيق — مؤشرات تشغيلية مساعدة؛ القرار النهائي للمراجع البشري.",
  };
}
