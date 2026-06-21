import "server-only";

import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { Product } from "@/lib/platform/audit-logger";
import { appendToAuditChain } from "@/lib/platform/audit/audit-store";
import type { Prisma } from "@prisma/client";
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

/** L5 WorkflowAuditEvent write with PlatformAuditLog dual-write + hash chain. */
export async function recordWorkflowAuditEvent(
  input: RecordWorkflowAuditEventInput,
) {
  const result = await prisma.workflowAuditEvent.create({
    data: {
      organizationId: input.organizationId,
      platformOrganizationId: input.platformOrganizationId ?? null,
      recordId: input.recordId,
      actorId: input.actorId,
      actorName: input.actorName ?? null,
      action: input.action,
      fromStatus: input.fromStatus ?? null,
      toStatus: input.toStatus ?? null,
      comment: input.comment ?? null,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });

  const platformResult = await writePlatformAuditLog({
    productKey: Product.WORKFLOWOS,
    action: `workflowos.${input.action}`,
    platformOrganizationId: input.platformOrganizationId ?? input.organizationId,
    actorId: input.actorId,
    targetType: "WorkflowRecord",
    targetId: input.recordId,
    sourceModel: "WorkflowAuditEvent",
    sourceId: result.id,
    metadata: {
      ...(input.metadata ?? {}),
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

  return result;
}

export async function createWorkflowAuditEvent(
  input: CreateWorkflowAuditEventInput,
) {
  const result = await prisma.sunbulAuditEvent.create({
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

  // ── Dual-write to PlatformAuditLog + hash chain ──
  const platformResult = await writePlatformAuditLog({
    productKey: Product.WORKFLOWOS,
    action: `workflowos.${input.action}`,
    clientWorkspaceId: input.clientId,
    actorId: input.actorId,
    targetType: input.entityType,
    targetId: input.entityId,
    sourceModel: "SunbulAuditEvent",
    sourceId: result.id,
    metadata: (input.metadata ?? undefined) as
      | Record<string, unknown>
      | undefined,
  });

  // ── Append to hash chain (best-effort, never throws) ──
  if (platformResult.ok && platformResult.id) {
    await appendToAuditChain(
      platformResult.id,
      `workflowos.${input.action}`,
      input.actorId,
    );
  }

  return result;
}

export async function listWorkflowAuditEvents(options: {
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
