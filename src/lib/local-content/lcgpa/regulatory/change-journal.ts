// ─── LCGPA Regulatory Intelligence :: Change Journal & Audit Trail (§34, §49) ───
//
// The journal is APPEND-ONLY. Regulatory change events are never deleted.
// It is the record that answers, years later:
//   what changed, when, on what evidence, who approved it, when it took effect.

import type {
  Clock,
  GovernanceCase,
  ImpactLevel,
  RegulatoryArtifact,
  RegulatoryAuditAction,
  RegulatoryAuditEvent,
  RegulatoryChangeEvent,
  RegulatoryDiff,
  RegulatoryImpactAssessment,
  RegulatorySource,
} from "./types";
import { changeEventId, deterministicId } from "./ids";
import { describeChange } from "./semantic-diff";

// ─── Change journal ───

export interface AppendChangeEventInput {
  source: RegulatorySource;
  artifact: RegulatoryArtifact;
  datasetVersion: string;
  diff: RegulatoryDiff;
  impact: RegulatoryImpactAssessment | null;
  governanceCase: GovernanceCase;
  correlationId: string;
  clock: Clock;
}

export interface ChangeJournal {
  /** Append an event. Returns the stored event. Deletion is not supported. */
  append(input: AppendChangeEventInput): RegulatoryChangeEvent;
  /** Record a lifecycle update on an existing event without losing history. */
  update(
    eventId: string,
    patch: Partial<Pick<RegulatoryChangeEvent, "governanceState" | "activatedAt" | "impactLevel">>,
  ): RegulatoryChangeEvent | undefined;
  get(eventId: string): RegulatoryChangeEvent | undefined;
  /** All events, oldest first. */
  list(): RegulatoryChangeEvent[];
  listBySource(sourceId: string): RegulatoryChangeEvent[];
  /** Events whose effective date is still in the future (§19). */
  scheduled(now: Date): RegulatoryChangeEvent[];
  size(): number;
}

function summarize(diff: RegulatoryDiff, impact: ImpactLevel | null): string {
  if (diff.changes.length === 0) return "No semantic changes.";
  const head = diff.changes
    .slice(0, 3)
    .map((c) => describeChange(c))
    .join(" | ");
  const more = diff.changes.length > 3 ? ` (+${diff.changes.length - 3} more)` : "";
  const impactPart = impact ? ` [impact ${impact}]` : "";
  return `${diff.changes.length} change(s): ${head}${more}${impactPart}`;
}

export function createChangeJournal(
  initial: RegulatoryChangeEvent[] = [],
): ChangeJournal {
  const byId = new Map<string, RegulatoryChangeEvent>();
  const order: string[] = [];
  const sequenceByYear = new Map<number, number>();

  for (const e of initial) {
    if (!byId.has(e.eventId)) {
      byId.set(e.eventId, e);
      order.push(e.eventId);
      const year = e.detectedAt.getUTCFullYear();
      sequenceByYear.set(year, (sequenceByYear.get(year) ?? 0) + 1);
    }
  }

  const all = (): RegulatoryChangeEvent[] =>
    order.map((id) => byId.get(id)).filter((e): e is RegulatoryChangeEvent => !!e);

  return {
    append(input) {
      const detectedAt = input.clock.now();
      const year = detectedAt.getUTCFullYear();
      const nextSeq = (sequenceByYear.get(year) ?? 0) + 1;

      // Idempotency: the same artifact + dataset never produces two events (§32).
      const existing = all().find(
        (e) =>
          e.artifactSha256 === input.artifact.sha256 &&
          e.datasetVersion === input.datasetVersion,
      );
      if (existing) return existing;

      sequenceByYear.set(year, nextSeq);
      const event: RegulatoryChangeEvent = {
        eventId: changeEventId(year, nextSeq),
        detectedAt,
        sourceId: input.source.id,
        sourceName: input.source.name,
        artifactFilename: input.artifact.filename,
        artifactSha256: input.artifact.sha256,
        datasetVersion: input.datasetVersion,
        changeIds: input.diff.changes.map((c) => c.changeId),
        summary: summarize(input.diff, input.impact?.impactLevel ?? null),
        effectiveFrom:
          input.diff.changes.find((c) => c.effectiveFrom !== null)?.effectiveFrom ?? null,
        impactLevel: input.impact?.impactLevel ?? null,
        governanceState: input.governanceCase.state,
        activatedAt: null,
        correlationId: input.correlationId,
      };
      byId.set(event.eventId, event);
      order.push(event.eventId);
      return event;
    },
    update(eventId, patch) {
      const existing = byId.get(eventId);
      if (!existing) return undefined;
      const next: RegulatoryChangeEvent = { ...existing, ...patch };
      byId.set(eventId, next);
      return next;
    },
    get: (eventId) => byId.get(eventId),
    list: all,
    listBySource: (sourceId) => all().filter((e) => e.sourceId === sourceId),
    scheduled: (now) =>
      all()
        .filter((e) => e.effectiveFrom !== null && e.effectiveFrom.getTime() > now.getTime())
        .sort(
          (a, b) => (a.effectiveFrom as Date).getTime() - (b.effectiveFrom as Date).getTime(),
        ),
    size: () => byId.size,
  };
}

