import type { DecisionMetricsRecord } from "./common";

export interface RecentDecisionItem {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string | null;
  createdAt: Date;
  hasRecommendation: boolean;
  hasApproval: boolean;
  hasEvidence: boolean;
  humanReviewRequired: boolean;
  stageCount: number;
}

export interface BottleneckItem {
  id: string;
  title: string;
  stage: string;
  priority: string | null;
}

export interface InsightMetrics {
  recentDecisions: RecentDecisionItem[];
  bottlenecks: BottleneckItem[];
}

export function computeInsightMetrics(
  decisions: DecisionMetricsRecord[],
): InsightMetrics {
  const recentDecisions = decisions.slice(0, 5).map(
    (d): RecentDecisionItem => ({
      id: d.id,
      title: d.title,
      type: d.type,
      status: d.status,
      priority: d.priority,
      createdAt: d.createdAt,
      hasRecommendation: !!d.recommendation,
      hasApproval: d.approvals.some((a) => a.status === "APPROVED"),
      hasEvidence: d.evidence.length > 0,
      humanReviewRequired: Boolean(d.recommendation?.humanReviewRequired),
      stageCount: [
        !!d.title,
        d.objectives.length > 0,
        !!d.framework,
        d.decisionScenarios.length >= 3,
        d.riskAnalyses.length > 0,
        !!d.recommendation,
        d.approvals.some((a) => a.status === "APPROVED"),
      ].filter(Boolean).length,
    }),
  );

  const bottlenecks = decisions
    .filter((d) => {
      const hasFramework = !!d.framework;
      const hasScenarios = d.decisionScenarios.length >= 3;
      const hasRisks = d.riskAnalyses.length > 0;
      const hasRecommendation = !!d.recommendation;
      const hasApproval = d.approvals.some((a) => a.status === "APPROVED");

      return (
        (hasFramework && !hasScenarios) ||
        (hasScenarios && !hasRisks) ||
        (hasRisks && !hasRecommendation) ||
        (hasRecommendation && !hasApproval)
      );
    })
    .map((d): BottleneckItem => {
      let stage = "Unknown";
      if (d.framework && d.decisionScenarios.length < 3) stage = "Scenarios";
      else if (d.decisionScenarios.length >= 3 && d.riskAnalyses.length === 0)
        stage = "Risk Analysis";
      else if (d.riskAnalyses.length > 0 && !d.recommendation)
        stage = "Recommendation";
      else if (
        d.recommendation &&
        !d.approvals.some((a) => a.status === "APPROVED")
      )
        stage = "Approval";
      return { id: d.id, title: d.title, stage, priority: d.priority };
    });

  return { recentDecisions, bottlenecks };
}
