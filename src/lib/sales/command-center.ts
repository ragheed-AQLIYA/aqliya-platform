import { getProductById } from "@/lib/platform/registry/runtime";
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
  const registry = getProductById("sales");
  const accounts = listAccounts(user.organizationId);
  const opportunities = listOpportunities(user.organizationId);
  const analytics = buildPipelineAnalytics(opportunities);
  const auditRecent = listAuditEntries(user.organizationId).slice(0, 10);

  const needsReview = opportunities.filter(
    (o) => o.reviewStatus === "Draft" || o.reviewStatus === "InReview",
  ).length;

  return {
    productId: registry.slug,
    disclaimerAr:
      "ذكاء تجاري مساعد — لا يُعد عرضاً أو قراراً نهائياً. المراجعة البشرية مطلوبة.",
    metrics: {
      accountCount: accounts.length,
      opportunityCount: opportunities.length,
      pipelineValue: analytics.totalValue,
      needsReview,
      weightedScore: analytics.weightedScore,
    },
    byStage: analytics.byStage,
    topOpportunities: analytics.topByValue.slice(0, 8),
    recentAudit: auditRecent,
  };
}
