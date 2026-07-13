import type { IAuditLedger, AuditEntry } from "../contracts/audit-ledger";
import type { KernelResult, PaginatedResult } from "../types";
import { prisma } from "@/lib/prisma";

export class AuditLedgerWrapper implements IAuditLedger {
  async log(input: {
    organizationId: string;
    productId: string;
    eventType: string;
    entityType: string;
    entityId: string;
    actorId: string;
    actorEmail?: string;
    action: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<KernelResult<AuditEntry>> {
    const entry = await prisma.platformAuditLog.create({
      data: {
        platformOrganizationId: input.organizationId,
        productKey: input.productId,
        action: input.action,
        actorId: input.actorId,
        targetType: input.entityType,
        targetId: input.entityId,
        severity: "INFO",
        status: "success",
        metadata: {
          ...input.metadata,
          eventType: input.eventType,
          actorEmail: input.actorEmail,
          before: input.before,
          after: input.after,
        } as unknown as Record<string, string>,
      },
    });
    return {
      success: true,
      data: {
        id: entry.id,
        organizationId: entry.platformOrganizationId ?? "",
        productId: entry.productKey,
        eventType: (entry.metadata as Record<string, unknown>)?.eventType as string ?? input.eventType,
        entityType: entry.targetType ?? input.entityType,
        entityId: entry.targetId ?? input.entityId,
        actorId: entry.actorId ?? input.actorId,
        action: entry.action,
        metadata: entry.metadata as Record<string, unknown>,
        createdAt: entry.createdAt,
      },
    };
  }

  async query(params: {
    organizationId: string;
    productId?: string;
    entityType?: string;
    entityId?: string;
    actorId?: string;
    action?: string;
    from?: Date;
    to?: Date;
    skip?: number;
    take?: number;
  }): Promise<KernelResult<PaginatedResult<AuditEntry>>> {
    const where: Record<string, unknown> = { platformOrganizationId: params.organizationId };
    if (params.productId) where.productKey = params.productId;
    if (params.entityType) where.targetType = params.entityType;
    if (params.entityId) where.targetId = params.entityId;
    if (params.actorId) where.actorId = params.actorId;
    if (params.action) where.action = params.action;
    if (params.from || params.to) {
      where.createdAt = {
        ...(params.from ? { gte: params.from } : {}),
        ...(params.to ? { lte: params.to } : {}),
      };
    }

    const [items, totalCount] = await Promise.all([
      prisma.platformAuditLog.findMany({
        where,
        skip: params.skip ?? 0,
        take: params.take ?? 50,
        orderBy: { createdAt: "desc" },
      }),
      prisma.platformAuditLog.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: items.map((e) => ({
          id: e.id,
          organizationId: e.platformOrganizationId ?? "",
          productId: e.productKey,
          eventType: (e.metadata as Record<string, unknown>)?.eventType as string ?? "",
          entityType: e.targetType ?? "",
          entityId: e.targetId ?? "",
          actorId: e.actorId ?? "",
          action: e.action,
          metadata: e.metadata as Record<string, unknown>,
          createdAt: e.createdAt,
        })),
        totalCount,
        hasMore: (params.skip ?? 0) + items.length < totalCount,
      },
    };
  }

  async verify(entryId: string): Promise<KernelResult<{ valid: boolean; reason?: string }>> {
    const entry = await prisma.platformAuditLog.findUnique({ where: { id: entryId } });
    if (!entry) {
      return { success: false, error: "Entry not found", code: "NOT_FOUND" };
    }
    return { success: true, data: { valid: true } };
  }

  async export(params: {
    organizationId: string;
    from?: Date;
    to?: Date;
    format: "json" | "csv";
  }): Promise<KernelResult<{ data: string; filename: string }>> {
    const result = await this.query({
      organizationId: params.organizationId,
      from: params.from,
      to: params.to,
      take: 10000,
    });
    if (!result.success) {
      return { success: false, error: result.error };
    }
    const data = JSON.stringify(result.data?.items ?? []);
    return { success: true, data: { data, filename: `audit-export-${Date.now()}.json` } };
  }
}
