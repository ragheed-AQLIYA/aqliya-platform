import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { SunbulAuditAction } from "@/lib/sunbul/types";
import { requireClientAccess } from "@/lib/sunbul/tenant-guard";

export interface CreateSunbulAuditEventInput {
  clientId: string;
  recordId?: string;
  actorId: string;
  action: SunbulAuditAction;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export async function createSunbulAuditEvent(
  input: CreateSunbulAuditEventInput,
) {
  return prisma.sunbulAuditEvent.create({
    data: {
      clientId: input.clientId,
      recordId: input.recordId ?? null,
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function listSunbulAuditEvents(options: {
  clientId: string;
  recordId?: string;
  limit?: number;
  offset?: number;
}) {
  await requireClientAccess(options.clientId);

  const where: { clientId: string; recordId?: string } = {
    clientId: options.clientId,
  };
  if (options.recordId) {
    where.recordId = options.recordId;
  }

  const [events, total] = await Promise.all([
    prisma.sunbulAuditEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options.limit ?? 50,
      skip: options.offset ?? 0,
    }),
    prisma.sunbulAuditEvent.count({ where }),
  ]);

  return { events, total };
}
