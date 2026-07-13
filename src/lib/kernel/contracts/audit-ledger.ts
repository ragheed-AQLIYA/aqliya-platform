import type { KernelResult, PaginatedResult } from "../types";

export interface AuditEntry {
  id: string;
  organizationId: string;
  productId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface IAuditLedger {
  log(input: {
    organizationId: string;
    productId: string;
    eventType: string;
    entityType: string;
    entityId: string;
    actorId: string;
    actorEmail?: string;
    action: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<KernelResult<AuditEntry>>;
  query(params: {
    organizationId: string;
    productId?: string;
    entityType?: string;
    entityId?: string;
    actorId?: string;
    action?: string;
    from?: Date;
    to?: Date;
    skip?: number;
    take?: number;
  }): Promise<KernelResult<PaginatedResult<AuditEntry>>>;
  verify(entryId: string): Promise<KernelResult<{ valid: boolean; reason?: string }>>;
  export(params: {
    organizationId: string;
    from?: Date;
    to?: Date;
    format: "json" | "csv";
  }): Promise<KernelResult<{ data: string; filename: string }>>;
}
