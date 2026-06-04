import "server-only";

export type NotificationChannel = "in_app" | "email" | "webhook";

export type NotificationSeverity = "info" | "warning" | "error" | "critical";

export type NotificationEvent =
  | "on_create"
  | "on_review"
  | "on_approval"
  | "on_rejection"
  | "on_sync_complete"
  | "on_error";

export interface NotificationTemplate {
  arSubject: string;
  arBody: string;
  enSubject: string;
  enBody: string;
  actionUrl?: string;
}

export interface DeliveryResult {
  channel: NotificationChannel;
  success: boolean;
  error?: string;
  deliveredAt: Date;
}

export interface NotificationPayload {
  type: string;
  subject: string;
  body: string;
  channel: NotificationChannel;
  severity: NotificationSeverity;
  recipientId: string;
  recipientEmail?: string;
  organizationId?: string;
  metadata?: Record<string, unknown>;
}

export interface WebhookConfig {
  url: string;
  secret?: string;
  enabled: boolean;
  retryCount?: number;
}

export interface DispatchTarget {
  recipientId: string;
  recipientEmail?: string;
  organizationId?: string;
}

export interface RateLimitState {
  sentCount: number;
  windowStart: number;
}

export type ProductTemplateKey =
  | "audit_review_assigned"
  | "audit_approval_needed"
  | "audit_finding_updated"
  | "decision_for_review"
  | "decision_approved"
  | "decision_rejected"
  | "localcontent_review_routing"
  | "localcontent_batch_import_complete"
  | "localcontent_erp_sync_error"
  | "sales_deal_stage_change"
  | "sales_crm_sync_error"
  | "workflowos_export_approved"
  | "workflowos_export_rejected"
  | "workflowos_escalation_alert";
