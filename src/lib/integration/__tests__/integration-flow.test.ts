// ─── Full Integration Flow Tests ───
// Tests the complete chain:
// 1. Mock DB → resolver → ProviderRegistry
// 2. ProviderRegistry → adapter → health check
// 3. Failover engine → circuit breaker → alerts
//
// These are "integration" in name — they use mocked DB + factories to
// exercise the real orchestration code end-to-end without external deps.

import { IntegrationType, IntegrationStatus } from "../types";
import type { ProviderFactory, ProviderConfig, ProviderHealth } from "../types";

// ─── Global mocks ───

jest.mock("@/lib/prisma", () => ({
  prisma: {
    organization: { findMany: jest.fn() },
    tenantIntegration: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("../resolver", () => ({
  resolveIntegrations: jest.fn(),
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../metrics", () => ({
  incrementCounter: jest.fn(),
}));

// Suppress alert fire-and-forget errors in tests
jest.mock("../circuit-alerts", () => ({
  notifyCircuitOpen: jest.fn().mockResolvedValue(undefined),
  notifyCircuitRecovered: jest.fn().mockResolvedValue(undefined),
}));

// ─── Imports ───

import { resolveIntegrations } from "../resolver";
import { getProviderRegistry, providerRegistry } from "../provider-registry";
import {
  recordSuccess,
  recordFailure,
  resetCircuit,
  getCircuitState,
  isCircuitOpen,
  getCircuitSnapshot,
} from "../failover-engine";
import { getHealthRuntime } from "../health-runtime";
import { prisma } from "@/lib/prisma";

// ─── Helpers ───

function clearFactories() {
  const g = globalThis as unknown as { providerFactories: unknown[] | undefined };
  g.providerFactories = undefined;
}

const mockResolveIntegrations = resolveIntegrations as jest.Mock;
const mockFindMany = prisma.organization.findMany as jest.Mock;
const mockFindUnique = prisma.tenantIntegration.findUnique as jest.Mock;
const mockUpdate = prisma.tenantIntegration.update as jest.Mock;

function makeMockIntegration(overrides: Record<string, unknown> = {}) {
  return {
    id: "int-1",
    organizationId: "org-1",
    type: "AI",
    provider: "openai",
    displayName: "OpenAI",
    status: "ACTIVE",
    priority: 1,
    vaultSecretId: undefined,
    configMetadata: {},
    lastHealthCheckAt: undefined,
    lastSuccessAt: undefined,
    lastFailureAt: undefined,
    failureReason: undefined,
    failureCount: 0,
    createdById: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    source: "tenant-integration",
    ...overrides,
  };
}

class MockAIProviderFactory implements ProviderFactory {
  private healthy: boolean;
  private shouldThrow: boolean;
  constructor(healthy = true, shouldThrow = false) {
    this.healthy = healthy;
    this.shouldThrow = shouldThrow;
  }
  async create(config: ProviderConfig) {
    if (this.shouldThrow) {
      throw new Error("Factory error");
    }
    return {
      providerId: config.provider,
      providerType: IntegrationType.AI,
      generate: async () => ({ content: "ok", model: "gpt-4", provider: config.provider }),
      health: async (): Promise<ProviderHealth> => ({
        healthy: this.healthy,
        latencyMs: 10,
        lastCheck: new Date(),
        error: this.healthy ? undefined : "Simulated failure",
      }),
    };
  }
}

// ─── Tests ───

beforeEach(() => {
  jest.clearAllMocks();
  clearFactories();
  resetCircuit();
});

describe("Full Integration Flow", () => {
  // ─── 1. ProviderRegistry → resolve → health check ───

  describe("Phase 1: Resolve + Health Check", () => {
    it("resolves a provider and calls health() successfully", async () => {
      mockResolveIntegrations.mockResolvedValue([makeMockIntegration()]);
      providerRegistry.register(IntegrationType.AI, "openai", new MockAIProviderFactory(true));

      const resolved = await providerRegistry.resolve<any>("org-1", IntegrationType.AI);
      expect(resolved.provider).toBeDefined();
      expect(resolved.integration.id).toBe("int-1");

      const health = await resolved.provider.health();
      expect(health.healthy).toBe(true);
      expect(health.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it("healthCheck() returns result through providerRegistry", async () => {
      mockFindUnique.mockResolvedValue({
        id: "int-1",
        organizationId: "org-1",
        type: "AI",
        provider: "openai",
        status: "ACTIVE",
      });
      mockUpdate.mockResolvedValue({});

      // Register the factory so buildFromRecord can create the provider
      providerRegistry.register(IntegrationType.AI, "openai", new MockAIProviderFactory(true));

      const result = await providerRegistry.healthCheck("org-1", "int-1");
      expect(result).toBeDefined();
      expect(result.healthy).toBe(true);
    });

    it("resolveWithFallback tries next provider when first fails", async () => {
      mockResolveIntegrations.mockResolvedValue([
        makeMockIntegration({ id: "int-1", provider: "openai" }),
        makeMockIntegration({ id: "int-2", provider: "anthropic" }),
      ]);
      providerRegistry.register(IntegrationType.AI, "openai", new MockAIProviderFactory(false));
      providerRegistry.register(IntegrationType.AI, "anthropic", new MockAIProviderFactory(true));

      const resolved = await providerRegistry.resolveWithFallback<any>("org-1", IntegrationType.AI);
      // Should succeed with anthropic (openai throws)
      expect(resolved.provider).toBeDefined();
    });

    it("throws when all providers fail in resolveWithFallback", async () => {
      mockResolveIntegrations.mockResolvedValue([
        makeMockIntegration({ id: "int-1", provider: "openai" }),
      ]);
      // Factory throws on create → resolveWithFallback will try and fail
      providerRegistry.register(IntegrationType.AI, "openai", new MockAIProviderFactory(true, true));

      await expect(
        providerRegistry.resolveWithFallback("org-1", IntegrationType.AI),
      ).rejects.toThrow("All providers failed");
    });
  });

  // ─── 2. Circuit Breaker State Transitions ───

  describe("Phase 2: Circuit Breaker", () => {
    it("starts closed, opens after threshold failures", () => {
      expect(getCircuitState("org-1", IntegrationType.AI, "openai")).toBe("closed");

      for (let i = 0; i < 5; i++) {
        recordFailure("org-1", IntegrationType.AI, "openai");
      }

      expect(getCircuitState("org-1", IntegrationType.AI, "openai")).toBe("open");
      expect(isCircuitOpen("org-1", IntegrationType.AI, "openai")).toBe(true);
    });

    it("records circuit open in snapshot", () => {
      for (let i = 0; i < 5; i++) {
        recordFailure("org-1", IntegrationType.AI, "openai");
      }

      const snapshot = getCircuitSnapshot();
      const entry = snapshot.find((s) => s.key.includes("openai"));
      expect(entry).toBeDefined();
      expect(entry!.state).toBe("open");
    });

    it("closes after successful recovery", () => {
      for (let i = 0; i < 5; i++) {
        recordFailure("org-1", IntegrationType.AI, "openai");
      }
      expect(isCircuitOpen("org-1", IntegrationType.AI, "openai")).toBe(true);

      recordSuccess("org-1", IntegrationType.AI, "openai");
      expect(getCircuitState("org-1", IntegrationType.AI, "openai")).toBe("closed");
    });

    it("isolates circuits per org", () => {
      for (let i = 0; i < 5; i++) {
        recordFailure("org-a", IntegrationType.AI, "openai");
      }
      expect(isCircuitOpen("org-a", IntegrationType.AI, "openai")).toBe(true);
      expect(isCircuitOpen("org-b", IntegrationType.AI, "openai")).toBe(false);
    });

    it("isolates circuits per integration type", () => {
      for (let i = 0; i < 5; i++) {
        recordFailure("org-1", IntegrationType.AI, "openai");
      }
      expect(isCircuitOpen("org-1", IntegrationType.AI, "openai")).toBe(true);
      expect(isCircuitOpen("org-1", IntegrationType.CRM, "hubspot")).toBe(false);
    });
  });

  // ─── 3. Health Runtime Tick ───

  describe("Phase 3: Health Runtime", () => {
    it("tick returns snapshot when no orgs have integrations", async () => {
      mockFindMany.mockResolvedValue([]);
      const runtime = getHealthRuntime();
      const result = await runtime.tick();

      expect(result.totalIntegrations).toBe(0);
      expect(result.healthy).toBe(0);
      expect(result.lastTickAt).toBeInstanceOf(Date);
    });

    it("tick handles errors gracefully", async () => {
      mockFindMany.mockResolvedValue([{ id: "org-1" }]);
      const mockList = jest.spyOn(providerRegistry, "listProviders");
      mockList.mockRejectedValue(new Error("DB error"));

      const runtime = getHealthRuntime();
      const result = await runtime.tick();
      expect(result.totalIntegrations).toBe(0);
    });
  });

  // ─── 4. Full Integration: resolve → circuit → health ───

  describe("Phase 4: Resolve + Circuit + Health", () => {
    it("tracks failures across the full chain", async () => {
      // Register a provider that's unhealthy
      providerRegistry.register(IntegrationType.AI, "openai", new MockAIProviderFactory(false));
      mockResolveIntegrations.mockResolvedValue([makeMockIntegration()]);

      // Resolve
      const resolved = await providerRegistry.resolve<any>("org-1", IntegrationType.AI);
      expect(resolved.provider).toBeDefined();

      // Health check: unhealthy provider
      const health = await resolved.provider.health();
      expect(health.healthy).toBe(false);

      // Record failures to open circuit
      for (let i = 0; i < 4; i++) {
        recordFailure("org-1", IntegrationType.AI, "openai");
      }
      expect(isCircuitOpen("org-1", IntegrationType.AI, "openai")).toBe(false);

      // One more opens it
      recordFailure("org-1", IntegrationType.AI, "openai");
      expect(isCircuitOpen("org-1", IntegrationType.AI, "openai")).toBe(true);

      // After reset, circuit is closed again
      resetCircuit("org-1", IntegrationType.AI, "openai");
      expect(isCircuitOpen("org-1", IntegrationType.AI, "openai")).toBe(false);
    });
  });
});
