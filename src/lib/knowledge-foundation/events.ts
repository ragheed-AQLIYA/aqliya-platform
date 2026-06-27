import "server-only";

export type KnowledgeFoundationEventType =
  | "knowledge.foundation.version.created"
  | "knowledge.foundation.version.approved"
  | "knowledge.foundation.version.released"
  | "knowledge.foundation.version.activated"
  | "knowledge.foundation.version.deprecated"
  | "knowledge.foundation.rollback.executed"
  | "knowledge.foundation.diff.generated"
  | "knowledge.foundation.candidate.bound"
  | "knowledge.foundation.candidate.unbound"
  | "knowledge.foundation.readiness.generated"
  | "knowledge.foundation.report.generated"
  | "knowledge.foundation.integrity.verified"
  | "knowledge.foundation.integrity.failed";

export type KnowledgeFoundationEvent = {
  type: KnowledgeFoundationEventType;
  versionId: string;
  actorId: string;
  timestamp: string;
  notes?: string;
  previousStatus?: string;
  newStatus?: string;
  versionNumber?: string;
  diffId?: string;
  rollbackVersionId?: string;
  payload?: Record<string, unknown>;
};

type EventHandler = (event: KnowledgeFoundationEvent) => Promise<void>;

const handlers = new Map<string, Set<EventHandler>>();
const anyHandlers = new Set<EventHandler>();

export function onFoundationEvent(
  type: KnowledgeFoundationEventType,
  handler: EventHandler,
): () => void {
  if (!handlers.has(type)) handlers.set(type, new Set());
  handlers.get(type)!.add(handler);
  return () => handlers.get(type)?.delete(handler);
}

export function onAnyFoundationEvent(handler: EventHandler): () => void {
  anyHandlers.add(handler);
  return () => anyHandlers.delete(handler);
}

export async function emitFoundationEvent(
  event: KnowledgeFoundationEvent,
): Promise<void> {
  const results = await Promise.allSettled([
    ...Array.from(handlers.get(event.type) ?? []).map((h) => h(event)),
    ...Array.from(anyHandlers).map((h) => h(event)),
  ]);
  for (const r of results) {
    if (r.status === "rejected") {
      console.warn(
        `[KF Event] Handler failed for ${event.type}: ${r.reason}`,
      );
    }
  }
}

/** Testing/teardown helper */
export function clearFoundationHandlers(type?: KnowledgeFoundationEventType): void {
  if (type) {
    handlers.delete(type);
  } else {
    handlers.clear();
    anyHandlers.clear();
  }
}
