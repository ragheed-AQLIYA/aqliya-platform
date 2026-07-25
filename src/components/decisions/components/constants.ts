import type { OutcomeDashboardMetrics } from "@/lib/decision/outcome-dashboard";
import type { OutcomeCorrelationSnapshot } from "@/lib/decision/outcome-correlation";
import type { DecisionPortfolioSnapshot } from "@/lib/decision/decision-portfolio";
import type { CrossDecisionPatternSnapshot } from "@/lib/decision/cross-decision-patterns";

export type DashboardMetrics = {
  totalDecisions: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  approvedCount: number;
  pendingApproval: number;
  draftCount: number;
  inProgressCount: number;
  avgCompletion: number;
  governanceMetrics: {
    evidenceBackedCount: number;
    missingEvidenceCount: number;
    inReviewWithoutEvidence: number;
    humanReviewRequiredCount: number;
    readyForReviewCount: number;
    publishedWithoutSnapshotCount: number;
    highPriorityPendingApprovalCount: number;
  };
  recentDecisions: {
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
  }[];
  bottlenecks: {
    id: string;
    title: string;
    stage: string;
    priority: string | null;
  }[];
  outcomeMetrics: OutcomeDashboardMetrics;
  outcomeCorrelation: OutcomeCorrelationSnapshot;
  portfolioSnapshot: DecisionPortfolioSnapshot;
  crossDecisionPatterns: CrossDecisionPatternSnapshot;
};

export function getPriorityColor(priority: string | null) {
  switch (priority) {
    case "CRITICAL":
      return "text-red-500";
    case "HIGH":
      return "text-orange-500";
    case "MEDIUM":
      return "text-yellow-500";
    case "LOW":
      return "text-green-500";
    default:
      return "text-muted-foreground";
  }
}

export function getStatusVariant(status: string) {
  switch (status) {
    case "APPROVED":
      return "default";
    case "DRAFT":
      return "secondary";
    case "IN_PROGRESS":
      return "default";
    default:
      return "secondary";
  }
}
