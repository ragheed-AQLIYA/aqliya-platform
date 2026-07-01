/** @jest-environment node */

import { describe, it, expect } from "@jest/globals";
import {
  CORE_EVENT_SCHEMA_VERSION,
  inferEventDomain,
  buildEventEnvelope,
  parseEventEnvelopeFromMetadata,
  stampPlatformAuditEvent,
  CoreEventContract,
} from "@/lib/core/contracts/event-envelope";

describe("CoreEventContract (IC-P3-05)", () => {
  describe("inferEventDomain", () => {
    it("returns auth for auth.* actions", () => {
      expect(inferEventDomain("platform", "auth.login")).toBe("auth");
    });
    it("returns audit for audit productKey or audit action", () => {
      expect(inferEventDomain("audit", "engagement.created")).toBe("audit");
      expect(inferEventDomain("platform", "audit.report")).toBe("audit");
    });
    it("returns workflow for workflow/approval actions", () => {
      expect(inferEventDomain("platform", "workflow.started")).toBe("workflow");
      expect(inferEventDomain("decisions", "approval.granted")).toBe("workflow");
    });
    it("returns ai for ai.* actions", () => {
      expect(inferEventDomain("platform", "ai.suggestion")).toBe("ai");
      expect(inferEventDomain("platform", "ai.suggestion")).toBe("ai");
    });
    it("returns notification for notification actions", () => {
      expect(inferEventDomain("platform", "notification.sent")).toBe("notification");
    });
    it("defaults to platform for unmatched", () => {
      expect(inferEventDomain("sales", "deal.created")).toBe("platform");
    });
  });

  describe("buildEventEnvelope", () => {
    it("builds envelope with all required fields", () => {
      const env = buildEventEnvelope({ productKey: "audit", action: "engagement.created", platformOrganizationId: "org-1", actorId: "user-1", targetType: "Engagement", targetId: "eng-123" });
      expect(env.schemaVersion).toBe(CORE_EVENT_SCHEMA_VERSION);
      expect(env.correlationId).toBeDefined();
      expect(env.productSlug).toBe("audit");
      expect(env.domain).toBe("audit");
      expect(env.actorId).toBe("user-1");
      expect(env.organizationId).toBe("org-1");
      expect(env.resourceType).toBe("Engagement");
      expect(env.resourceId).toBe("eng-123");
      expect(env.occurredAt).toBeDefined();
    });
    it("preserves correlationId when provided", () => {
      expect(buildEventEnvelope({ productKey: "platform", action: "x", correlationId: "custom-1" }).correlationId).toBe("custom-1");
    });
    it("includes causationId when provided", () => {
      expect(buildEventEnvelope({ productKey: "platform", action: "x", causationId: "cause-1" }).causationId).toBe("cause-1");
    });
    it("includes metadata when provided as object", () => {
      expect(buildEventEnvelope({ productKey: "platform", action: "x", metadata: { priority: "high" } }).metadata).toEqual({ priority: "high" });
    });
    it("omits metadata when not provided", () => {
      expect(buildEventEnvelope({ productKey: "platform", action: "heartbeat" }).metadata).toBeUndefined();
    });
  });

  describe("parseEventEnvelopeFromMetadata", () => {
    it("parses a valid envelope from stamped metadata", () => {
      const original = buildEventEnvelope({ productKey: "audit", action: "finding.created" });
      const stamped = stampPlatformAuditEvent({ productKey: "audit", action: "finding.created" });
      const parsed = parseEventEnvelopeFromMetadata(stamped.metadata);
      expect(parsed).not.toBeNull();
      expect(parsed.correlationId).toBeDefined();
    });
    it("returns null for null metadata", () => expect(parseEventEnvelopeFromMetadata(null)).toBeNull());
    it("returns null for non-object metadata", () => expect(parseEventEnvelopeFromMetadata("str")).toBeNull());
    it("returns null for metadata without eventContract", () => expect(parseEventEnvelopeFromMetadata({})).toBeNull());
    it("returns null if schema version mismatches", () => {
      expect(parseEventEnvelopeFromMetadata({ eventContract: { schemaVersion: "0.5", correlationId: "x", productSlug: "x", action: "x" } })).toBeNull();
    });
    it("returns null if required fields missing", () => {
      expect(parseEventEnvelopeFromMetadata({ eventContract: { schemaVersion: CORE_EVENT_SCHEMA_VERSION } })).toBeNull();
    });
  });

  describe("stampPlatformAuditEvent", () => {
    it("injects event envelope into metadata", () => {
      const stamped = stampPlatformAuditEvent({ productKey: "sales", action: "opportunity.created" });
      expect(stamped.requestId).toBeDefined();
      expect(stamped.metadata.eventContract).toBeDefined();
    });
  });

  describe("CoreEventContract API", () => {
    it("exposes build, stamp, and parse methods", () => {
      expect(CoreEventContract.build).toBe(buildEventEnvelope);
      expect(CoreEventContract.stamp).toBe(stampPlatformAuditEvent);
      expect(CoreEventContract.parse).toBe(parseEventEnvelopeFromMetadata);
    });
  });
});
