import "server-only";
import { prisma } from "@/lib/prisma";
import type { SalesInteractionLog } from "../types";
import type { Prisma } from "@prisma/client";
import {
  prismaInteractionToDomain,
  domainInteractionToPrisma,
} from "./entity-mappers";

export const interactionRepository = {
  async findById(
    organizationId: string,
    id: string,
  ): Promise<SalesInteractionLog | null> {
    const row = await prisma.salesInteraction.findFirst({
      where: { id, organizationId },
    });
    return row ? prismaInteractionToDomain(row) : null;
  },

  async findByOrganization(
    organizationId: string,
  ): Promise<SalesInteractionLog[]> {
    const rows = await prisma.salesInteraction.findMany({
      where: { organizationId },
      orderBy: { occurredAt: "desc" },
    });
    return rows.map(prismaInteractionToDomain);
  },

  async findByOpportunity(
    organizationId: string,
    dealId: string,
  ): Promise<SalesInteractionLog[]> {
    const rows = await prisma.salesInteraction.findMany({
      where: { organizationId, dealId },
      orderBy: { occurredAt: "desc" },
    });
    return rows.map(prismaInteractionToDomain);
  },

  async findByAccount(
    organizationId: string,
    accountId: string,
  ): Promise<SalesInteractionLog[]> {
    const rows = await prisma.salesInteraction.findMany({
      where: { organizationId, accountId },
      orderBy: { occurredAt: "desc" },
    });
    return rows.map(prismaInteractionToDomain);
  },

  async create(interaction: SalesInteractionLog): Promise<void> {
    const data = domainInteractionToPrisma(interaction);
    await prisma.salesInteraction.create({ data });
  },

  async delete(organizationId: string, id: string): Promise<boolean> {
    const result = await prisma.salesInteraction.deleteMany({
      where: { id, organizationId },
    });
    return result.count > 0;
  },

  async count(organizationId: string): Promise<number> {
    return prisma.salesInteraction.count({
      where: { organizationId },
    });
  },
};
