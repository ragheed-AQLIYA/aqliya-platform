import "./outbox-handlers";

export {
  PLATFORM_AUDIT_OUTBOX_EVENT,
  OutboxService,
  buildOutboxPayloadFromAuditLog,
  clearOutboxHandlers,
  insertOutboxEvent,
  isOutboxEnabled,
  processOutboxBatch,
  registerOutboxHandler,
  retryFailedOutboxEvents,
} from "./outbox-service";

export {
  EventSchemaRegistry,
  listEventSchemas,
  registerEventSchema,
  validateCoreEventEnvelope,
  resolveEventTypeForEnvelope,
  type EventSchemaDefinition,
  type EventValidationResult,
} from "./schema-registry";

export type {
  OutboxDispatchPayload,
  OutboxEventStatus,
  OutboxHandler,
} from "./outbox-service";
