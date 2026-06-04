import "server-only";
import { prisma } from "@/lib/prisma";
import type { SalesContact } from "../types";
import type { Prisma } from "@prisma/client";
import {
  prismaContactToDomain,
  domainContactToPrisma,
} from "./entity-mappers";

export const contactRepository = {
  async findById(
    organizationId: string,
    id: string,
  ): Promise<SalesContact | null> {
    const row = await prisma.salesContact.findFirst({
      where: { id, organizationId },
    });
    return row ? prismaContactToDomain(row) : null;
  },

  async findByAccount(
    organizationId: string,
    accountId: string,
  ): Promise<SalesContact[]> {
    const rows = await prisma.salesContact.findMany({
      where: { organizationId, accountId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(prismaContactToDomain);
  },

  async findByOrganization(
    organizationId: string,
  ): Promise<SalesContact[]> {
    const rows = await prisma.salesContact.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(prismaContactToDomain);
  },

  async create(contact: SalesContact): Promise<void> {
    const data = domainContactToPrisma(contact);
    await prisma.salesContact.create({ data });
  },

  async update(
    organizationId: string,
    id: string,
    patch: Partial<SalesContact>,
  ): Promise<void> {
    const data: Prisma.SalesContactUpdateInput = {};
    if (patch.name !== undefined) data.name = patch.name;
    if (patch.email !== undefined) data.email = patch.email;
    if (patch.title !== undefined) data.role = patch.title;
    await prisma.salesContact.updateMany({
      where: { id, organizationId },
      data,
    });
  },

  async delete(organizationId: string, id: string): Promise<boolean> {
    const result = await prisma.salesContact.deleteMany({
      where: { id, organizationId },
    });
    return result.count > 0;
  },

  async count(organizationId: string): Promise<number> {
    return prisma.salesContact.count({
      where: { organizationId },
    });
  },
};
