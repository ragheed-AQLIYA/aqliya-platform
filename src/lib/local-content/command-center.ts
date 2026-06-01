import "server-only";

import { listProjectsByOrganization } from "@/lib/local-content/services";
import { getProductById } from "@/lib/platform/registry/runtime";
import { buildContentGovernanceLifecycle } from "./vnext/content-governance-runtime";
import {
  groupCalendarByMonth,
  type ContentCalendarEntry,
} from "./vnext/content-calendar";
import { buildCampaignIntelligence } from "./vnext/campaign-intelligence";
import { scoreContentPerformance } from "./vnext/content-performance";
import { buildPublishingIntelligence } from "./vnext/publishing-intelligence";

export async function buildLocalContentCommandCenter(organizationId: string) {
  const registry = getProductById("local_content");
  const projects = await listProjectsByOrganization(organizationId);
  const governance = projects.map((p) =>
    buildContentGovernanceLifecycle({
      projectId: p.id,
      organizationId,
      ownerId: "system",
      projectStatus: p.status,
      sourceCount: 0,
      evidenceCompletePct: 50,
    }),
  );

  const inReview = projects.filter((p) => p.status === "InReview").length;
  const draft = projects.filter((p) => p.status === "Draft").length;

  const campaigns = await import("./campaign-operations").then((m) =>
    m.listCampaignOperations(organizationId),
  );
  const campaignInsights = buildCampaignIntelligence(campaigns);
  const performanceHighlights = projects.slice(0, 6).map((p) =>
    scoreContentPerformance({
      projectId: p.id,
      status: p.status,
      evidenceCompletePct: 50,
      sourceCount: 0,
    }),
  );
  const publishingMetrics = projects.slice(0, 4).map((p) =>
    buildPublishingIntelligence({
      projectId: p.id,
      status: p.status,
      updatedAt: p.createdAt,
    }),
  );

  return {
    productId: registry.slug,
    disclaimerAr:
      "عمليات محتوى محكومة — الذكاء يساعد والإنسان يقرر. ليست شهادة امتثام نهائية.",
    sections: [
      {
        id: "projects",
        labelAr: "مشاريع",
        count: projects.length,
        href: "/local-content",
      },
      {
        id: "draft",
        labelAr: "مسودة",
        count: draft,
        href: "/local-content/command-center#draft",
      },
      {
        id: "review",
        labelAr: "مراجعة",
        count: inReview,
        href: "/local-content/command-center#review",
      },
      {
        id: "editorial",
        labelAr: "مراحل تحريرية",
        count: projects.length,
        href: "/local-content/calendar",
      },
      {
        id: "campaigns",
        labelAr: "حملات",
        count: campaigns.length,
        href: "/local-content/campaigns",
      },
    ],
    projectCount: projects.length,
    inReview,
    draft,
    campaigns: campaigns.slice(0, 8),
    projects: projects.slice(0, 12).map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      href: `/local-content/projects/${p.id}`,
    })),
    governanceHighlights: governance.slice(0, 5),
    campaignInsights: campaignInsights.slice(0, 6),
    performanceHighlights,
    publishingMetrics,
  };
}

export async function buildOrganizationContentCalendar(
  organizationId: string,
): Promise<ReturnType<typeof groupCalendarByMonth>> {
  const projects = await listProjectsByOrganization(organizationId);
  const entries: ContentCalendarEntry[] = projects.map((p) => ({
    id: `cal-${p.id}`,
    projectId: p.id,
    organizationId,
    title: p.name,
    titleAr: p.name,
    scheduledDate: p.createdAt.toISOString(),
    status:
      p.status === "Published"
        ? "published"
        : p.status === "InReview"
          ? "in_review"
          : p.status === "Approved"
            ? "approved"
            : "planned",
    ownerId: "system",
    complianceTags: ["local-content"],
  }));
  return groupCalendarByMonth(entries);
}
