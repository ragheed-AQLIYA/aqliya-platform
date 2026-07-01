/**
 * Phase 8.1 — Knowledge Review Event Foundation.
 *
 * Extensibility hooks for knowledge review events.
 * No email, queue, or push notification implementation — only
 * typed event definitions and a lightweight pub/sub mechanism.
 *
 * Integration pattern:
 *   import { emitReviewEvent, onReviewEvent } from "@/lib/knowledge-review/events";
 *
 *   // Register handler (e.g. in app bootstrap or module init)
 *   const unsub = onReviewEvent("knowledge.candidate.promoted", async (event) => {
 *     await myAuditLogger.log(event);
 *   });
 *
 *   // Emit (currently called from review-workflow and promotion-service)
 *   await emitReviewEvent({ type: "knowledge.candidate.approved", ... });
 */

/* ── Event types ─────────────────────────────── */

export type KnowledgeReviewEventType =
  | "knowledge.candidate.created"
  | "knowledge.candidate.submitted"
  | "knowledge.candidate.approved"
  | "knowledge.candidate.rejected"
  | "knowledge.candidate.promoted";

export type KnowledgeReviewEvent = {
  /** Event type discriminator. */
  type: KnowledgeReviewEventType;
  /** The candidate ID that this event relates to. */
  candidateId: string;
  /** The user ID who performed the action. */
  actorId: string;
  /** Timestamp in ISO 8601. */
  timestamp: string;
  /** Optional notes attached to the action. */
  notes?: string;
  /** Optional previous status for state transitions. */
  previousStatus?: string;
  /** Optional new status after the action. */
  newStatus?: string;
  /** Optional artifact path for promotions. */
  artifactPath?: string;
  /** Additional payload for extensibility. */
  payload?: Record<string, unknown>;
};

/* ── Handler registry ────────────────────────── */

type EventHandler = (event: KnowledgeReviewEvent) => void | Promise<void>;

const handlers = new Map<KnowledgeReviewEventType, Set<EventHandler>>();
const wildcardHandlers = new Set<(event: KnowledgeReviewEvent) => void | Promise<void>>();

/**
 * Register a handler for a specific event type.
 * Returns an unsubscribe function.
 */
export function onReviewEvent(
  type: KnowledgeReviewEventType,
  handler: EventHandler,
): () => void {
  if (!handlers.has(type)) {
    handlers.set(type, new Set());
  }
  handlers.get(type)!.add(handler);
  return () => {
    handlers.get(type)?.delete(handler);
  };
}

/**
 * Register a handler that fires on every review event.
 * Returns an unsubscribe function.
 */
export function onAnyReviewEvent(
  handler: (event: KnowledgeReviewEvent) => void | Promise<void>,
): () => void {
  wildcardHandlers.add(handler);
  return () => {
    wildcardHandlers.delete(handler);
  };
}

/**
 * Emit a review event to all registered handlers.
 *
 * - All handlers run in parallel (Promise.allSettled).
 * - A failing handler never blocks other handlers.
 * - Errors are silently caught (logged via console.warn).
 */
export async function emitReviewEvent(
  event: KnowledgeReviewEvent,
): Promise<void> {
  const typeHandlers = handlers.get(event.type);
  const allHandlers: Array<EventHandler | ((e: KnowledgeReviewEvent) => void | Promise<void>)> = [];

  if (typeHandlers) {
    allHandlers.push(...typeHandlers);
  }
  allHandlers.push(...wildcardHandlers);

  if (allHandlers.length === 0) {
    // No-op — nothing registered yet, which is expected.
    return;
  }

  const results = await Promise.allSettled(
    allHandlers.map((h) => h(event)),
  );

  for (const result of results) {
    if (result.status === "rejected") {
      console.warn(
        `[knowledge-review/events] Handler failed for event ${event.type}:`,
        result.reason,
      );
    }
  }
}

/**
 * Remove all registered handlers for a given event type.
 * Useful in testing or teardown.
 */
export function clearHandlers(type?: KnowledgeReviewEventType): void {
  if (type) {
    handlers.delete(type);
  } else {
    handlers.clear();
    wildcardHandlers.clear();
  }
}
