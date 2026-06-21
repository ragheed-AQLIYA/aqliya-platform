// ─── AuditOS Audit Event Writer ───
// Shared helper for AuditEvent.create() with dual-write to PlatformAuditLog
// and hash chain protection. All sub-file callers should use this instead
// of calling prisma.auditEvent.create() directly.
//
// Safe mode: primary write throws on failure, dual-write + hash chain
// are best-effort and never throw.

import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { Product } from "@/lib/platform/audit-logger";
import { appendToAuditChain } from "@/lib/platform/audit/audit-store";
import type { Prisma } from "@prisma/client";

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

  // Optional platform context for dual-write enrichment
  platformOrganizationId?: string;
  projectId?: string;
  clientWorkspaceId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function recordAuditOsAuditEvent(
  input: AuditOsAuditInput,
): Promise<any> {
  // ── Primary write ──
  const event = await prisma.auditEvent.create({
    data: {
      engagementId: input.engagementId,
      eventType: input.eventType,
      actorId: input.actorId,
      actorName: input.actorName,
      actorRole: input.actorRole ?? "",
      targetType: input.targetType,
      targetId: input.targetId,
      previousState: input.previousState ?? "",
      newState: input.newState ?? "",
      description: input.description,
      aiRelated: input.aiRelated ?? false,
      metadata: (input.metadata ?? undefined) as
        | Prisma.InputJsonValue
        | undefined,
    },
  });

  // ── Dual-write to PlatformAuditLog + hash chain (best-effort) ──
  try {
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
      sourceModel: "AuditEvent",
      sourceId: event.id,
      metadata: {
        ...(input.metadata ?? {}),
        engagementId: input.engagementId,
      },
    });

    // Hash chain (best-effort, never throws)
    if (platformResult.ok && platformResult.id) {
      await appendToAuditChain(
        platformResult.id,
        input.eventType,
        input.actorId,
      );
    }
  } catch {
    // Dual-write / hash chain failure must never affect the primary action
  }

  return event;
}
