import "server-only";
import { prisma } from "@/lib/prisma";
import type { SalesAuditEntry } from "../store";
import {
  prismaAuditToDomain,
  domainAuditToPrisma,
} from "./entity-mappers";

export const auditRepository = {
  async findByOrganization(
    organizationId: string,
  ): Promise<SalesAuditEntry[]> {
    const rows = await prisma.salesAuditEvent.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(prismaAuditToDomain);
  },

  async findByTarget(
    organizationId: string,
    targetType: string,
    targetId: string,
  ): Promise<SalesAuditEntry[]> {
    const rows = await prisma.salesAuditEvent.findMany({
      where: { organizationId, targetType, targetId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(prismaAuditToDomain);
  },

  async create(entry: SalesAuditEntry, actorName?: string): Promise<void> {
    const data = domainAuditToPrisma(entry, actorName);
    await prisma.salesAuditEvent.create({ data });
  },
};
