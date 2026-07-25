import "server-only";

import { randomUUID } from "crypto";

/** IC-P3-05 — canonical platform event envelope (pre-bus). */
export const CORE_EVENT_SCHEMA_VERSION = "1.0" as const;

export interface PlatformAuditLogInput {
  productKey: string;
  action: string;

  platformOrganizationId?: string;
  clientWorkspaceId?: string;
  projectId?: string;
  environment?: string;

  actorId?: string;
  actorType?: string;
  actorEmail?: string;
  actorName?: string;

  targetType?: string;
  targetId?: string;
  targetLabel?: string;

  severity?: string;
  status?: string;

  sourceSystem?: string;
  sourceModel?: string;
  sourceId?: string;
  requestId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;

  aiProvider?: string;
  aiModel?: string;
  aiPromptVersion?: string;
  aiOutputReviewStatus?: string;

  organizationId?: string | null;
  beforeState?: string | null;
  afterState?: string | null;
  eventDescription?: string | null;
  aiRelated?: boolean;
  aiConfidence?: number | null;
  aiStatus?: string | null;
  inputSummary?: Record<string, unknown> | null;
  outputSummary?: Record<string, unknown> | null;
  durationMs?: number | null;

  evidenceRefs?: Record<string, unknown>[];
  metadata?: Record<string, unknown>;
}

export type CoreEventDomain =
  | "audit"
  | "workflow"
  | "ai"
  | "notification"
  | "platform"
  | "auth";

export interface CoreEventEnvelope {
  schemaVersion: typeof CORE_EVENT_SCHEMA_VERSION;
  correlationId: string;
  causationId?: string;
  productSlug: string;
  domain: CoreEventDomain;
  action: string;
  actorId?: string;
  organizationId?: string;
  workspaceId?: string;
  resourceType?: string;
  resourceId?: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export interface StampAuditEventInput extends PlatformAuditLogInput {
  correlationId?: string;
  causationId?: string;
  domain?: CoreEventDomain;
}

export function inferEventDomain(productKey: string, action: string): CoreEventDomain {
  if (action.startsWith("auth.")) return "auth";
  if (productKey === "audit" || action.includes("audit")) return "audit";
  if (action.includes("workflow") || action.includes("approval")) return "workflow";
  if (action.includes("ai.") || action.includes(".ai.")) return "ai";
  if (action.includes("notification")) return "notification";
  return "platform";
}

export function buildEventEnvelope(input: StampAuditEventInput): CoreEventEnvelope {
  const correlationId = input.correlationId ?? input.requestId ?? randomUUID();
  return {
    schemaVersion: CORE_EVENT_SCHEMA_VERSION,
    correlationId,
    causationId: input.causationId,
    productSlug: input.productKey,
    domain: input.domain ?? inferEventDomain(input.productKey, input.action),
    action: input.action,
    actorId: input.actorId,
    organizationId: input.platformOrganizationId,
    workspaceId: input.clientWorkspaceId,
    resourceType: input.targetType,
    resourceId: input.targetId,
    occurredAt: new Date().toISOString(),
    metadata:
      input.metadata && typeof input.metadata === "object"
        ? (input.metadata as Record<string, unknown>)
        : undefined,
  };
}

export function stampPlatformAuditEvent(
  input: StampAuditEventInput,
): PlatformAuditLogInput {
  const envelope = buildEventEnvelope(input);
  const metadata = {
    ...(input.metadata && typeof input.metadata === "object"
      ? (input.metadata as Record<string, unknown>)
      : {}),
    eventContract: envelope,
  };
  return {
    ...input,
    requestId: envelope.correlationId,
    metadata,
  };
}

export function parseEventEnvelopeFromMetadata(
  metadata: unknown,
): CoreEventEnvelope | null {
  if (!metadata || typeof metadata !== "object") return null;
  const contract = (metadata as Record<string, unknown>).eventContract;
  if (!contract || typeof contract !== "object") return null;
  const env = contract as CoreEventEnvelope;
  if (env.schemaVersion !== CORE_EVENT_SCHEMA_VERSION) return null;
  if (!env.correlationId || !env.productSlug || !env.action) return null;
  return env;
}

export const CoreEventContract = {
  build: buildEventEnvelope,
  stamp: stampPlatformAuditEvent,
  parse: parseEventEnvelopeFromMetadata,
};
