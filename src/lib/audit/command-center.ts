import "server-only";

import { getEngagements } from "@/lib/audit/services";
import { getAuditOrganizationMetrics } from "@/lib/audit/analytics/prisma-metrics";
import { buildAuditEngagementMetrics } from "@/lib/audit/vnext/audit-analytics-layer";
import { getEngagementPrismaCounts } from "@/lib/audit/analytics/prisma-metrics";
import { loadRiskRegister } from "@/lib/audit/risk/risk-register";
import {
  listWorkpapers,
  summarizeWorkpapers,
} from "@/lib/audit/workpapers/workpaper-service";
import { listSamplingPlans } from "@/lib/audit/sampling/sampling-service";
import { getProductById } from "@/lib/platform/registry/runtime";

export interface AuditCommandCenterSection {
  id: string;
  labelAr: string;
  count: number;
  href: string;
}

export interface AuditCommandCenterSnapshot {
  productId: string;
  disclaimerAr: string;
  metrics: Awaited<ReturnType<typeof getAuditOrganizationMetrics>>;
  sections: AuditCommandCenterSection[];
  engagements: Array<{
    id: string;
    clientName: string;
    status: string;
    readinessScore: number;
    openFindings: number;
    riskLevel: string;
    href: string;
  }>;
  workpaperTotal: number;
  samplingPlanTotal: number;
}

export async function buildAuditCommandCenter(
  organizationId: string,
): Promise<AuditCommandCenterSnapshot> {
  const registry = getProductById("audit");
  const [metrics, engagements] = await Promise.all([
    getAuditOrganizationMetrics(organizationId),
    getEngagements(organizationId),
  ]);

  let workpaperTotal = 0;
  let samplingPlanTotal = 0;
  let planningInReview = 0;
  let risksOpen = 0;
  let workpapersInReview = 0;

  const engagementRows = await Promise.all(
    engagements.slice(0, 12).map(async (e) => {
      const counts = await getEngagementPrismaCounts(e.id);
      const bundle = buildAuditEngagementMetrics({
        engagementId: e.id,
        status: e.status,
        ...counts,
      });
      const risk = await loadRiskRegister(organizationId, e.id, e.status);
      const wps = await listWorkpapers(organizationId, e.id);
      const samples = await listSamplingPlans(organizationId, e.id);
      workpaperTotal += wps.length;
      samplingPlanTotal += samples.length;
      if (risk.openReviewCount > 0) risksOpen += risk.openReviewCount;
      workpapersInReview += wps.filter(
        (w) => w.status === "under_review" || w.status === "prepared",
      ).length;
      const vnext =
        await import("@/lib/audit/engagement-vnext-persistence").then((m) =>
          m.getEngagementVNextStore(organizationId, e.id),
        );
      if (vnext?.planningApproval?.status === "InReview") planningInReview += 1;
      return {
        id: e.id,
        clientName: e.client?.name ?? e.fiscalPeriod,
        status: e.status,
        readinessScore: bundle.readinessScore,
        openFindings: counts.openFindingCount,
        riskLevel: risk.aggregateLevel,
        href: `/audit/engagements/${e.id}`,
      };
    }),
  );

  const sections: AuditCommandCenterSection[] = [
    {
      id: "planning",
      labelAr: "تخطيط قيد المراجعة",
      count: planningInReview,
      href: "/audit/command-center#planning",
    },
    {
      id: "risks",
      labelAr: "مخاطر مفتوحة",
      count: risksOpen,
      href: "/audit/command-center#risks",
    },
    {
      id: "workpapers",
      labelAr: "أوراق عمل نشطة",
      count: workpaperTotal,
      href: "/audit/command-center#workpapers",
    },
    {
      id: "findings",
      labelAr: "نتائج مفتوحة",
      count: metrics.openFindingCount,
      href: "/audit/command-center#findings",
    },
    {
      id: "evidence",
      labelAr: "أدلة",
      count: metrics.evidenceCount,
      href: "/audit/command-center#evidence",
    },
    {
      id: "reviews",
      labelAr: "مراجعات معلقة",
      count: metrics.pendingReviewCount + workpapersInReview,
      href: "/audit/command-center#reviews",
    },
    {
      id: "approvals",
      labelAr: "اعتمادات معلقة",
      count: metrics.pendingApprovalCount,
      href: "/audit/command-center#approvals",
    },
    {
      id: "outputs",
      labelAr: "مخرجات",
      count: metrics.outputCount,
      href: "/audit/command-center#outputs",
    },
  ];

  return {
    productId: registry.slug,
    disclaimerAr:
      "لوحة قيادة تشغيلية — الذكاء الاصطناعي يساعد والإنسان يقرر. ليست رأي تدقيق نهائي.",
    metrics,
    sections,
    engagements: engagementRows,
    workpaperTotal,
    samplingPlanTotal,
  };
}
