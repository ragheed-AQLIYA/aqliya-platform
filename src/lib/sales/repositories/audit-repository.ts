import "server-only";
import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import type { SalesAuditEntry } from "../store";
import {
  prismaAuditToDomain,
} from "./entity-mappers";

export const auditRepository = {
  // ═══════════════════════════════════════════════════════
  // Migrated from salesAuditEvent to platformAuditLog
  // productKey: "salesos" filters to the correct product scope
  // Old queries kept as comments for reference
  // ═══════════════════════════════════════════════════════
  async findByOrganization(
    organizationId: string,
  ): Promise<SalesAuditEntry[]> {
    // OLD: const rows = await prisma.salesAuditEvent.findMany({
    // OLD:   where: { organizationId },
    // OLD:   orderBy: { createdAt: "desc" },
    // OLD:   take: 10000,
    // OLD: });
    const rows = await prisma.platformAuditLog.findMany({
      where: { productKey: "salesos", organizationId },
      orderBy: { createdAt: "desc" },
      take: 10000,
    });
    return rows.map(prismaAuditToDomain);
  },

  async findByTarget(
    organizationId: string,
    targetType: string,
    targetId: string,
  ): Promise<SalesAuditEntry[]> {
    // OLD: const rows = await prisma.salesAuditEvent.findMany({
    // OLD:   where: { organizationId, targetType, targetId },
    // OLD:   orderBy: { createdAt: "desc" },
    // OLD:   take: 10000,
    // OLD: });
    const rows = await prisma.platformAuditLog.findMany({
      where: { productKey: "salesos", organizationId, targetType, targetId },
      orderBy: { createdAt: "desc" },
      take: 10000,
    });
    return rows.map(prismaAuditToDomain);
  },

  async create(entry: SalesAuditEntry, actorName?: string): Promise<void> {
    await writePlatformAuditLog({
      productKey: "salesos",
      action: entry.action,
      organizationId: entry.organizationId,
      actorId: entry.actorId,
      actorName: actorName,
      targetType: entry.targetType,
      targetId: entry.targetId,
      metadata: entry.metadata,
    });
  },
};
