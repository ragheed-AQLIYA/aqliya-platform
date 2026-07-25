// ─── AuditOS Audit Event Writer ───
// Single-write to PlatformAuditLog with hash chain protection.
// All sub-file callers should use this instead of writing directly.

import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { Product } from "@/lib/platform/audit-logger";
import { appendToAuditChain } from "@/lib/platform/audit/audit-store";

export interface AuditOsAuditInput {
  engagementId: string;
  eventType: string;
  actorId: string;
  actorName: string;
  actorRole?: string;
  targetType: string;
  targetId: string;
  previousState?: string;
  newState?: string;
  description: string;
  aiRelated?: boolean;
  metadata?: Record<string, unknown>;

  platformOrganizationId?: string;
  projectId?: string;
  clientWorkspaceId?: string;
}

export async function recordAuditOsAuditEvent(
  input: AuditOsAuditInput,
): Promise<{
  id: string;
  engagementId: string;
  eventType: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetType: string;
  targetId: string;
  previousState: string | null;
  newState: string;
  description: string;
  aiRelated: boolean;
  metadata: unknown;
  timestamp: Date;
}> {
  const platformResult = await writePlatformAuditLog({
    productKey: Product.AUDIT_OS,
    action: input.eventType,
    platformOrganizationId: input.platformOrganizationId ?? undefined,
    projectId: input.projectId ?? undefined,
    clientWorkspaceId: input.clientWorkspaceId ?? undefined,
    actorId: input.actorId,
    actorName: input.actorName,
    targetType: input.targetType,
    targetId: input.targetId,
    sourceId: input.engagementId,
    beforeState: input.previousState,
    afterState: input.newState,
    eventDescription: input.description,
    aiRelated: input.aiRelated ?? false,
    metadata: {
      ...(input.metadata ?? {}),
      engagementId: input.engagementId,
    },
  });

  if (platformResult.ok && platformResult.id) {
    await appendToAuditChain(
      platformResult.id,
      input.eventType,
      input.actorId,
    );
  }

  const pal = await prisma.platformAuditLog.findUnique({
    where: { id: platformResult.id! },
  });
  if (!pal) {
    throw new Error("PlatformAuditLog not found after write");
  }

  return {
    id: pal.id,
    engagementId: input.engagementId,
    eventType: pal.action,
    actorId: pal.actorId ?? "",
    actorName: pal.actorName ?? "",
    actorRole: input.actorRole ?? "",
    targetType: pal.targetType ?? "",
    targetId: pal.targetId ?? "",
    previousState: pal.beforeState,
    newState: pal.afterState ?? "",
    description: pal.eventDescription ?? "",
    aiRelated: pal.aiRelated,
    metadata: pal.metadata,
    timestamp: pal.createdAt,
  };
}
