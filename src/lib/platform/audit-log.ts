// ─── PlatformAuditLog Write Helper ───
// Central write path for unified audit trail events.
// Safe by default: catches errors, logs warnings, never throws.
// Strict mode available for callers that want throws on failure.

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

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

    const data = {
      productKey: input.productKey,
      action: input.action,

      platformOrganizationId: input.platformOrganizationId ?? null,
      clientWorkspaceId: input.clientWorkspaceId ?? null,
      projectId: input.projectId ?? null,
      environment: input.environment ?? process.env.NODE_ENV ?? null,

      actorId: input.actorId ?? null,
      actorType: input.actorType ?? null,
      actorEmail: input.actorEmail ?? null,
      actorName: input.actorName ?? null,

      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      targetLabel: input.targetLabel ?? null,

      severity: normalizePlatformAuditSeverity(input.severity ?? "info"),
      status: normalizePlatformAuditStatus(input.status ?? "recorded"),

      sourceSystem: input.sourceSystem ?? null,
      sourceModel: input.sourceModel ?? null,
      sourceId: input.sourceId ?? null,
      requestId: input.requestId ?? null,
      sessionId: input.sessionId ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,

      aiProvider: input.aiProvider ?? null,
      aiModel: input.aiModel ?? null,
      aiPromptVersion: input.aiPromptVersion ?? null,
      aiOutputReviewStatus: input.aiOutputReviewStatus ?? null,

      evidenceRefs: (input.evidenceRefs ?? undefined) as unknown as
        | Prisma.InputJsonValue
        | undefined,
      metadata: (input.metadata ?? undefined) as unknown as
        | Prisma.InputJsonValue
        | undefined,
    };

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
