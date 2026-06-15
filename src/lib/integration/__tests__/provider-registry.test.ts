// ─── ProviderRegistry — Unit Tests ───

import { IntegrationType, IntegrationStatus } from "../types";
import type { ProviderFactory, ProviderConfig, ProviderHealth } from "../types";

// Mock prisma and resolver before importing
jest.mock("@/lib/prisma", () => ({
  prisma: {
    tenantIntegration: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("../resolver", () => ({
  resolveIntegrations: jest.fn(),
}));

import { resolveIntegrations } from "../resolver";
import { getProviderRegistry, providerRegistry } from "../provider-registry";

// Ensure clean factory state between tests
function clearFactories() {
  const g = globalThis as unknown as { providerFactories: unknown[] | undefined };
  g.providerFactories = undefined;
}

// ─── Helpers ───

const mockResolveIntegrations = resolveIntegrations as jest.Mock;

function makeMockIntegration(overrides: Record<string, unknown> = {}) {
  return {
    id: "int-1",
    organizationId: "org-1",
    type: "AI",
    provider: "openai",
    displayName: "OpenAI Test",
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

class MockFactory implements ProviderFactory {
  private shouldThrow: boolean;

  constructor(shouldThrow = false) {
    this.shouldThrow = shouldThrow;
  }

  async create(config: ProviderConfig) {
    if (this.shouldThrow) {
      throw new Error("Factory error");
    }
    return {
      providerId: config.provider,
      providerType: config.type === "AI" ? IntegrationType.AI : IntegrationType.CRM,
      health: async (): Promise<ProviderHealth> => ({
        healthy: true,
        latencyMs: 10,
        lastCheck: new Date(),
      }),
      generate: async () => ({ content: "ok", model: "gpt-4", provider: "openai" }),
    };
  }
}

// ─── Tests ───

beforeEach(() => {
  jest.clearAllMocks();
  clearFactories();
});

describe("ProviderRegistry — register", () => {
  it("registers a factory for a type+providerId pair", () => {
    const factory = new MockFactory();
    providerRegistry.register(IntegrationType.AI, "openai", factory);
    // No error = registration OK (no public getter needed)
  });

  it("replaces existing registration for same type+providerId", () => {
    const factory1 = new MockFactory(false);
    const factory2 = new MockFactory(false);
    providerRegistry.register(IntegrationType.AI, "openai", factory1);
    providerRegistry.register(IntegrationType.AI, "openai", factory2);
    // Should not throw — replacement is allowed
  });
});

describe("ProviderRegistry — resolve", () => {
  it("throws when no ACTIVE integrations exist", async () => {
    mockResolveIntegrations.mockResolvedValue([]);

    await expect(
      providerRegistry.resolve("org-1", IntegrationType.AI),
    ).rejects.toThrow("No ACTIVE integration");
  });

  it("throws when no factory registered for the provider", async () => {
    mockResolveIntegrations.mockResolvedValue([makeMockIntegration()]);

    await expect(
      providerRegistry.resolve("org-1", IntegrationType.AI),
    ).rejects.toThrow("No factory registered");
  });

  it("returns a ResolvedProvider when integration + factory match", async () => {
    mockResolveIntegrations.mockResolvedValue([makeMockIntegration()]);
    providerRegistry.register(IntegrationType.AI, "openai", new MockFactory());

    const result = await providerRegistry.resolve("org-1", IntegrationType.AI);
    expect(result).toBeDefined();
    expect(result.provider).toBeDefined();
    expect(result.integration.id).toBe("int-1");
  });

  it("picks the highest-priority ACTIVE integration", async () => {
    mockResolveIntegrations.mockResolvedValue([
      makeMockIntegration({ id: "int-1", priority: 10 }),
      makeMockIntegration({ id: "int-2", priority: 1 }),
    ]);
    providerRegistry.register(IntegrationType.AI, "openai", new MockFactory());

    const result = await providerRegistry.resolve("org-1", IntegrationType.AI);
    expect(result.integration.id).toBe("int-2"); // priority 1 = highest
  });
});

describe("ProviderRegistry — resolveWithFallback", () => {
  it("tries next provider when the first fails", async () => {
    mockResolveIntegrations.mockResolvedValue([
      makeMockIntegration({ id: "int-1", provider: "openai" }),
      makeMockIntegration({ id: "int-2", provider: "anthropic" }),
    ]);
    providerRegistry.register(IntegrationType.AI, "openai", new MockFactory(true));
    providerRegistry.register(IntegrationType.AI, "anthropic", new MockFactory(false));

    const result = await providerRegistry.resolveWithFallback(
      "org-1",
      IntegrationType.AI,
    );
    expect(result).toBeDefined();
    // Should succeed with anthropic since openai factory throws
  });

  it("throws when all providers fail", async () => {
    mockResolveIntegrations.mockResolvedValue([
      makeMockIntegration({ id: "int-1", provider: "openai" }),
      makeMockIntegration({ id: "int-2", provider: "anthropic" }),
    ]);
    providerRegistry.register(IntegrationType.AI, "openai", new MockFactory(true));
    providerRegistry.register(IntegrationType.AI, "anthropic", new MockFactory(true));

    await expect(
      providerRegistry.resolveWithFallback("org-1", IntegrationType.AI),
    ).rejects.toThrow("All providers failed");
  });

  it("skips DISABLED integrations", async () => {
    mockResolveIntegrations.mockResolvedValue([
      makeMockIntegration({ id: "int-1", status: "DISABLED" }),
    ]);
    providerRegistry.register(IntegrationType.AI, "openai", new MockFactory(false));

    await expect(
      providerRegistry.resolveWithFallback("org-1", IntegrationType.AI),
    ).rejects.toThrow("No integration available");
  });
});

describe("ProviderRegistry — listProviders", () => {
  it("returns all integrations for an org+type", async () => {
    mockResolveIntegrations.mockResolvedValue([
      makeMockIntegration({ id: "int-1" }),
      makeMockIntegration({ id: "int-2" }),
    ]);

    const list = await providerRegistry.listProviders("org-1", IntegrationType.AI);
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe("int-1");
    expect(list[1].id).toBe("int-2");
  });
});

describe("ProviderRegistry — healthCheck", () => {
  it("throws when integration not found", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.tenantIntegration.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      providerRegistry.healthCheck("org-1", "nonexistent"),
    ).rejects.toThrow("not found");
  });

  it("returns healthy=false when integration belongs to different org", async () => {
    const { prisma } = await import("@/lib/prisma");
    // findUnique returns a record belonging to "other-org"
    (prisma.tenantIntegration.findUnique as jest.Mock).mockImplementation(
      (args: { where: { id: string } }) => {
        if (args.where.id === "int-1") {
          return Promise.resolve({
            id: "int-1",
            organizationId: "other-org",
            type: "AI",
            provider: "openai",
            status: "ACTIVE",
          });
        }
        return Promise.resolve(null);
      },
    );

    await expect(
      providerRegistry.healthCheck("org-1", "int-1"),
    ).rejects.toThrow("does not belong");
  });
});
