/** Immutable audit trail — same pattern as SalesOS */
export interface AuditEntry { id: string; action: string; actorId: string; targetType: string; targetId: string; organizationId: string; timestamp: string; sequenceId: string; }

export class EngagementAudit {
  private entries: AuditEntry[] = [];
  private seq = 0;
  record(e: Omit<AuditEntry, "id" | "timestamp" | "sequenceId">): AuditEntry {
    const entry = { ...e, id: `audit-${++this.seq}`, timestamp: new Date().toISOString(), sequenceId: `seq-${this.seq}` };
    this.entries.push({ ...entry });
    return entry;
  }
  list(orgId: string): AuditEntry[] { return this.entries.filter(e => e.organizationId === orgId).reverse(); }
}
