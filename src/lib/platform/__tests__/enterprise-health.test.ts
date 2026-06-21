/** @jest-environment node */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    platformOutboxEvent: {
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}));

jest.mock("@/lib/core/events/outbox-service", () => ({
  isOutboxEnabled: jest.fn(() => true),
}));

jest.mock("@/lib/core/events/schema-registry", () => ({
  listEventSchemas: jest.fn(() => [{ eventType: "a" }, { eventType: "b" }]),
}));

jest.mock("@/lib/platform/monitoring/system-monitor", () => ({
  checkRedisHealth: jest.fn().mockResolvedValue({ status: "ok" }),
}));

jest.mock("@/lib/platform/feature-flags/registry", () => ({
  isEnabled: jest.fn((key: string) => key === "platform.abac-shadow"),
}));

import { getEnterpriseHealthSnapshot } from "@/lib/platform/enterprise-health";

describe("EnterpriseHealth", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, RATE_LIMITER: "memory", REDIS_URL: "" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns tier3 snapshot with memory rate limiter warning", async () => {
    const snapshot = await getEnterpriseHealthSnapshot();
    expect(snapshot.program).toBe("tier3-enterprise-prep");
    expect(snapshot.rateLimiter.mode).toBe("memory");
    expect(snapshot.intelligenceCore.schemaRegistryTypes).toBe(2);
    expect(snapshot.alerts.some((a) => a.code === "RATE_LIMITER_MEMORY")).toBe(true);
  });
});
