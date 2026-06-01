import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "./audit-events";
import type { CreateSalesDealInput, UpdateSalesDealInput } from "./validation";
import {
  validateCreateSalesDealInput,
  validateUpdateSalesDealInput,
} from "./validation";
import {
  assertStageChangeGovernance,
  countDealEvidenceLinks,
} from "./governance";
import type { UserRole } from "@prisma/client";

export interface SalesOrgScope {
  organizationId: string;
  platformOrganizationId?: string | null;
}

export interface SalesActor {
  id: string;
  name?: string | null;
  role?: string;
}

const dealListSelect = {
  id: true,
  title: true,
  status: true,
  amount: true,
  currency: true,
  probability: true,
  expectedCloseDate: true,
  accountId: true,
  stageId: true,
  isDemo: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  account: { select: { id: true, name: true } },
  stage: { select: { id: true, name: true, slug: true, sortOrder: true } },
} as const;

export async function listSalesDeals(organizationId: string) {
  return prisma.salesDeal.findMany({
    where: { organizationId },
    select: dealListSelect,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getSalesDeal(dealId: string, organizationId: string) {
  return prisma.salesDeal.findFirst({
    where: { id: dealId, organizationId },
    select: dealListSelect,
  });
}

export async function listSalesAccounts(organizationId: string) {
  return prisma.salesAccount.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      status: true,
      industry: true,
      isDemo: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getSalesAccount(
  accountId: string,
  organizationId: string,
) {
  return prisma.salesAccount.findFirst({
    where: { id: accountId, organizationId },
    select: {
      id: true,
      name: true,
      status: true,
      industry: true,
      isDemo: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
      deals: {
        select: { id: true, title: true, status: true, amount: true },
        orderBy: { updatedAt: "desc" },
        take: 20,
      },
    },
  });
}

export async function listSalesPipelineStages(
  organizationId: string,
  pipelineId?: string,
) {
  const pipeline =
    pipelineId != null
      ? await prisma.salesPipeline.findFirst({
          where: { id: pipelineId, organizationId },
        })
      : await prisma.salesPipeline.findFirst({
          where: { organizationId, isDefault: true, status: "active" },
          orderBy: { createdAt: "asc" },
        });

  if (!pipeline) {
    return [];
  }

  return prisma.salesPipelineStage.findMany({
    where: { pipelineId: pipeline.id, organizationId },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      pipelineId: true,
      name: true,
      slug: true,
      sortOrder: true,
      isClosed: true,
      status: true,
    },
  });
}

export async function createSalesDeal(
  organizationId: string,
  input: CreateSalesDealInput,
  actor: { id: string; name?: string; platformOrganizationId?: string | null },
) {
  const validated = validateCreateSalesDealInput(input);

  const account = await prisma.salesAccount.findFirst({
    where: { id: validated.accountId, organizationId },
  });
  if (!account) {
    throw new Error("Account not found for this organization");
  }

  if (validated.stageId) {
    const stage = await prisma.salesPipelineStage.findFirst({
      where: { id: validated.stageId, organizationId },
    });
    if (!stage) {
      throw new Error("Pipeline stage not found for this organization");
    }
  }

  const deal = await prisma.salesDeal.create({
    data: {
      organizationId,
      platformOrganizationId: actor.platformOrganizationId ?? null,
      accountId: validated.accountId,
      stageId: validated.stageId ?? null,
      title: validated.title,
      status: validated.status ?? "open",
      amount: validated.amount ?? null,
      currency: validated.currency ?? "SAR",
      probability: validated.probability ?? null,
      expectedCloseDate: validated.expectedCloseDate ?? null,
      metadata: validated.metadata ?? undefined,
      createdById: actor.id,
      updatedById: actor.id,
    },
    select: dealListSelect,
  });

  await recordSalesAuditEvent({
    organizationId,
    platformOrganizationId: actor.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.DEAL_CREATED,
    targetType: "SalesDeal",
    targetId: deal.id,
    metadata: {
      title: deal.title,
      accountId: deal.accountId,
      stageId: deal.stageId,
    },
  });

  return deal;
}

export async function updateSalesDeal(
  dealId: string,
  scope: SalesOrgScope | string,
  input: UpdateSalesDealInput,
  actor: {
    id: string;
    name?: string;
    role?: UserRole;
    platformOrganizationId?: string | null;
  },
) {
  const organizationId =
    typeof scope === "string" ? scope : scope.organizationId;
  const platformOrganizationId =
    typeof scope === "string"
      ? actor.platformOrganizationId
      : scope.platformOrganizationId;
  const validated = validateUpdateSalesDealInput(input);

  const existing = await prisma.salesDeal.findFirst({
    where: { id: dealId, organizationId },
    select: { id: true, stageId: true, status: true, title: true },
  });
  if (!existing) {
    throw new Error("Deal not found");
  }

  if (validated.accountId) {
    const account = await prisma.salesAccount.findFirst({
      where: { id: validated.accountId, organizationId },
    });
    if (!account) {
      throw new Error("Account not found for this organization");
    }
  }

  let targetStage: { id: string; slug: string } | null = null;
  if (validated.stageId) {
    targetStage = await prisma.salesPipelineStage.findFirst({
      where: { id: validated.stageId, organizationId },
      select: { id: true, slug: true },
    });
    if (!targetStage) {
      throw new Error("Pipeline stage not found for this organization");
    }
  }

  const stageChanged =
    validated.stageId !== undefined && validated.stageId !== existing.stageId;

  if (stageChanged && targetStage) {
    const evidenceLinkCount = await countDealEvidenceLinks(organizationId, dealId);
    const governance = assertStageChangeGovernance({
      dealId,
      toStageSlug: targetStage.slug,
      evidenceLinkCount,
      governanceOverrideReason: validated.governanceOverrideReason,
      actorRole: actor.role,
    });

    if (governance.usedOverride && governance.overrideReason) {
      await recordSalesAuditEvent({
        organizationId,
        platformOrganizationId,
        actorId: actor.id,
        actorName: actor.name,
        action: SalesAuditActions.GOVERNANCE_OVERRIDE,
        targetType: "SalesDeal",
        targetId: dealId,
        metadata: {
          toStageSlug: targetStage.slug,
          reason: governance.overrideReason,
        },
      });
    }
  }

  const deal = await prisma.salesDeal.update({
    where: { id: dealId },
    data: {
      ...(validated.title !== undefined ? { title: validated.title.trim() } : {}),
      ...(validated.accountId !== undefined
        ? { accountId: validated.accountId }
        : {}),
      ...(validated.stageId !== undefined ? { stageId: validated.stageId } : {}),
      ...(validated.amount !== undefined ? { amount: validated.amount } : {}),
      ...(validated.currency !== undefined ? { currency: validated.currency } : {}),
      ...(validated.probability !== undefined
        ? { probability: validated.probability }
        : {}),
      ...(validated.expectedCloseDate !== undefined
        ? { expectedCloseDate: validated.expectedCloseDate }
        : {}),
      ...(validated.status !== undefined ? { status: validated.status } : {}),
      ...(validated.metadata !== undefined ? { metadata: validated.metadata } : {}),
      updatedById: actor.id,
    },
    select: dealListSelect,
  });

  await recordSalesAuditEvent({
    organizationId,
    platformOrganizationId: actor.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.DEAL_UPDATED,
    targetType: "SalesDeal",
    targetId: deal.id,
    metadata: { fields: Object.keys(validated) },
  });

  if (stageChanged) {
    await recordSalesAuditEvent({
      organizationId,
      platformOrganizationId: actor.platformOrganizationId,
      actorId: actor.id,
      actorName: actor.name,
      action: SalesAuditActions.DEAL_STAGE_CHANGED,
      targetType: "SalesDeal",
      targetId: deal.id,
      metadata: {
        fromStageId: existing.stageId,
        toStageId: deal.stageId,
      },
    });
  }

  return deal;
}

export interface SalesDashboardStats {
  dataAvailable: boolean;
  totalAccounts: number;
  totalDeals: number;
  openDeals: number;
  dealsByStage: {
    stageId: string | null;
    stageName: string;
    stageSlug: string;
    count: number;
  }[];
  latestDeals: {
    id: string;
    title: string;
    accountName: string;
    status: string;
    updatedAt: Date;
  }[];
}

export async function getSalesDashboardStats(
  organizationId: string,
): Promise<SalesDashboardStats> {
  const empty: SalesDashboardStats = {
    dataAvailable: false,
    totalAccounts: 0,
    totalDeals: 0,
    openDeals: 0,
    dealsByStage: [],
    latestDeals: [],
  };

  try {
    const [totalAccounts, totalDeals, openDeals, stageGroups, latestDeals] =
      await Promise.all([
        prisma.salesAccount.count({ where: { organizationId } }),
        prisma.salesDeal.count({ where: { organizationId } }),
        prisma.salesDeal.count({
          where: { organizationId, status: "open" },
        }),
        prisma.salesDeal.groupBy({
          by: ["stageId"],
          where: { organizationId, status: "open" },
          _count: { _all: true },
        }),
        prisma.salesDeal.findMany({
          where: { organizationId },
          select: {
            id: true,
            title: true,
            status: true,
            updatedAt: true,
            account: { select: { name: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 5,
        }),
      ]);

    const stageIds = stageGroups
      .map((g) => g.stageId)
      .filter((id): id is string => id != null);

    const stages =
      stageIds.length > 0
        ? await prisma.salesPipelineStage.findMany({
            where: { id: { in: stageIds } },
            select: { id: true, name: true, slug: true, sortOrder: true },
          })
        : [];

    const stageMap = new Map(stages.map((s) => [s.id, s]));

    const dealsByStage = stageGroups
      .map((g) => {
        const stage = g.stageId ? stageMap.get(g.stageId) : null;
        return {
          stageId: g.stageId,
          stageName: stage?.name ?? "بدون مرحلة",
          stageSlug: stage?.slug ?? "unassigned",
          count: g._count._all,
          sortOrder: stage?.sortOrder ?? 999,
        };
      })
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ sortOrder: _sortOrder, ...rest }) => rest);

    const unassigned = stageGroups.find((g) => g.stageId === null);
    if (unassigned) {
      dealsByStage.push({
        stageId: null,
        stageName: "بدون مرحلة",
        stageSlug: "unassigned",
        count: unassigned._count._all,
      });
    }

    return {
      dataAvailable: true,
      totalAccounts,
      totalDeals,
      openDeals,
      dealsByStage,
      latestDeals: latestDeals.map((d) => ({
        id: d.id,
        title: d.title,
        accountName: d.account.name,
        status: d.status,
        updatedAt: d.updatedAt,
      })),
    };
  } catch {
    return empty;
  }
}

export interface CreateSalesAccountInput {
  name: string;
  industry?: string | null;
  status?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateSalesAccountInput {
  name?: string;
  industry?: string | null;
  status?: string;
  metadata?: Record<string, unknown>;
}

export async function createSalesAccount(
  scope: SalesOrgScope,
  input: CreateSalesAccountInput,
  actor: { id: string; name?: string | null; platformOrganizationId?: string | null },
) {
  const name = input.name?.trim();
  if (!name) {
    throw new Error("SalesOS validation: account name is required");
  }

  const account = await prisma.salesAccount.create({
    data: {
      organizationId: scope.organizationId,
      platformOrganizationId:
        actor.platformOrganizationId ?? scope.platformOrganizationId ?? null,
      name,
      industry: input.industry?.trim() || null,
      status: input.status ?? "prospect",
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      createdById: actor.id,
      updatedById: actor.id,
    },
    select: {
      id: true,
      name: true,
      status: true,
      industry: true,
      isDemo: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.ACCOUNT_CREATED,
    targetType: "SalesAccount",
    targetId: account.id,
  });

  return account;
}

export async function updateSalesAccount(
  accountId: string,
  scope: SalesOrgScope,
  input: UpdateSalesAccountInput,
  actor: { id: string; name?: string | null },
) {
  const existing = await prisma.salesAccount.findFirst({
    where: { id: accountId, organizationId: scope.organizationId },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("SalesOS: account not found in organization");
  }

  const account = await prisma.salesAccount.update({
    where: { id: accountId },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.industry !== undefined
        ? { industry: input.industry?.trim() || null }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.metadata !== undefined
        ? { metadata: input.metadata as Prisma.InputJsonValue }
        : {}),
      updatedById: actor.id,
    },
    select: {
      id: true,
      name: true,
      status: true,
      industry: true,
      isDemo: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.ACCOUNT_UPDATED,
    targetType: "SalesAccount",
    targetId: account.id,
  });

  return account;
}

export async function listSalesDealAuditEvents(
  dealId: string,
  organizationId: string,
  limit = 50,
) {
  return prisma.salesAuditEvent.findMany({
    where: {
      organizationId,
      OR: [
        { targetType: "SalesDeal", targetId: dealId },
        {
          metadata: {
            path: ["dealId"],
            equals: dealId,
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      actorId: true,
      actorName: true,
      targetType: true,
      targetId: true,
      metadata: true,
      createdAt: true,
    },
  });
}

export async function updateDealNextAction(
  dealId: string,
  scope: SalesOrgScope,
  input: { nextAction?: string | null; nextActionAt?: Date | null },
  actor: { id: string; name?: string | null },
) {
  const { mergeDealNextActionMetadata, readDealNextAction } = await import(
    "./deal-metadata"
  );
  const deal = await prisma.salesDeal.findFirst({
    where: { id: dealId, organizationId: scope.organizationId },
    select: { id: true, metadata: true },
  });
  if (!deal) {
    throw new Error("SalesOS: deal not found");
  }
  const existing =
    deal.metadata && typeof deal.metadata === "object"
      ? (deal.metadata as Record<string, unknown>)
      : {};
  const nextMeta = mergeDealNextActionMetadata(existing, input);
  await prisma.salesDeal.update({
    where: { id: dealId },
    data: {
      metadata: nextMeta as Prisma.InputJsonValue,
      updatedById: actor.id,
    },
  });
  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.DEAL_NEXT_ACTION_SET,
    targetType: "SalesDeal",
    targetId: dealId,
    metadata: readDealNextAction(nextMeta),
  });
  return readDealNextAction(nextMeta);
}

export { partitionPipelineDeals, buildDueNextActions } from "./services/reporting-helpers";
export type { DueNextActionItem } from "./services/reporting-helpers";
