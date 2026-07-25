// ─── Secret Resolver — Unit Tests ───
// Tests for the refactored secret-resolver module:
//   - SecretPurpose enum values
//   - SecretCache (get, set, invalidate, size, makeKey)
//   - Cache helper functions (invalidateSecretCache, getSecretCacheSize, clearSecretCache)
//   - recordGovernanceEvent with mocked audit log
//   - secretResolver singleton existence

// ─── Global mocks ───

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/integration/metrics", () => ({
  incrementCounter: jest.fn(),
}));

// ─── Imports ───

import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import {
  SecretPurpose,
  invalidateSecretCache,
  getSecretCacheSize,
  clearSecretCache,
  secretResolver,
} from "../secret-resolver";
import {
  getCache,
} from "../secret-resolver/cache";
import { recordGovernanceEvent } from "../secret-resolver/governance";

// ─── Helpers ───

function makeSecretResult(overrides: Record<string, unknown> = {}) {
  return {
    credentials: { apiKey: "sk-test-123" },
    source: "vault" as const,
    vaultEntryId: "ve-1",
    version: 1,
    resolvedAt: new Date("2026-07-21T12:00:00Z"),
    cacheHit: false,
    ...overrides,
  };
}

// ─── Setup ───

beforeEach(() => {
  jest.clearAllMocks();
  clearSecretCache();
});

// ─── 1. SecretPurpose Enum ───

describe("SecretPurpose enum", () => {
  it("has CRM_SYNC as CRM_SYNC", () => {
    expect(SecretPurpose.CRM_SYNC).toBe("CRM_SYNC");
  });

  it("has ERP_SYNC as ERP_SYNC", () => {
    expect(SecretPurpose.ERP_SYNC).toBe("ERP_SYNC");
  });

  it("has EMAIL_SEND as EMAIL_SEND", () => {
    expect(SecretPurpose.EMAIL_SEND).toBe("EMAIL_SEND");
  });

  it("has AI_INFERENCE as AI_INFERENCE", () => {
    expect(SecretPurpose.AI_INFERENCE).toBe("AI_INFERENCE");
  });

  it("has AI_EMBED as AI_EMBED", () => {
    expect(SecretPurpose.AI_EMBED).toBe("AI_EMBED");
  });

  it("has AI_EVALUATE as AI_EVALUATE", () => {
    expect(SecretPurpose.AI_EVALUATE).toBe("AI_EVALUATE");
  });

  it("has HEALTH_CHECK as HEALTH_CHECK", () => {
    expect(SecretPurpose.HEALTH_CHECK).toBe("HEALTH_CHECK");
  });

  it("has STORAGE_READ as STORAGE_READ", () => {
    expect(SecretPurpose.STORAGE_READ).toBe("STORAGE_READ");
  });

  it("has STORAGE_WRITE as STORAGE_WRITE", () => {
    expect(SecretPurpose.STORAGE_WRITE).toBe("STORAGE_WRITE");
  });

  it("has WEBHOOK_SEND as WEBHOOK_SEND", () => {
    expect(SecretPurpose.WEBHOOK_SEND).toBe("WEBHOOK_SEND");
  });

  it("has exactly 10 entries (no extra, no missing)", () => {
    // Non-reverse-lookup keys: filter out numeric reverse mappings
    const keys = Object.keys(SecretPurpose).filter((k) => Number.isNaN(Number(k)));
    expect(keys).toHaveLength(10);
  });
});

// ─── 2. SecretCache Basic Operations ───

describe("SecretCache — basic operations", () => {
  it("get returns null for a missing key", () => {
    const cache = getCache();
    expect(cache.get("nonexistent")).toBeNull();
  });

  it("stores and retrieves a value", () => {
    const cache = getCache();
    const result = makeSecretResult();
    cache.set("org-1:int-1", result);

    const retrieved = cache.get("org-1:int-1");
    expect(retrieved).not.toBeNull();
    expect(retrieved!.credentials).toEqual({ apiKey: "sk-test-123" });
  });

  it("overrides source to 'cache' and cacheHit to true on set", () => {
    const cache = getCache();
    const result = makeSecretResult({ source: "vault", cacheHit: false });
    cache.set("org-1:int-1", result);

    const retrieved = cache.get("org-1:int-1");
    expect(retrieved!.source).toBe("cache");
    expect(retrieved!.cacheHit).toBe(true);
  });

  it("invalidate removes the entry", () => {
    const cache = getCache();
    cache.set("org-1:int-1", makeSecretResult());
    expect(cache.get("org-1:int-1")).not.toBeNull();

    cache.invalidate("org-1", "int-1");
    expect(cache.get("org-1:int-1")).toBeNull();
  });

  it("size returns zero for empty cache", () => {
    const cache = getCache();
    expect(cache.size).toBe(0);
  });

  it("size returns correct count after multiple sets", () => {
    const cache = getCache();
    cache.set("a:1", makeSecretResult());
    cache.set("b:2", makeSecretResult());
    cache.set("c:3", makeSecretResult());
    expect(cache.size).toBe(3);
  });

  it("makeKey produces the correct format", () => {
    const cache = getCache();
    expect(cache.makeKey("org-xyz", "int-987")).toBe("org-xyz:int-987");
  });
});

