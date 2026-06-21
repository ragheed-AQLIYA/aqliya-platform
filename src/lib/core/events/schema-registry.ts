import "server-only";

import {
  CORE_EVENT_SCHEMA_VERSION,
  type CoreEventDomain,
  type CoreEventEnvelope,
} from "@/lib/core/contracts/event-envelope";

export interface EventSchemaDefinition {
  eventType: string;
  schemaVersion: typeof CORE_EVENT_SCHEMA_VERSION;
  domain: CoreEventDomain;
  description: string;
  /** Optional action prefix patterns for audit-derived events */
  actionPrefixes?: string[];
  deprecated?: boolean;
  supersededBy?: string;
}

export interface EventValidationResult {
  valid: boolean;
  eventType: string;
  errors: string[];
  warnings: string[];
}

const registry = new Map<string, EventSchemaDefinition>();

const BUILTIN_SCHEMAS: EventSchemaDefinition[] = [
  {
    eventType: "platform.audit.recorded",
    schemaVersion: CORE_EVENT_SCHEMA_VERSION,
    domain: "platform",
    description: "Canonical platform audit write stamped with event contract",
  },
  {
    eventType: "platform.governance.alert",
    schemaVersion: CORE_EVENT_SCHEMA_VERSION,
    domain: "platform",
    description: "Governance-critical security alert fan-out",
    actionPrefixes: ["auth."],
  },
  {
    eventType: "platform.siem.candidate",
    schemaVersion: CORE_EVENT_SCHEMA_VERSION,
    domain: "platform",
    description: "SIEM export bridge candidate",
    actionPrefixes: ["siem."],
  },
];

for (const schema of BUILTIN_SCHEMAS) {
  registry.set(schema.eventType, schema);
}

export function registerEventSchema(definition: EventSchemaDefinition): void {
  registry.set(definition.eventType, definition);
}

export function getEventSchema(eventType: string): EventSchemaDefinition | null {
  return registry.get(eventType) ?? null;
}

export function listEventSchemas(): EventSchemaDefinition[] {
  return [...registry.values()].sort((a, b) =>
    a.eventType.localeCompare(b.eventType),
  );
}

export function resolveEventTypeForEnvelope(
  envelope: CoreEventEnvelope,
  fallback = "platform.audit.recorded",
): string {
  if (envelope.action.startsWith("siem.")) return "platform.siem.candidate";
  if (
    envelope.action.startsWith("auth.") ||
    envelope.action.includes(".denied") ||
    envelope.action.includes(".rejected")
  ) {
    return "platform.governance.alert";
  }
  return fallback;
}

export function validateCoreEventEnvelope(
  envelope: CoreEventEnvelope,
  eventType?: string,
): EventValidationResult {
  const resolvedType = eventType ?? resolveEventTypeForEnvelope(envelope);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (envelope.schemaVersion !== CORE_EVENT_SCHEMA_VERSION) {
    errors.push(
      `Unsupported schemaVersion ${envelope.schemaVersion}; expected ${CORE_EVENT_SCHEMA_VERSION}`,
    );
  }

  if (!envelope.correlationId) errors.push("Missing correlationId");
  if (!envelope.productSlug) errors.push("Missing productSlug");
  if (!envelope.action) errors.push("Missing action");
  if (!envelope.occurredAt) errors.push("Missing occurredAt");

  const schema = getEventSchema(resolvedType);
  if (!schema) {
    warnings.push(`Unknown eventType ${resolvedType} — not in registry`);
  } else {
    if (schema.deprecated) {
      warnings.push(
        `Event type ${resolvedType} is deprecated${schema.supersededBy ? `; use ${schema.supersededBy}` : ""}`,
      );
    }
    if (schema.domain !== envelope.domain) {
      warnings.push(
        `Domain mismatch: envelope=${envelope.domain}, schema=${schema.domain}`,
      );
    }
    if (schema.actionPrefixes?.length) {
      const matches = schema.actionPrefixes.some((prefix) =>
        envelope.action.startsWith(prefix),
      );
      if (!matches) {
        warnings.push(
          `Action ${envelope.action} does not match expected prefixes for ${resolvedType}`,
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    eventType: resolvedType,
    errors,
    warnings,
  };
}

export const EventSchemaRegistry = {
  register: registerEventSchema,
  get: getEventSchema,
  list: listEventSchemas,
  validate: validateCoreEventEnvelope,
  resolveType: resolveEventTypeForEnvelope,
};
