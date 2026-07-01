/**
 * Audit Trail — SPEC-01b §3, PRD-01 §14b
 *
 * Immutable append-only log of all mutations.
 * Replayable via sequenceId ordering.
 * Every entry carries correlationId for end-to-end tracing.
 */

export interface AuditEntry {
  id: string;
  action: string;
  actorId: string;
  targetType: string;
  targetId: string;
  organizationId: string;
  timestamp: string;
  sequenceId: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

export class AuditTrail {
  private entries: AuditEntry[] = [];
  private seq = 0;

  record(entry: Omit<AuditEntry, "id" | "timestamp" | "sequenceId">): AuditEntry {
    const full: AuditEntry = {
      ...entry,
      id: `audit-${++this.seq}`,
      timestamp: new Date().toISOString(),
      sequenceId: `seq-${this.seq}`,
    };
    this.entries.push({ ...full });
    return full;
  }

  list(organizationId: string, limit = 50): AuditEntry[] {
    return this.entries
      .filter((e) => e.organizationId === organizationId)
      .slice(-limit)
      .reverse();
  }

  listByTarget(targetType: string, targetId: string, organizationId: string): AuditEntry[] {
    return this.entries
      .filter((e) => e.targetType === targetType && e.targetId === targetId && e.organizationId === organizationId)
      .reverse();
  }

  findByCorrelationId(correlationId: string): AuditEntry[] {
    return this.entries.filter((e) => e.correlationId === correlationId);
  }

  /** Replay entries in chronological order by sequenceId */
  replay(fromSequenceId?: string): AuditEntry[] {
    const startIdx = fromSequenceId
      ? this.entries.findIndex((e) => e.sequenceId === fromSequenceId)
      : 0;
    return this.entries.slice(startIdx).sort((a, b) => parseInt(a.sequenceId.slice(4)) - parseInt(b.sequenceId.slice(4)));
  }

  get all(): readonly AuditEntry[] { return this.entries; }
  get count(): number { return this.entries.length; }
  clear(): void { this.entries = []; this.seq = 0; }
}
