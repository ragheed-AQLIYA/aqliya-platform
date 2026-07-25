import "server-only";

import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { Product } from "@/lib/platform/audit-logger";
import { appendToAuditChain } from "@/lib/platform/audit/audit-store";
import type { WorkflowAuditAction } from "@/lib/workflowos/types";
import { requireClientAccess } from "@/lib/workflowos/tenant-guard";

export interface CreateWorkflowAuditEventInput {
  clientId: string;
  recordId?: string;
  actorId: string;
  action: WorkflowAuditAction;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export interface RecordWorkflowAuditEventInput {
  organizationId: string;
  platformOrganizationId?: string;
  recordId: string;
  actorId: string;
  actorName?: string | null;
  action: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  comment?: string | null;
  metadata?: Record<string, unknown>;
}

/** L5 single-write to PlatformAuditLog + hash chain. */
export async function recordWorkflowAuditEvent(
  input: RecordWorkflowAuditEventInput,
) {
  const platformResult = await writePlatformAuditLog({
    productKey: Product.WORKFLOWOS,
    action: `workflowos.${input.action}`,
    platformOrganizationId: input.platformOrganizationId ?? input.organizationId,
    organizationId: input.organizationId,
    actorId: input.actorId,
    targetType: "WorkflowRecord",
    targetId: input.recordId,
    beforeState: input.fromStatus,
    afterState: input.toStatus,
    metadata: {
      ...(input.metadata ?? {}),
      actorName: input.actorName ?? undefined,
      fromStatus: input.fromStatus ?? undefined,
      toStatus: input.toStatus ?? undefined,
      comment: input.comment ?? undefined,
    },
  });

  if (platformResult.ok && platformResult.id) {
    await appendToAuditChain(
      platformResult.id,
      `workflowos.${input.action}`,
      input.actorId,
    );
  }
}

export async function createWorkflowAuditEvent(
  input: CreateWorkflowAuditEventInput,
) {
  const platformResult = await writePlatformAuditLog({
    productKey: Product.WORKFLOWOS,
    action: `workflowos.${input.action}`,
    clientWorkspaceId: input.clientId,
    actorId: input.actorId,
    targetType: input.entityType,
    targetId: input.entityId,
    metadata: (input.metadata ?? undefined) as
      | Record<string, unknown>
      | undefined,
  });

  if (platformResult.ok && platformResult.id) {
    await appendToAuditChain(
      platformResult.id,
      `workflowos.${input.action}`,
      input.actorId,
    );
  }
}

export async function listWorkflowAuditEvents(options: {
  clientId: string;
  recordId?: string;
  limit?: number;
  offset?: number;
}) {
  await requireClientAccess(options.clientId);

  // [MIGRATED v2] SunbulAuditEvent → PlatformAuditLog (single-write)
  // const [events, total] = await Promise.all([
  //   prisma.sunbulAuditEvent.findMany({
  //     where,
  //     orderBy: { createdAt: "desc" },
  //     take: options.limit ?? 50,
  //     skip: options.offset ?? 0,
  //   }),
  //   prisma.sunbulAuditEvent.count({ where }),
  // ]);

  const platformWhere: Record<string, unknown> = {
    productKey: "workflowos",
    clientWorkspaceId: options.clientId,
  };
  if (options.recordId) {
    platformWhere.targetId = options.recordId;
  }

  const [platformEvents, total] = await Promise.all([
    prisma.platformAuditLog.findMany({
      where: platformWhere as never,
      orderBy: { createdAt: "desc" },
      take: options.limit ?? 50,
      skip: options.offset ?? 0,
    }),
    prisma.platformAuditLog.count({ where: platformWhere as never }),
  ]);

  const events = platformEvents.map((e) => ({
    id: e.id,
    clientId: e.clientWorkspaceId ?? options.clientId,
    recordId: e.targetId ?? null,
    actorId: e.actorId ?? "",
    action: e.action,
    entityType: e.targetType ?? "",
    entityId: e.targetId ?? "",
    metadata: e.metadata as Record<string, unknown> | null,
    createdAt: e.createdAt,
  }));

  return { events, total };
}
