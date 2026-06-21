import {
  CORE_EVENT_SCHEMA_VERSION,
  type CoreEventEnvelope,
} from "@/lib/core/contracts/event-envelope";
import {
  EventSchemaRegistry,
  listEventSchemas,
  resolveEventTypeForEnvelope,
  validateCoreEventEnvelope,
} from "@/lib/core/events/schema-registry";

function sampleEnvelope(overrides: Partial<CoreEventEnvelope> = {}): CoreEventEnvelope {
  return {
    schemaVersion: CORE_EVENT_SCHEMA_VERSION,
    correlationId: "corr-1",
    productSlug: "platform",
    domain: "platform",
    action: "test.action",
    occurredAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("EventSchemaRegistry", () => {
  it("lists built-in schemas", () => {
    const schemas = listEventSchemas();
    expect(schemas.length).toBeGreaterThanOrEqual(3);
    expect(schemas.some((s) => s.eventType === "platform.audit.recorded")).toBe(
      true,
    );
  });

  it("validates a complete envelope", () => {
    const result = validateCoreEventEnvelope(sampleEnvelope());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects invalid schema version", () => {
    const result = validateCoreEventEnvelope(
      sampleEnvelope({ schemaVersion: "9.9" as typeof CORE_EVENT_SCHEMA_VERSION }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("schemaVersion"))).toBe(true);
  });

  it("resolves governance alert type for auth actions", () => {
    const envelope = sampleEnvelope({
      action: "auth.abac.shadow.mismatch",
      domain: "auth",
    });
    expect(resolveEventTypeForEnvelope(envelope)).toBe("platform.governance.alert");
  });

  it("resolves siem candidate for siem actions", () => {
    const envelope = sampleEnvelope({
      action: "siem.outbox.candidate",
      domain: "platform",
    });
    expect(resolveEventTypeForEnvelope(envelope)).toBe("platform.siem.candidate");
  });

  it("allows custom schema registration", () => {
    EventSchemaRegistry.register({
      eventType: "test.custom.event",
      schemaVersion: CORE_EVENT_SCHEMA_VERSION,
      domain: "platform",
      description: "Test only",
    });
    expect(EventSchemaRegistry.get("test.custom.event")?.description).toBe(
      "Test only",
    );
  });
});
