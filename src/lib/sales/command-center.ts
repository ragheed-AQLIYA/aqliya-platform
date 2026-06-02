import { buildPipelineAnalytics } from "./vnext/pipeline-analytics";
import {
  listAccounts,
  listOpportunities,
  listAuditEntries,
} from "./store";
import type { CurrentUser } from "@/lib/auth";
import { initSalesWorkspace } from "./service";

export async function buildSalesCommandCenter(user: CurrentUser) {
  await initSalesWorkspace(user);
  const accounts = listAccounts(user.organizationId);
  const opportunities = listOpportunities(user.organizationId);
  const analytics = buildPipelineAnalytics(opportunities);
  const auditRecent = listAuditEntries(user.organizationId).slice(0, 10);

  const needsReview = opportunities.filter(
    (o) => o.reviewStatus === "Draft" || o.reviewStatus === "InReview",
  ).length;

  const topByValue = [...opportunities]
    .sort((a, b) => (b.valueEstimate ?? 0) - (a.valueEstimate ?? 0))
    .slice(0, 8);

  return {
    productId: "sales",
    disclaimerAr:
      "ذكاء تجاري مساعد — لا يُعد عرضاً أو قراراً نهائياً. المراجعة البشرية مطلوبة.",
    metrics: {
      accountCount: accounts.length,
      opportunityCount: opportunities.length,
      pipelineValue: analytics.totalValue,
      needsReview,
      weightedScore: analytics.weightedValue,
    },
    byStage: analytics.stageDistribution,
    topOpportunities: topByValue,
    recentAudit: auditRecent,
  };
}
