import type { DomainEvent, EventDomain } from "../contracts/event-bus";

export interface LocalContentOSEventMetadata {
  projectId?: string;
  projectName?: string;
  supplierId?: string;
  spendId?: string;
  classificationId?: string;
  findingId?: string;
  reportId?: string;
  previousStatus?: string;
  newStatus?: string;
  score?: number;
  [key: string]: unknown;
}

export type LocalContentOSEventDomain = Extract<EventDomain, "lc">;

export const LOCAL_CONTENT_OS_EVENTS = {
  PROJECT_CREATED: "project.created",
  PROJECT_STATUS_CHANGED: "project.status_changed",
  CLASSIFICATION_COMPLETED: "classification.completed",
  SPEND_IMPORTED: "spend.imported",
  REPORT_GENERATED: "report.generated",
  FINDING_CREATED: "finding.created",
} as const;

export type LocalContentOSEventAction =
  (typeof LOCAL_CONTENT_OS_EVENTS)[keyof typeof LOCAL_CONTENT_OS_EVENTS];

export function publishLocalContentOSEvent(
  action: LocalContentOSEventAction,
  params: {
    actorId?: string;
    organizationId?: string;
    workspaceId?: string;
    resourceId?: string;
    resourceType?: string;
    metadata?: LocalContentOSEventMetadata;
    correlationId?: string;
    causationId?: string;
  },
): Omit<DomainEvent, "schemaVersion" | "occurredAt"> {
  return {
    productSlug: "local-content-os",
    domain: "lc",
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