// ─── 3. Cache Helper Functions ───

describe("cache helper functions", () => {
  it("invalidateSecretCache clears only the specified entry", () => {
    const cache = getCache();
    cache.set("org-1:int-1", makeSecretResult());
    cache.set("org-1:int-2", makeSecretResult());
    expect(cache.size).toBe(2);

    invalidateSecretCache("org-1", "int-1");

    expect(cache.get("org-1:int-1")).toBeNull();
    expect(cache.get("org-1:int-2")).not.toBeNull();
    expect(cache.size).toBe(1);
  });

  it("getSecretCacheSize returns current cache size", () => {
    clearSecretCache();
    expect(getSecretCacheSize()).toBe(0);

    const cache = getCache();
    cache.set("x:1", makeSecretResult());
    expect(getSecretCacheSize()).toBe(1);

    cache.set("x:2", makeSecretResult());
    expect(getSecretCacheSize()).toBe(2);
  });

  it("clearSecretCache empties the entire cache", () => {
    const cache = getCache();
    cache.set("a:1", makeSecretResult());
    cache.set("b:2", makeSecretResult());
    expect(cache.size).toBe(2);

    clearSecretCache();
    expect(getSecretCacheSize()).toBe(0);
    expect(cache.get("a:1")).toBeNull();
    expect(cache.get("b:2")).toBeNull();
  });
});

// ─── 4. Governance ───

describe("recordGovernanceEvent", () => {
  it("writes a SECRET_CREATED event to the audit log with correct params", async () => {
    await recordGovernanceEvent("SECRET_CREATED", {
      organizationId: "org-1",
      integrationId: "int-1",
      provider: "openai",
      type: "AI",
      version: 1,
      performedById: "user-abc",
      purpose: "AI_INFERENCE",
    });

    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        productKey: "integration-layer",
        action: "SECRET_CREATED",
        actorId: "user-abc",
        targetType: "TenantIntegration",
        targetId: "int-1",
        targetLabel: "AI/openai",
        severity: "info",
        metadata: expect.objectContaining({
          organizationId: "org-1",
          integrationId: "int-1",
          provider: "openai",
          type: "AI",
          version: 1,
          purpose: "AI_INFERENCE",
        }),
      }),
    );
  });

  it("writes a SECRET_REVOKED event with 'warning' severity", async () => {
    await recordGovernanceEvent("SECRET_REVOKED", {
      organizationId: "org-2",
      integrationId: "int-2",
      provider: "anthropic",
      type: "AI",
    });

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "SECRET_REVOKED",
        severity: "warning",
      }),
    );
  });

  it("uses vaultEntryKey as targetId when integrationId is not provided", async () => {
    await recordGovernanceEvent("SECRET_VIEWED", {
      organizationId: "org-3",
      vaultEntryKey: "vault-42",
      type: "STORAGE",
      provider: "s3",
    });

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "SECRET_VIEWED",
        targetId: "vault-42",
        targetLabel: "STORAGE/s3",
      }),
    );
  });
});

// ─── 5. SecretResolver Singleton ───

describe("secretResolver singleton", () => {
  it("exists and is not null", () => {
    expect(secretResolver).toBeDefined();
    expect(secretResolver).not.toBeNull();
  });

  it("has getIntegrationSecret method", () => {
    expect(typeof secretResolver.getIntegrationSecret).toBe("function");
  });

  it("has getIntegrationSecretByType method", () => {
    expect(typeof secretResolver.getIntegrationSecretByType).toBe("function");
  });
});

