import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// ─── Types ───

export interface AuditEventInput {
  product: string;
  action: string;
  actorId: string;
  organizationId?: string;
  platformOrganizationId?: string;
  workspaceId?: string;
  actorName?: string;
  actorRole?: string;
  targetType?: string;
  targetId?: string;
  severity?: string;
  status?: string;
  ipAddress?: string;
  userAgent?: string;
  aiProvider?: string;
  aiModel?: string;
  aiPromptVersion?: string;
  aiOutputReviewStatus?: string;
  evidenceRefs?: Record<string, unknown>[];
  metadata?: Record<string, unknown>;
}

export interface AuditEventWriteResult {
  ok: boolean;
  id?: string;
  error?: string;
}

// ─── Write to unified AuditEvent model ───

export async function writeAuditEvent(
  params: AuditEventInput,
): Promise<AuditEventWriteResult> {
  try {
    if (!params.product) throw new Error("product is required");
    if (!params.action) throw new Error("action is required");
    if (!params.actorId) throw new Error("actorId is required");

    const record = await prisma.platformAuditLog.create({
      data: {
        platformOrganizationId: params.platformOrganizationId ?? null,
        clientWorkspaceId: params.workspaceId ?? null,
        productKey: params.product,
        actorId: params.actorId,
        actorName: params.actorName ?? null,
        action: params.action,
        targetType: params.targetType ?? null,
        targetId: params.targetId ?? null,
        severity: params.severity ?? "info",
        status: params.status ?? "recorded",
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        aiProvider: params.aiProvider ?? null,
        aiModel: params.aiModel ?? null,
        aiPromptVersion: params.aiPromptVersion ?? null,
        aiOutputReviewStatus: params.aiOutputReviewStatus ?? null,
        evidenceRefs: (params.evidenceRefs ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
        metadata: (params.metadata ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
      },
    });

    return { ok: true, id: record.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.warn(`[AuditEventService] Write failed: ${message}`);
    return { ok: false, error: message };
  }
}

// ─── Dual-write: new AuditEvent + product-specific write ───

export async function dualWriteAuditEvent(
  newEventParams: AuditEventInput,
  productWriteFn: () => Promise<unknown>,
): Promise<AuditEventWriteResult> {
  const newResult = await writeAuditEvent(newEventParams);

  try {
    await productWriteFn();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.warn(
      `[AuditEventService] Dual-write product fn failed: ${message}`,
    );
    // new model write succeeded but product-specific failed
    if (!newResult.ok) {
      return { ok: false, error: `Both writes failed. New: ${newResult.error}. Product: ${message}` };
    }
    return { ok: true, id: newResult.id, error: `Product write failed: ${message}` };
  }

  return newResult;
}
