import "server-only";
import { prisma } from "@/lib/prisma";
import type { SalesAccount } from "../types";
import type { Prisma } from "@prisma/client";
import {
  prismaAccountToDomain,
  domainAccountToPrisma,
} from "./entity-mappers";

export const accountRepository = {
  async findById(
    organizationId: string,
    id: string,
  ): Promise<SalesAccount | null> {
    const row = await prisma.salesAccount.findFirst({
      where: { id, organizationId },
    });
    return row ? prismaAccountToDomain(row) : null;
  },

  async findByOrganization(
    organizationId: string,
  ): Promise<SalesAccount[]> {
    const rows = await prisma.salesAccount.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(prismaAccountToDomain);
  },

  async create(account: SalesAccount): Promise<void> {
    const data = domainAccountToPrisma(account);
    await prisma.salesAccount.create({ data });
  },

  async update(
    organizationId: string,
    id: string,
    patch: Partial<SalesAccount>,
  ): Promise<void> {
    const data: Prisma.SalesAccountUpdateInput = {};
    if (patch.name !== undefined) data.name = patch.name;
    if (patch.status !== undefined) data.status = patch.status;
    if (patch.industry !== undefined) data.industry = patch.industry;
    await prisma.salesAccount.updateMany({
      where: { id, organizationId },
      data,
    });
  },

  async delete(organizationId: string, id: string): Promise<boolean> {
    const result = await prisma.salesAccount.deleteMany({
      where: { id, organizationId },
    });
    return result.count > 0;
  },

  async count(organizationId: string): Promise<number> {
    return prisma.salesAccount.count({
      where: { organizationId },
    });
  },
};
