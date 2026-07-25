import "server-only";

export type PlatformAuditCategory =
  | "financial"
  | "compliance"
  | "operational"
  | "security"
  | "workflow_transition"
  | "data_change"
  | "ai_action"
  | "user_action"
  | "ai_execution"
  | "evidence"
  | "output"
  | "review"
  | "approval";

export const SALES_CORE_AUDIT_PREFIXES = [
  "sales.account.",
  "sales.opportunity.",
  "sales.intelligence.",
  "sales.proof.",
  "sales.output.",
  "sales.recommendation.",
  "sales.review.",
  "sales.approval.",
] as const;

export type SalesAuditActor = {
  id: string;
  role?: string;
  organizationId: string;
  platformOrganizationId?: string;
};

export type SalesLocalAuditCacheEntry = {
  organizationId: string;
  action: string;
  actorId: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
};
