import "server-only";
import { prisma } from "@/lib/prisma";
import {
  buildRevenueIntelligenceSnapshot,
  type RevenueIntelligenceSnapshot,
} from "./vnext/revenue-intelligence";
import { mapDealStageToLegacy } from "./prisma-legacy-adapters";

export async function getRevenueIntelligenceFromPrisma(
  organizationId: string,
): Promise<RevenueIntelligenceSnapshot> {
  const [deals, interactions] = await Promise.all([
    prisma.salesDeal.findMany({
      where: { organizationId },
      select: {
        id: true,
        title: true,
        status: true,
        amount: true,
        currency: true,
        probability: true,
        expectedCloseDate: true,
        accountId: true,
        stageId: true,
        stage: { select: { name: true, slug: true } },
        metadata: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.salesInteraction.findMany({
      where: { organizationId },
      select: {
        id: true,
        accountId: true,
        dealId: true,
        type: true,
        subject: true,
        summary: true,
        occurredAt: true,
        createdById: true,
      },
    }),
  ]);

  const opportunities = deals.map((d) => {
    const meta = (d.metadata ?? {}) as Record<string, unknown>;
    return {
      id: d.id,
      organizationId,
      accountId: d.accountId,
      name: d.title,
      stage: mapDealStageToLegacy({
        stageName: d.stage?.name,
        stageSlug: d.stage?.slug,
        status: d.status,
        metadata: meta,
      }),
      valueEstimate: d.amount ?? undefined,
      currency: d.currency,
      probability: d.probability ?? undefined,
      expectedCloseDate: d.expectedCloseDate?.toISOString(),
      risks: Array.isArray(meta.risks)
        ? (meta.risks as string[])
        : undefined,
      ownerId: "",
      createdById: d.createdById ?? "",
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      reviewStatus: (meta.reviewStatus as string) ?? undefined,
      approvalStatus: (meta.approvalStatus as string) ?? undefined,
      source: "seed" as const,
    };
  });

  const mappedInteractions = interactions.map((i) => {
    const type:
      | "call"
      | "meeting"
      | "email"
      | "note" =
      i.type === "call" || i.type === "meeting" || i.type === "email"
        ? i.type
        : "note";
    return {
      id: i.id,
      organizationId,
      accountId: i.accountId,
      opportunityId: i.dealId ?? undefined,
      type,
      summary: i.summary ?? i.subject ?? "",
      loggedById: i.createdById ?? "",
      loggedAt: i.occurredAt.toISOString(),
    };
  });

  return buildRevenueIntelligenceSnapshot({
    opportunities,
    interactions: mappedInteractions,
  });
}
