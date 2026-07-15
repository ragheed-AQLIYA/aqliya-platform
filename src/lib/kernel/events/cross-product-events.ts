import type { DomainEvent, EventDomain } from "../contracts/event-bus";

export interface CrossProductEventMetadata {
  sourceProduct?: string;
  targetProduct?: string;
  entityId?: string;
  entityType?: string;
  [key: string]: unknown;
}

export const CROSS_PRODUCT_EVENTS = {
  EVIDENCE_UPLOADED: "evidence.uploaded",
  EVIDENCE_LINKED: "evidence.linked",
  EVIDENCE_STATUS_CHANGED: "evidence.status_changed",
  KNOWLEDGE_PATTERN_RECORDED: "knowledge.pattern_recorded",
  AI_OUTPUT_GENERATED: "ai.output_generated",
} as const;

export type CrossProductEventAction =
  (typeof CROSS_PRODUCT_EVENTS)[keyof typeof CROSS_PRODUCT_EVENTS];

export function publishCrossProductEvent(
  domain: EventDomain,
  action: CrossProductEventAction,
  params: {
    productSlug: string;
    actorId?: string;
    organizationId?: string;
    workspaceId?: string;
    resourceId?: string;
    resourceType?: string;
    metadata?: CrossProductEventMetadata;
    correlationId?: string;
    causationId?: string;
  },
): Omit<DomainEvent, "schemaVersion" | "occurredAt"> {
  return {
    productSlug: params.productSlug,
    domain,
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
