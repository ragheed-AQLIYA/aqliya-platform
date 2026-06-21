import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  parseEventEnvelopeFromMetadata,
  type CoreEventEnvelope,
} from "@/lib/core/contracts/event-envelope";
import {
  resolveEventTypeForEnvelope,
  validateCoreEventEnvelope,
} from "@/lib/core/events/schema-registry";
import { isEnabled } from "@/lib/platform/feature-flags/registry";

export const PLATFORM_AUDIT_OUTBOX_EVENT = "platform.audit.recorded";

export type OutboxEventStatus = "pending" | "processing" | "processed" | "failed";

export interface OutboxDispatchPayload {
  outboxId: string;
  eventType: string;
  organizationId?: string | null;
  platformAuditLogId?: string | null;
  envelope: CoreEventEnvelope;
}

export type OutboxHandler = (payload: OutboxDispatchPayload) => Promise<void>;

type OutboxTx = Pick<typeof prisma, "platformOutboxEvent">;

const handlers = new Map<string, OutboxHandler[]>();

/** Platform audit handlers apply to all platform.* event types unless specialized. */
function getHandlersForEventType(eventType: string): OutboxHandler[] {
  const direct = handlers.get(eventType) ?? [];
  if (direct.length > 0) return direct;
  if (
    eventType.startsWith("platform.") &&
    eventType !== PLATFORM_AUDIT_OUTBOX_EVENT
  ) {
    return handlers.get(PLATFORM_AUDIT_OUTBOX_EVENT) ?? [];
  }
  return [];
}

export function isOutboxEnabled(): boolean {
  return isEnabled("platform.event-outbox");
}

export function registerOutboxHandler(
  eventType: string,
  handler: OutboxHandler,
): void {
  const list = handlers.get(eventType) ?? [];
  list.push(handler);
  handlers.set(eventType, list);
}

export function clearOutboxHandlers(eventType?: string): void {
  if (eventType) {
    handlers.delete(eventType);
    return;
  }
  handlers.clear();
}

export function buildOutboxPayloadFromAuditLog(params: {
  platformAuditLogId: string;
  organizationId?: string | null;
  metadata?: unknown;
}): OutboxDispatchPayload | null {
  const envelope = parseEventEnvelopeFromMetadata(params.metadata);
  if (!envelope) return null;

  const eventType = resolveEventTypeForEnvelope(envelope);
  if (isEnabled("platform.event-schema-registry")) {
    const validation = validateCoreEventEnvelope(envelope, eventType);
    if (!validation.valid) {
      console.warn(
        `[Outbox] Invalid event envelope for ${eventType}: ${validation.errors.join("; ")}`,
      );
      return null;
    }
  }

  return {
    outboxId: "",
    eventType,
    organizationId: params.organizationId,
    platformAuditLogId: params.platformAuditLogId,
    envelope,
  };
}

export async function insertOutboxEvent(
  tx: OutboxTx,
  params: {
    organizationId?: string | null;
    eventType: string;
    payload: OutboxDispatchPayload;
    platformAuditLogId?: string | null;
  },
): Promise<void> {
  await tx.platformOutboxEvent.create({
    data: {
      organizationId: params.organizationId ?? null,
      eventType: params.eventType,
      payload: params.payload as unknown as Prisma.InputJsonValue,
      status: "pending",
      platformAuditLogId: params.platformAuditLogId ?? null,
    },
  });
}

async function dispatchOutboxRow(row: {
  id: string;
  organizationId: string | null;
  eventType: string;
  payload: unknown;
  platformAuditLogId: string | null;
}): Promise<void> {
  const list = getHandlersForEventType(row.eventType);
  if (list.length === 0) return;

  const payload = row.payload as OutboxDispatchPayload;
  const dispatchPayload: OutboxDispatchPayload = {
    ...payload,
    outboxId: row.id,
    organizationId: row.organizationId,
    platformAuditLogId: row.platformAuditLogId,
  };

  for (const handler of list) {
    if (isEnabled("platform.event-schema-registry")) {
      const validation = validateCoreEventEnvelope(
        dispatchPayload.envelope,
        row.eventType,
      );
      if (!validation.valid) {
        throw new Error(
          `Outbox envelope validation failed: ${validation.errors.join("; ")}`,
        );
      }
    }
    await handler(dispatchPayload);
  }
}

export async function processOutboxBatch(
  limit = 25,
): Promise<{ processed: number; failed: number; skipped: number }> {
  if (!isOutboxEnabled()) {
    return { processed: 0, failed: 0, skipped: 0 };
  }

  const pending = await prisma.platformOutboxEvent.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  let processed = 0;
  let failed = 0;

  for (const row of pending) {
    await prisma.platformOutboxEvent.update({
      where: { id: row.id },
      data: { status: "processing", attempts: row.attempts + 1 },
    });

    try {
      await dispatchOutboxRow(row);
      await prisma.platformOutboxEvent.update({
        where: { id: row.id },
        data: {
          status: "processed",
          processedAt: new Date(),
          lastError: null,
        },
      });
      processed += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Outbox dispatch failed";
      await prisma.platformOutboxEvent.update({
        where: { id: row.id },
        data: {
          status: row.attempts + 1 >= 3 ? "failed" : "pending",
          lastError: message,
        },
      });
      failed += 1;
    }
  }

  return { processed, failed, skipped: pending.length === 0 ? 0 : 0 };
}

export async function retryFailedOutboxEvents(options?: {
  ids?: string[];
  limit?: number;
}): Promise<{ retried: number; ids: string[] }> {
  if (!isOutboxEnabled()) {
    return { retried: 0, ids: [] };
  }

  const limit = options?.limit ?? 25;
  const where =
    options?.ids && options.ids.length > 0
      ? { id: { in: options.ids }, status: "failed" as const }
      : { status: "failed" as const };

  const rows = await prisma.platformOutboxEvent.findMany({
    where,
    orderBy: { updatedAt: "asc" },
    take: limit,
    select: { id: true },
  });

  if (rows.length === 0) {
    return { retried: 0, ids: [] };
  }

  const ids = rows.map((row) => row.id);
  await prisma.platformOutboxEvent.updateMany({
    where: { id: { in: ids } },
    data: {
      status: "pending",
      lastError: null,
      attempts: 0,
    },
  });

  return { retried: ids.length, ids };
}

export const OutboxService = {
  isEnabled: isOutboxEnabled,
  registerHandler: registerOutboxHandler,
  processBatch: processOutboxBatch,
  insert: insertOutboxEvent,
  retryFailed: retryFailedOutboxEvents,
};
