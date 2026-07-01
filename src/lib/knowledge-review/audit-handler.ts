/**
 * Phase 8.2 — Knowledge Review Audit Handler.
 *
 * Wires KnowledgeReviewEvent → PlatformAuditLog for durable audit record.
 * Registers an onAnyReviewEvent handler that maps each event type to a
 * structured audit log entry with actor, target, severity, and metadata.
 *
 * Server-only: imports writePlatformAuditLog which uses Prisma.
 */

import "server-only";

import { onAnyReviewEvent } from "@/lib/knowledge-review/events";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import type { KnowledgeReviewEvent } from "@/lib/knowledge-review/events";

/* ── Event-to-audit mapping ────────────────── */

const EVENT_PRODUCT_KEY = "knowledge-mining";

/** Map event type → audit action string. */
function eventTypeToAuditAction(type: KnowledgeReviewEvent["type"]): string {
  switch (type) {
    case "knowledge.candidate.created":
      return "candidate.created";
    case "knowledge.candidate.submitted":
      return "candidate.submitted";
    case "knowledge.candidate.approved":
      return "candidate.approved";
    case "knowledge.candidate.rejected":
      return "candidate.rejected";
    case "knowledge.candidate.promoted":
      return "candidate.promoted";
  }
}

/** Determine severity from event type. */
function eventTypeToSeverity(type: KnowledgeReviewEvent["type"]): string {
  switch (type) {
    case "knowledge.candidate.created":
    case "knowledge.candidate.submitted":
      return "info";
    case "knowledge.candidate.approved":
      return "info";
    case "knowledge.candidate.rejected":
      return "warning";
    case "knowledge.candidate.promoted":
      return "info";
  }
}

/** Compute status from event type. */
function eventTypeToStatus(type: KnowledgeReviewEvent["type"]): string {
  if (type === "knowledge.candidate.rejected") return "failure";
  return "success";
}

/* ── Handler ───────────────────────────────── */

/**
 * Handle a knowledge review event and write to PlatformAuditLog.
 * Safe mode: failures are caught and logged via console.warn.
 */
async function handleKnowledgeAuditEvent(
  event: KnowledgeReviewEvent,
): Promise<void> {
  const action = eventTypeToAuditAction(event.type);
  const severity = eventTypeToSeverity(event.type);
  const status = eventTypeToStatus(event.type);

  const metadata: Record<string, unknown> = {
    previousStatus: event.previousStatus ?? null,
    newStatus: event.newStatus ?? null,
  };

  if (event.notes) {
    metadata.notes = event.notes;
  }
  if (event.artifactPath) {
    metadata.artifactPath = event.artifactPath;
    metadata.eventType = "promotion";
  }

  await writePlatformAuditLog({
    productKey: EVENT_PRODUCT_KEY,
    action,
    severity,
    status,
    actorId: event.actorId,
    targetType: "KnowledgeCandidate",
    targetId: event.candidateId,
    targetLabel: `knowledge.candidate.${event.candidateId}`,
    sourceSystem: "knowledge-mining",
    sourceModel: "KnowledgeCandidate",
    sourceId: event.candidateId,
    metadata,
  });
}

/* ── Registration ──────────────────────────── */

let _registered = false;

/**
 * Register the audit handler.
 *
 * Call once at app startup or on first import of a server module
 * that depends on knowledge review events.
 *
 * Idempotent — safe to call multiple times.
 *
 * Returns an unsubscribe function for clean teardown.
 */
export function registerAuditHandler(): () => void {
  if (_registered) {
    // Already registered — return a no-op unsubscriber
    return () => {};
  }

  _registered = true;
  const unsub = onAnyReviewEvent(handleKnowledgeAuditEvent);

  // Wrap the unsub to also reset the registration flag so the handler
  // can be re-registered after teardown (primarily for testing).
  return () => {
    _registered = false;
    unsub();
  };
}
