// ─── IntegrationHealth Runtime — Unit Tests ───

import { IntegrationType } from "../types";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    organization: {
      findMany: jest.fn(),
    },
    tenantIntegration: {
      update: jest.fn(),
    },
  },
}));

jest.mock("../provider-registry", () => ({
  providerRegistry: {
    listProviders: jest.fn(),
    healthCheck: jest.fn(),
  },
  getProviderRegistry: () => ({
    listProviders: jest.fn(),
    healthCheck: jest.fn(),
  }),
}));

jest.mock("../metrics", () => ({
  incrementCounter: jest.fn(),
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue(undefined),
}));

import { prisma } from "@/lib/prisma";
import { providerRegistry } from "../provider-registry";
import { getHealthRuntime } from "../health-runtime";
import type { HealthCheckResult } from "../types";

const mockFindMany = prisma.organization.findMany as jest.Mock;
const mockListProviders = providerRegistry.listProviders as jest.Mock;
const mockHealthCheck = providerRegistry.healthCheck as jest.Mock;

describe("IntegrationHealth Runtime", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindMany.mockResolvedValue([]); // default: no orgs with integrations
  });

  describe("start / stop / isRunning", () => {
    it("is not running by default", () => {
      const runtime = getHealthRuntime({ tickIntervalMs: 60000 });
      expect(runtime.isRunning()).toBe(false);
    });

    it("start() makes isRunning() return true", () => {
      mockFindMany.mockResolvedValue([]); // start() triggers tick
      const runtime = getHealthRuntime({ tickIntervalMs: 60000 });
      runtime.start();
      expect(runtime.isRunning()).toBe(true);
      runtime.stop();
      expect(runtime.isRunning()).toBe(false);
    });
  });

  describe("tick()", () => {
    it("returns empty snapshot when no orgs have integrations", async () => {
      mockFindMany.mockResolvedValue([]);
      const runtime = getHealthRuntime();
      const result = await runtime.tick();

      expect(result.totalIntegrations).toBe(0);
      expect(result.healthy).toBe(0);
      expect(result.unhealthy).toBe(0);
    });

    it("aggregates health results from all integrations", async () => {
      mockFindMany.mockResolvedValue([{ id: "org-1" }]);

      // org-1 has integrations for AI and CRM
      mockListProviders.mockImplementation((orgId: string, type: IntegrationType) => {
        if (type === IntegrationType.AI) {
          return Promise.resolve([
            { id: "ai-1", provider: "openai", status: "ACTIVE", failureCount: 0 },
          ]);
        }
        if (type === IntegrationType.CRM) {
          return Promise.resolve([
            { id: "crm-1", provider: "hubspot", status: "ACTIVE", failureCount: 0 },
          ]);
        }
        return Promise.resolve([]);
      });

      mockHealthCheck.mockImplementation(
        (orgId: string, integrationId: string): Promise<HealthCheckResult> => {
          if (integrationId === "ai-1") {
            return Promise.resolve({
              integrationId: "ai-1",
              organizationId: "org-1",
              type: IntegrationType.AI,
              provider: "openai",
              healthy: true,
              latencyMs: 42,
              lastCheckAt: new Date(),
            });
          }
          return Promise.resolve({
            integrationId: "crm-1",
            organizationId: "org-1",
            type: IntegrationType.CRM,
            provider: "hubspot",
            healthy: false,
            latencyMs: 5000,
            error: "Connection timeout",
            lastCheckAt: new Date(),
          });
        },
      );

      const runtime = getHealthRuntime();
      const result = await runtime.tick();

      expect(result.totalIntegrations).toBe(2);
      expect(result.healthy).toBe(1);
      expect(result.unhealthy).toBe(1);
      expect(result.degraded).toBe(0); // latency < 5000
    });

    it("handles healthCheck errors gracefully", async () => {
      mockFindMany.mockResolvedValue([{ id: "org-1" }]);
      mockListProviders.mockImplementation(
        (orgId: string, type: IntegrationType) => {
          if (type === IntegrationType.AI) {
            return Promise.resolve([
              { id: "int-1", provider: "openai", status: "ACTIVE", failureCount: 0 },
            ]);
          }
          return Promise.resolve([]);
        },
      );
      mockHealthCheck.mockRejectedValue(new Error("Unexpected error"));

      const runtime = getHealthRuntime();
      const result = await runtime.tick();

      // The individual check failure IS caught and added as unhealthy
      expect(result.totalIntegrations).toBe(1);
      expect(result.unhealthy).toBe(1);
      expect(result.healthy).toBe(0);
    });
  });
});
