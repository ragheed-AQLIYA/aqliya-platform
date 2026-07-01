/**
 * PrismaDealRepository — SPEC-01a §5
 *
 * Production adapter. Maps SalesDeal (Prisma) ↔ Deal (Domain).
 * Layer boundary: Domain types never leak into Prisma models.
 * Version is stored in metadata JSON until schema migration adds a version column.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { DealRepository, DealFilter } from "../domain/repository";
import { Deal } from "../domain/deal";
import type { ReviewDecision } from "../domain/deal";
import { Amount } from "../domain/value-objects/amount";
import { Probability } from "../domain/value-objects/probability";
import { Currency } from "../domain/value-objects/currency";
import { Stage } from "../domain/value-objects/stage";
import { ConcurrencyError, NotFoundError } from "../domain/errors";

// ─── Mappers: Prisma ↔ Domain ───

type PrismaDeal = Prisma.SalesDealGetPayload<{
  select: {
    id: true; organizationId: true; accountId: true; name: true; title: true;
    pipelineStage: true; status: true; amount: true; currency: true;
    probability: true; expectedCloseDate: true; reviewStatus: true;
    ownerId: true; createdById: true; updatedById: true;
    createdAt: true; updatedAt: true; metadata: true;
  };
}>;

function toDomain(row: PrismaDeal): Deal {
  const meta = (row.metadata as Record<string, unknown> | null) ?? {};
  const lifecycle = (meta.lifecycle as string) ?? (row.status === "closed" ? "closed" : "active");
  const dealVersion = typeof meta.version === "number" ? meta.version : 1;

  return Deal.reconstitute({
    id: row.id,
    accountId: row.accountId,
    name: row.name ?? row.title,
    organizationId: row.organizationId,
    amount: Amount.create(row.amount ?? 0),
    currency: Currency.create(row.currency),
    probability: Probability.create(row.probability ?? 0),
    expectedCloseDate: row.expectedCloseDate?.toISOString(),
    ownerId: row.ownerId ?? "",
    createdById: row.createdById ?? "",
    updatedById: row.updatedById ?? undefined,
    stage: Stage.create(row.pipelineStage),
    reviewStatus: (row.reviewStatus as "draft" | "in_review" | "approved" | "rejected") ?? "draft",
    reviewDecisions: Array.isArray(meta.reviewDecisions) ? (meta.reviewDecisions as ReviewDecision[]) : [],
    evidenceCount: 0, // computed from Platform Evidence Network on read
    version: dealVersion,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    lifecycle: lifecycle as "active" | "closed" | "archived",
    closedAt: meta.closedAt as string | undefined,
    lossReason: meta.lossReason as string | undefined,
    competitor: meta.competitor as string | undefined,
  });
}

function toPrisma(deal: Deal): Prisma.SalesDealUpdateInput {
  const props = deal.toJSON();
  return {
    organizationId: props.organizationId,
    name: props.name,
    title: props.name,
    pipelineStage: props.stage.name,
    status: props.stage.isClosed ? "closed" : props.lifecycle === "archived" ? "archived" : "open",
    amount: props.amount.value,
    currency: props.currency.code,
    probability: props.probability.value,
    expectedCloseDate: props.expectedCloseDate ? new Date(props.expectedCloseDate) : undefined,
    reviewStatus: props.reviewStatus,
    ownerId: props.ownerId,
    updatedById: props.updatedById,
    metadata: {
      version: props.version,
      lifecycle: props.lifecycle,
      reviewDecisions: props.reviewDecisions,
      closedAt: props.closedAt,
      lossReason: props.lossReason,
      competitor: props.competitor,
      evidenceCount: props.evidenceCount,
      riskFlags: props.metadata?.riskFlags ?? [],
      signals: props.metadata?.signals ?? [],
    } as unknown as Prisma.InputJsonValue,
  };
}

// ─── Repository ───

export class PrismaDealRepository implements DealRepository {
  async findById(dealId: string, organizationId: string): Promise<Deal | null> {
    const row = await prisma.salesDeal.findFirst({
      where: { id: dealId, organizationId },
      select: {
        id: true, organizationId: true, accountId: true, name: true, title: true,
        pipelineStage: true, status: true, amount: true, currency: true,
        probability: true, expectedCloseDate: true, reviewStatus: true,
        ownerId: true, createdById: true, updatedById: true,
        createdAt: true, updatedAt: true, metadata: true,
      },
    });
    return row ? toDomain(row) : null;
  }

  async findMany(filter: DealFilter, organizationId: string): Promise<Deal[]> {
    const where: Prisma.SalesDealWhereInput = { organizationId };

    if (filter.stage) where.pipelineStage = filter.stage;
    if (filter.ownerId) where.ownerId = filter.ownerId;
    if (filter.status === "open") where.pipelineStage = { notIn: ["Closed Won", "Closed Lost"] };
    if (filter.status === "closed") where.pipelineStage = { in: ["Closed Won", "Closed Lost"] };
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: "insensitive" } },
        { accountId: { contains: filter.search, mode: "insensitive" } },
      ];
    }
    if (filter.dateFrom) where.expectedCloseDate = { ...(where.expectedCloseDate as object ?? {}), gte: new Date(filter.dateFrom) };
    if (filter.dateTo) where.expectedCloseDate = { ...(where.expectedCloseDate as object ?? {}), lte: new Date(filter.dateTo) };

    const page = filter.page ?? 1;
    const limit = Math.min(filter.limit ?? 20, 100);
    const rows = await prisma.salesDeal.findMany({
      where,
      select: {
        id: true, organizationId: true, accountId: true, name: true, title: true,
        pipelineStage: true, status: true, amount: true, currency: true,
        probability: true, expectedCloseDate: true, reviewStatus: true,
        ownerId: true, createdById: true, updatedById: true,
        createdAt: true, updatedAt: true, metadata: true,
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return rows.map(toDomain);
  }

  async save(deal: Deal): Promise<Deal> {
    const props = deal.toJSON();
    const prismaData = toPrisma(deal);

    // Check for existing deal to enforce concurrency
    const existing = await prisma.salesDeal.findUnique({
      where: { id: deal.id },
      select: { id: true, metadata: true },
    });

    if (existing) {
      // Optimistic concurrency: version must match
      const meta = (existing.metadata as Record<string, unknown> | null) ?? {};
      const currentVersion = typeof meta.version === "number" ? meta.version : 0;
      if (props.version !== currentVersion) {
        throw new ConcurrencyError(
          `Version mismatch: expected ${props.version}, actual ${currentVersion}`,
          props.version,
          currentVersion,
        );
      }
      // Increment version
      const updatedMeta = {
        ...((prismaData.metadata as Record<string, unknown>) ?? {}),
        version: currentVersion + 1,
      };
      await prisma.salesDeal.update({
        where: { id: deal.id },
        data: {
          ...prismaData,
          metadata: updatedMeta as Prisma.InputJsonValue,
        },
      });
      // Reload to return with correct version
      return (await this.findById(deal.id, props.organizationId))!;
    }

    // New deal
    const created = await prisma.salesDeal.create({
      data: {
        id: deal.id,
        organizationId: props.organizationId,
        accountId: props.accountId,
        name: props.name,
        title: props.name,
        pipelineStage: props.stage.name,
        status: "open",
        amount: props.amount.value,
        currency: props.currency.code,
        probability: props.probability.value,
        expectedCloseDate: props.expectedCloseDate ? new Date(props.expectedCloseDate) : undefined,
        reviewStatus: "draft",
        ownerId: props.ownerId,
        createdById: props.createdById,
        metadata: { version: 1, lifecycle: "created" } as Prisma.InputJsonValue,
      },
      select: {
        id: true, organizationId: true, accountId: true, name: true, title: true,
        pipelineStage: true, status: true, amount: true, currency: true,
        probability: true, expectedCloseDate: true, reviewStatus: true,
        ownerId: true, createdById: true, updatedById: true,
        createdAt: true, updatedAt: true, metadata: true,
      },
    });
    return toDomain(created);
  }

  async archive(dealId: string, organizationId: string): Promise<void> {
    const existing = await prisma.salesDeal.findFirst({
      where: { id: dealId, organizationId },
      select: { id: true, metadata: true },
    });
    if (!existing) throw new NotFoundError("Deal not found", { dealId });

    await prisma.salesDeal.update({
      where: { id: dealId },
      data: {
        status: "archived",
        metadata: {
          ...(existing.metadata as Record<string, unknown> ?? {}),
          lifecycle: "archived",
        },
      } as unknown as Prisma.SalesDealUncheckedUpdateInput,
    });
  }
}