/** Render a journal entry in the operator-facing form of §34. */
export function renderChangeEvent(event: RegulatoryChangeEvent): string {
  return [
    event.eventId,
    ``,
    `Detected:   ${event.detectedAt.toISOString()}`,
    `Source:     ${event.sourceName}`,
    `Artifact:   ${event.artifactFilename}`,
    `SHA:        ${event.artifactSha256}`,
    `Dataset:    ${event.datasetVersion}`,
    `Change:     ${event.summary}`,
    `Effective:  ${event.effectiveFrom ? event.effectiveFrom.toISOString().slice(0, 10) : "(not stated)"}`,
    `Impact:     ${event.impactLevel ?? "(not assessed)"}`,
    `Review:     ${event.governanceState}`,
    `Activated:  ${event.activatedAt ? event.activatedAt.toISOString().slice(0, 10) : "(not activated)"}`,
  ].join("\n");
}

// ─── Audit trail (§49) ───

export interface AuditTrailInput {
  action: RegulatoryAuditAction;
  actorId: string;
  actorName?: string | null;
  sourceId?: string | null;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  reason: string;
  correlationId: string;
  clock: Clock;
}

function serialize(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function createAuditEvent(input: AuditTrailInput): RegulatoryAuditEvent {
  if (!input.actorId) {
    throw new Error(
      "AUDIT_ACTOR_REQUIRED: every auditable operation must record who performed it",
    );
  }
  const timestamp = input.clock.now();
  return {
    auditId: deterministicId("AUD", [
      input.action,
      input.entityType,
      input.entityId,
      timestamp.toISOString(),
      input.correlationId,
    ]),
    action: input.action,
    actorId: input.actorId,
    actorName: input.actorName ?? null,
    timestamp,
    sourceId: input.sourceId ?? null,
    entityType: input.entityType,
    entityId: input.entityId,
    before: serialize(input.before),
    after: serialize(input.after),
    reason: input.reason,
    correlationId: input.correlationId,
  };
}

export interface AuditTrail {
  record(input: AuditTrailInput): RegulatoryAuditEvent;
  list(): RegulatoryAuditEvent[];
  byCorrelation(correlationId: string): RegulatoryAuditEvent[];
  byEntity(entityType: string, entityId: string): RegulatoryAuditEvent[];
  size(): number;
}

export function createAuditTrail(
  initial: RegulatoryAuditEvent[] = [],
): AuditTrail {
  const events: RegulatoryAuditEvent[] = [...initial];
  return {
    record(input) {
      const event = createAuditEvent(input);
      events.push(event);
      return event;
    },
    list: () => events.slice(),
    byCorrelation: (correlationId) =>
      events.filter((e) => e.correlationId === correlationId),
    byEntity: (entityType, entityId) =>
      events.filter((e) => e.entityType === entityType && e.entityId === entityId),
    size: () => events.length,
  };
}
