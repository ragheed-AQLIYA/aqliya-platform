import "server-only";
import { prisma } from "@/lib/prisma";
import type { SalesOpportunity } from "../types";
import type { Prisma } from "@prisma/client";
import {
  prismaDealToOpportunity,
  domainOpportunityToDealCreate,
} from "./entity-mappers";

export const opportunityRepository = {
  async findById(
    organizationId: string,
    id: string,
  ): Promise<SalesOpportunity | null> {
    const row = await prisma.salesDeal.findFirst({
      where: { id, organizationId },
    });
    return row ? prismaDealToOpportunity(row) : null;
  },

  async findByOrganization(
    organizationId: string,
  ): Promise<SalesOpportunity[]> {
    const rows = await prisma.salesDeal.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(prismaDealToOpportunity);
  },

  async findByAccount(
    organizationId: string,
    accountId: string,
  ): Promise<SalesOpportunity[]> {
    const rows = await prisma.salesDeal.findMany({
      where: { organizationId, accountId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(prismaDealToOpportunity);
  },

  async create(opportunity: SalesOpportunity): Promise<void> {
    const data = domainOpportunityToDealCreate(opportunity);
    await prisma.salesDeal.create({ data });
  },

  async update(
    organizationId: string,
    id: string,
    patch: Partial<SalesOpportunity>,
  ): Promise<void> {
    const data: Prisma.SalesDealUpdateInput = {};
    if (patch.name !== undefined) data.title = patch.name;
    if (patch.valueEstimate !== undefined) data.amount = patch.valueEstimate;
    if (patch.currency !== undefined) data.currency = patch.currency;
    if (patch.probability !== undefined) data.probability = patch.probability;
    if (patch.expectedCloseDate !== undefined) {
      data.expectedCloseDate = new Date(patch.expectedCloseDate);
    }
    if (patch.stage !== undefined) {
      data.metadata = {
        stage: patch.stage,
        reviewStatus: patch.reviewStatus,
        approvalStatus: patch.approvalStatus,
      } as Prisma.InputJsonValue;
    }
    if (patch.reviewStatus !== undefined) {
      const existing = await prisma.salesDeal.findFirst({
        where: { id, organizationId },
        select: { metadata: true },
      });
      const meta = (existing?.metadata as Record<string, unknown>) ?? {};
      data.metadata = {
        ...meta,
        reviewStatus: patch.reviewStatus,
      } as Prisma.InputJsonValue;
    }
    await prisma.salesDeal.updateMany({
      where: { id, organizationId },
      data,
    });
  },

  async delete(organizationId: string, id: string): Promise<boolean> {
    const result = await prisma.salesDeal.deleteMany({
      where: { id, organizationId },
    });
    return result.count > 0;
  },

  async count(organizationId: string): Promise<number> {
    return prisma.salesDeal.count({
      where: { organizationId },
    });
  },
};
