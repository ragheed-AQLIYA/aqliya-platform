export type AuditEventCategory =
  | "ai_execution"
  | "evidence"
  | "output"
  | "review"
  | "approval"
  | "workflow_transition";

export interface AuditEventContract {
  id: string;
  organizationId?: string;
  productSlug: string;
  action: string;
  actorId: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  category?: AuditEventCategory;
  severity?: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  tenantId?: string;
}
