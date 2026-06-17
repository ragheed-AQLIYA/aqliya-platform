import "server-only";

import { prisma } from "@/lib/prisma";
import {
  mapPrismaSalesAccount,
  mapPrismaSalesContact,
  mapPrismaSalesInteraction,
  mapPrismaSalesOpportunity,
} from "./prisma-legacy-adapters";
import type {
  SalesAccount,
  SalesContact,
  SalesInteractionLog,
  SalesOpportunity,
  SalesWinLossInsight,
} from "./types";

/** Prisma-backed org snapshot for executive / intelligence surfaces (replaces in-memory store reads). */
export async function loadOrgSalesDataFromPrisma(organizationId: string): Promise<{
  accounts: SalesAccount[];
  opportunities: SalesOpportunity[];
  interactions: SalesInteractionLog[];
  icpInsights: ReturnType<typeof emptyIcpInsights>;
  winLossInsights: SalesWinLossInsight[];
  contacts: SalesContact[];
}> {
  const [accounts, deals, interactions, contacts] = await Promise.all([
    prisma.salesAccount.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        status: true,
        industry: true,
        metadata: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    }),
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
        metadata: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        stage: { select: { name: true, slug: true } },
      },
      orderBy: { updatedAt: "desc" },
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
    prisma.salesContact.findMany({
      where: { organizationId },
      select: {
        id: true,
        accountId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const mappedAccounts = accounts.map((a) =>
    mapPrismaSalesAccount({
      id: a.id,
      organizationId,
      name: a.name,
      status: a.status,
      industry: a.industry,
      metadata: (a.metadata ?? {}) as Record<string, unknown>,
      createdById: a.createdById,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }),
  );

  const opportunities = deals.map((d) => {
    const meta = (d.metadata ?? {}) as Record<string, unknown>;
    return mapPrismaSalesOpportunity({
      id: d.id,
      organizationId,
      accountId: d.accountId,
      title: d.title,
      status: d.status,
      amount: d.amount,
      currency: d.currency,
      probability: d.probability,
      expectedCloseDate: d.expectedCloseDate,
      stage: d.stage,
      metadata: meta,
      createdById: d.createdById,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    });
  });

  const winLossInsights: SalesWinLossInsight[] = deals
    .filter((d) => {
      const meta = (d.metadata ?? {}) as Record<string, unknown>;
      return typeof meta.winLossReason === "string" && meta.winLossReason.length > 0;
    })
    .map((d) => {
      const meta = (d.metadata ?? {}) as Record<string, unknown>;
      const outcome =
        d.status === "won" || d.stage?.slug === "won-lost"
          ? ("won" as const)
          : ("lost" as const);
      return {
        id: `wl-${d.id}`,
        organizationId,
        opportunityId: d.id,
        accountId: d.accountId,
        outcome,
        primaryReason: String(meta.winLossReason),
        createdById: d.createdById ?? "",
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
        status: "active" as const,
        source: "manual" as const,
        confidence: 0.7,
      };
    });

  return {
    accounts: mappedAccounts,
    opportunities,
    interactions: interactions.map((i) =>
      mapPrismaSalesInteraction({
        ...i,
        organizationId,
      }),
    ),
    icpInsights: emptyIcpInsights(),
    winLossInsights,
    contacts: contacts.map((c) =>
      mapPrismaSalesContact({
        ...c,
        organizationId,
      }),
    ),
  };
}

function emptyIcpInsights(): never[] {
  return [];
}
