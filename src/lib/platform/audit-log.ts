// ─── PlatformAuditLog Write Helper ───
// Central write path for unified audit trail events.
// Safe by default: catches errors, logs warnings, never throws.
// Strict mode available for callers that want throws on failure.

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { stampPlatformAuditEvent } from "@/lib/core/contracts/event-envelope";
import {
  buildOutboxPayloadFromAuditLog,
  insertOutboxEvent,
  isOutboxEnabled,
  PLATFORM_AUDIT_OUTBOX_EVENT,
} from "@/lib/core/events/outbox-service";

// ─── Types ───

export interface PlatformAuditLogInput {
  productKey: string;
  action: string;

  platformOrganizationId?: string;
  clientWorkspaceId?: string;
  projectId?: string;
  environment?: string;

  actorId?: string;
  actorType?: string;
  actorEmail?: string;
  actorName?: string;

  targetType?: string;
  targetId?: string;
  targetLabel?: string;

  severity?: string;
  status?: string;

  sourceSystem?: string;
  sourceModel?: string;
  sourceId?: string;
  requestId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;

  aiProvider?: string;
  aiModel?: string;
  aiPromptVersion?: string;
  aiOutputReviewStatus?: string;

  evidenceRefs?: Record<string, unknown>[];
  metadata?: Record<string, unknown>;
}

export interface PlatformAuditLogWriteOptions {
  /**
   * If true, throws on write failure instead of returning error.
   * Default: false (safe mode)
   */
  strict?: boolean;
}

export interface PlatformAuditLogWriteResult {
  ok: boolean;
  id?: string;
  error?: string;
}

// ─── Normalizers ───

const VALID_SEVERITIES = ["info", "warning", "error", "critical"];
const VALID_STATUSES = ["recorded", "success", "failure", "pending"];

export function normalizePlatformAuditSeverity(value: string): string {
  const lower = value.toLowerCase().trim();
  return VALID_SEVERITIES.includes(lower) ? lower : "info";
}

export function normalizePlatformAuditStatus(value: string): string {
  const lower = value.toLowerCase().trim();
  return VALID_STATUSES.includes(lower) ? lower : "recorded";
}

// ─── Write Helper ───

/**
 * Write a PlatformAuditLog entry.
 * Safe mode by default — catches errors and returns { ok: false, error }.
 * Set strict: true to throw on failure.
 */
export async function writePlatformAuditLog(
  input: PlatformAuditLogInput,
  options?: PlatformAuditLogWriteOptions,
): Promise<PlatformAuditLogWriteResult> {
  try {
    // Validate required fields
    if (!input.productKey) {
      throw new Error("productKey is required");
    }
    if (!input.action) {
      throw new Error("action is required");
    }

    const stamped = isOutboxEnabled() ? stampPlatformAuditEvent(input) : input;

    const data = {
      productKey: stamped.productKey,
      action: stamped.action,

      platformOrganizationId: stamped.platformOrganizationId ?? null,
      clientWorkspaceId: stamped.clientWorkspaceId ?? null,
      projectId: stamped.projectId ?? null,
      environment: stamped.environment ?? process.env.NODE_ENV ?? null,

      actorId: stamped.actorId ?? null,
      actorType: stamped.actorType ?? null,
      actorEmail: stamped.actorEmail ?? null,
      actorName: stamped.actorName ?? null,

      targetType: stamped.targetType ?? null,
      targetId: stamped.targetId ?? null,
      targetLabel: stamped.targetLabel ?? null,

      severity: normalizePlatformAuditSeverity(stamped.severity ?? "info"),
      status: normalizePlatformAuditStatus(stamped.status ?? "recorded"),

      sourceSystem: stamped.sourceSystem ?? null,
      sourceModel: stamped.sourceModel ?? null,
      sourceId: stamped.sourceId ?? null,
      requestId: stamped.requestId ?? null,
      sessionId: stamped.sessionId ?? null,
      ipAddress: stamped.ipAddress ?? null,
      userAgent: stamped.userAgent ?? null,

      aiProvider: stamped.aiProvider ?? null,
      aiModel: stamped.aiModel ?? null,
      aiPromptVersion: stamped.aiPromptVersion ?? null,
      aiOutputReviewStatus: stamped.aiOutputReviewStatus ?? null,

      evidenceRefs: (stamped.evidenceRefs ?? undefined) as unknown as
        | Prisma.InputJsonValue
        | undefined,
      metadata: (stamped.metadata ?? undefined) as unknown as
        | Prisma.InputJsonValue
        | undefined,
    };

    if (isOutboxEnabled()) {
      const log = await prisma.$transaction(async (tx) => {
        const created = await tx.platformAuditLog.create({ data });
        const payload = buildOutboxPayloadFromAuditLog({
          platformAuditLogId: created.id,
          organizationId: created.platformOrganizationId,
          metadata: created.metadata,
        });
        if (payload) {
          await insertOutboxEvent(tx, {
            organizationId: created.platformOrganizationId,
            eventType: payload.eventType,
            payload,
            platformAuditLogId: created.id,
          });
        }
        return created;
      });
      return { ok: true, id: log.id };
    }

    const log = await prisma.platformAuditLog.create({ data });

    return { ok: true, id: log.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (options?.strict) {
      throw err;
    }
    console.warn(`[PlatformAuditLog] Write failed: ${message}`);
    return { ok: false, error: message };
  }
}

/**
 * Strict version of writePlatformAuditLog.
 * Throws on failure — use when the caller wants to handle errors explicitly.
 */
export async function writePlatformAuditLogStrict(
  input: PlatformAuditLogInput,
): Promise<PlatformAuditLogWriteResult> {
  return writePlatformAuditLog(input, { strict: true });
}

// ─── Context Helpers ───

/**
 * Create a PlatformAuditLogInput from a basic context + event payload.
 * Useful as a starting point before adding specific fields.
 */
export function createPlatformAuditLogInputFromContext(
  context: {
    platformOrganizationId?: string;
    clientWorkspaceId?: string;
    projectId?: string;
    actorId?: string;
    actorType?: string;
    actorEmail?: string;
    actorName?: string;
  },
  event: {
    productKey: string;
    action: string;
    targetType?: string;
    targetId?: string;
    severity?: string;
    status?: string;
    description?: string;
  },
): PlatformAuditLogInput {
  return {
    ...context,
    ...event,
    metadata: event.description
      ? { description: event.description }
      : undefined,
  };
}
