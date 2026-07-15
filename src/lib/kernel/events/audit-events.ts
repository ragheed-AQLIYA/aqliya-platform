import type { DomainEvent, EventDomain } from "../contracts/event-bus";

export interface AuditOSEventMetadata {
  engagementId?: string;
  engagementName?: string;
  findingId?: string;
  evidenceId?: string;
  approvalId?: string;
  reviewId?: string;
  previousStatus?: string;
  newStatus?: string;
  [key: string]: unknown;
}

export type AuditOSEventDomain = Extract<EventDomain, "audit">;

export const AUDIT_OS_EVENTS = {
  ENGAGEMENT_CREATED: "engagement.created",
  ENGAGEMENT_STATUS_CHANGED: "engagement.status_changed",
  ENGAGEMENT_PUBLISHED: "engagement.published",
  FINDING_CREATED: "finding.created",
  FINDING_STATUS_CHANGED: "finding.status_changed",
  EVIDENCE_UPLOADED: "evidence.uploaded",
  EVIDENCE_LINKED: "evidence.linked",
  REVIEW_COMPLETED: "review.completed",
} as const;

export type AuditOSEventAction =
  (typeof AUDIT_OS_EVENTS)[keyof typeof AUDIT_OS_EVENTS];

export function publishAuditOSEvent(
  action: AuditOSEventAction,
  params: {
    actorId?: string;
    organizationId?: string;
    workspaceId?: string;
    resourceId?: string;
    resourceType?: string;
    metadata?: AuditOSEventMetadata;
    correlationId?: string;
    causationId?: string;
  },
): Omit<DomainEvent, "schemaVersion" | "occurredAt"> {
  return {
    productSlug: "audit-os",
    domain: "audit",
    action,
    actorId: params.actorId,
    organizationId: params.organizationId,
    workspaceId: params.workspaceId,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    correlationId: params.correlationId ?? "",
    causationId: params.causationId,
    metadata: params.metadata as Record<string, unknown> | undefined,
  };
}
