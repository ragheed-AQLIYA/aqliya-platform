// Mock server-only (no-op in tests)
jest.mock("server-only", () => ({}));

// Mock redis modules
const mockCacheAdapter = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  clear: jest.fn(),
};

jest.mock("@/lib/platform/redis-cache-adapter", () => ({
  cacheAdapter: mockCacheAdapter,
}));

jest.mock("@/lib/platform/redis-client", () => ({
  isRedisAvailable: jest.fn().mockResolvedValue(true),
  getRedisClient: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    decision: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
    workflowRecord: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
    localContentReview: { findMany: jest.fn().mockResolvedValue([]) },
    salesReview: { findMany: jest.fn().mockResolvedValue([]) },
    auditRiskAssessment: { findMany: jest.fn().mockResolvedValue([]) },
    auditFinding: { findMany: jest.fn().mockResolvedValue([]) },
    auditAiOutput: { count: jest.fn().mockResolvedValue(0) },
    platformAuditLog: { count: jest.fn().mockResolvedValue(0) },
  },
}));

const mockRedisClient = jest.requireMock("@/lib/platform/redis-client");
const { isRedisAvailable } = mockRedisClient;

import {
  getCacheKey,
  getCachedOrFetch,
  invalidateCacheByPrefix,
  invalidateDashboardCaches,
  invalidateProductCache,
  warmDashboardCaches,
  DASHBOARD_CACHE_TTL_MS,
  ENTITY_CACHE_TTL_MS,
} from "@/lib/platform/cache-strategy";
import { cacheAdapter } from "@/lib/platform/redis-cache-adapter";

beforeEach(() => {
  jest.clearAllMocks();
  // Restore default prisma mock implementations that may have been overridden
  const prismaMock = jest.requireMock("@/lib/prisma");
  prismaMock.prisma.decision.findMany.mockResolvedValue([]);
  prismaMock.prisma.decision.count.mockResolvedValue(0);
  prismaMock.prisma.workflowRecord.findMany.mockResolvedValue([]);
  prismaMock.prisma.workflowRecord.count.mockResolvedValue(0);
  prismaMock.prisma.localContentReview.findMany.mockResolvedValue([]);
  prismaMock.prisma.salesReview.findMany.mockResolvedValue([]);
  prismaMock.prisma.auditRiskAssessment.findMany.mockResolvedValue([]);
  prismaMock.prisma.auditFinding.findMany.mockResolvedValue([]);
  prismaMock.prisma.auditAiOutput.count.mockResolvedValue(0);
  prismaMock.prisma.platformAuditLog.count.mockResolvedValue(0);
});

describe("getCacheKey", () => {
  it("builds correct cache key from product, entity, id", () => {
    expect(getCacheKey("dashboard", "metrics", "org-123")).toBe("dashboard:metrics:org-123");
  });

  it("handles empty strings", () => {
    expect(getCacheKey("", "", "")).toBe("::");
  });

  it("handles special characters in id", () => {
    expect(getCacheKey("decision", "detail", "abc-123/def")).toBe("decision:detail:abc-123/def");
  });
});

describe("getCachedOrFetch", () => {
  it("returns cached value on cache hit without calling fetchFn", async () => {
    const mockValue = { data: "cached-result" };
    (cacheAdapter.get as jest.Mock).mockResolvedValue(mockValue);

    const fetchFn = jest.fn().mockResolvedValue({ data: "fresh-result" });
    const result = await getCachedOrFetch("test:key", fetchFn, 60000);

    expect(result).toEqual(mockValue);
    expect(fetchFn).not.toHaveBeenCalled();
    expect(cacheAdapter.get).toHaveBeenCalledWith("test:key");
    expect(cacheAdapter.set).not.toHaveBeenCalled();
  });

  it("calls fetchFn on cache miss and stores result", async () => {
    (cacheAdapter.get as jest.Mock).mockResolvedValue(null);
    const mockValue = { items: [1, 2, 3] };
    const fetchFn = jest.fn().mockResolvedValue(mockValue);

    const result = await getCachedOrFetch("test:miss", fetchFn, 30000);

    expect(result).toEqual(mockValue);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(cacheAdapter.set).toHaveBeenCalledWith("test:miss", mockValue, 30000);
  });

  it("passes TTL to cacheAdapter.set", async () => {
    (cacheAdapter.get as jest.Mock).mockResolvedValue(null);
    const fetchFn = jest.fn().mockResolvedValue("value");

    await getCachedOrFetch("ttl:test", fetchFn, 120000);

    expect(cacheAdapter.set).toHaveBeenCalledWith("ttl:test", "value", 120000);
  });

  it("re-executes fetchFn after TTL expiry (simulated via cache miss)", async () => {
    // First call: cache miss
    (cacheAdapter.get as jest.Mock).mockResolvedValueOnce(null);
    const fetchFn = jest.fn().mockResolvedValue("fresh");
    await getCachedOrFetch("ttl:expire", fetchFn, 5000);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    // Second call: still cache miss (TTL expired in real scenario)
    (cacheAdapter.get as jest.Mock).mockResolvedValueOnce(null);
    await getCachedOrFetch("ttl:expire", fetchFn, 5000);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("returns cached value on second call (cache hit)", async () => {
    // First call: miss
    (cacheAdapter.get as jest.Mock).mockResolvedValueOnce(null);
    const fetchFn = jest.fn().mockResolvedValue("value");
    await getCachedOrFetch("cache:hit", fetchFn, 5000);

    // Second call: hit
    (cacheAdapter.get as jest.Mock).mockResolvedValueOnce("cached-value");
    const result = await getCachedOrFetch("cache:hit", fetchFn, 5000);
    expect(result).toBe("cached-value");
    expect(fetchFn).toHaveBeenCalledTimes(1); // still 1
  });

  it("propagates fetchFn errors", async () => {
    (cacheAdapter.get as jest.Mock).mockResolvedValue(null);
    const fetchFn = jest.fn().mockRejectedValue(new Error("DB connection failed"));

    await expect(getCachedOrFetch("error:key", fetchFn, 5000)).rejects.toThrow("DB connection failed");
  });

  it("handles complex nested data structures", async () => {
    (cacheAdapter.get as jest.Mock).mockResolvedValue(null);
    const complex = { nested: { array: [1, { a: true }], null: null } };
    const fetchFn = jest.fn().mockResolvedValue(complex);

    const result = await getCachedOrFetch("complex:key", fetchFn, 5000);
    expect(result).toEqual(complex);
    expect(cacheAdapter.set).toHaveBeenCalledWith("complex:key", complex, 5000);
  });
});

describe("invalidateCacheByPrefix", () => {
  it("calls del with the given prefix", async () => {
    (cacheAdapter.del as jest.Mock).mockResolvedValue(undefined);

    await invalidateCacheByPrefix("dashboard:decision:org-abc");

    expect(cacheAdapter.del).toHaveBeenCalledTimes(1);
    expect(cacheAdapter.del).toHaveBeenCalledWith("dashboard:decision:org-abc");
  });

  it("accepts arbitrary prefix strings", async () => {
    (cacheAdapter.del as jest.Mock).mockResolvedValue(undefined);

    await invalidateCacheByPrefix("custom:prefix:*");
    expect(cacheAdapter.del).toHaveBeenCalledWith("custom:prefix:*");
  });

  it("propagates errors from cacheAdapter.del when mock rejects", async () => {
    (cacheAdapter.del as jest.Mock).mockRejectedValue(new Error("Redis connection lost"));

    // The real cacheAdapter.del in redis-cache-adapter.ts catches errors internally.
    // However, since the adapter is mocked in tests, the mock rejection propagates
    // as invalidateCacheByPrefix does not have its own try/catch.
    await expect(invalidateCacheByPrefix("failing:key")).rejects.toThrow("Redis connection lost");
  });
});

describe("invalidateDashboardCaches", () => {
  it("clears all three dashboard cache prefixes for org", async () => {
    (cacheAdapter.del as jest.Mock).mockResolvedValue(undefined);

    await invalidateDashboardCaches("org-abc");

    expect(cacheAdapter.del).toHaveBeenCalledTimes(3);
    expect(cacheAdapter.del).toHaveBeenCalledWith("dashboard:decision:org-abc");
    expect(cacheAdapter.del).toHaveBeenCalledWith("dashboard:platform:org-abc");
    expect(cacheAdapter.del).toHaveBeenCalledWith("dashboard:governance:org-abc");
  });
});

describe("invalidateProductCache", () => {
  it("calls del with the correct key", async () => {
    (cacheAdapter.del as jest.Mock).mockResolvedValue(undefined);

    await invalidateProductCache("audit", "engagement", "eng-123");

    expect(cacheAdapter.del).toHaveBeenCalledTimes(1);
    expect(cacheAdapter.del).toHaveBeenCalledWith("audit:engagement:eng-123");
  });
});

describe("warmDashboardCaches", () => {
  it("returns skipped when Redis is not available", async () => {
    (isRedisAvailable as jest.Mock).mockResolvedValue(false);

    const result = await warmDashboardCaches("org-skipped");

    expect(result).toEqual([
      {
        key: "dashboard:*",
        status: "skipped",
        error: "Redis not available — skipping cache warming",
      },
    ]);
    expect(cacheAdapter.set).not.toHaveBeenCalled();
  });

  it("warms all three dashboard caches when Redis is available", async () => {
    (isRedisAvailable as jest.Mock).mockResolvedValue(true);
    (cacheAdapter.set as jest.Mock).mockResolvedValue(undefined);

    const result = await warmDashboardCaches("org-123");

    // Expect exactly 3 warmed results
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.status)).toEqual(["warmed", "warmed", "warmed"]);
    expect(result.map((r) => r.key)).toEqual([
      "dashboard:decision:org-123:metrics",
      "dashboard:platform:org-123:health",
      "dashboard:governance:org-123:items",
    ]);

    // Verify cache was set 3 times with dashboard TTL
    expect(cacheAdapter.set).toHaveBeenCalledTimes(3);
    expect(cacheAdapter.set).toHaveBeenCalledWith(
      "dashboard:decision:org-123:metrics",
      expect.any(Object),
      DASHBOARD_CACHE_TTL_MS,
    );
    expect(cacheAdapter.set).toHaveBeenCalledWith(
      "dashboard:platform:org-123:health",
      expect.any(Object),
      DASHBOARD_CACHE_TTL_MS,
    );
    expect(cacheAdapter.set).toHaveBeenCalledWith(
      "dashboard:governance:org-123:items",
      expect.any(Object),
      DASHBOARD_CACHE_TTL_MS,
    );
  });

  it("collects partial failures without stopping other warmers", async () => {
    (isRedisAvailable as jest.Mock).mockResolvedValue(true);

    // Make the decision warmer fail; use mockImplementation to isolate scope
    const prismaMock = jest.requireMock("@/lib/prisma");
    prismaMock.prisma.decision.findMany.mockRejectedValue(new Error("Decision DB timeout"));

    const result = await warmDashboardCaches("org-fail");

    // First warmer should be "failed", the other two "warmed"
    expect(result).toHaveLength(3);
    expect(result[0].status).toBe("failed");
    expect(result[0].key).toBe("dashboard:decision:org-fail:metrics");
    expect(result[0].error).toBe("Decision DB timeout");
    expect(result[1].status).toBe("warmed");
    expect(result[2].status).toBe("warmed");
  });

  it("stores computed metrics with correct structure", async () => {
    (isRedisAvailable as jest.Mock).mockResolvedValue(true);
    (cacheAdapter.set as jest.Mock).mockResolvedValue(undefined);

    const result = await warmDashboardCaches("org-struct");

    // Verify decision metrics structure
    const decisionSetCall = (cacheAdapter.set as jest.Mock).mock.calls.find(
      (c: unknown[]) => (c[0] as string).startsWith("dashboard:decision:"),
    );
    expect(decisionSetCall).toBeDefined();
    const decisionValue = decisionSetCall[1];
    expect(decisionValue).toHaveProperty("totalDecisions");
    expect(decisionValue).toHaveProperty("approvedCount");
    expect(decisionValue).toHaveProperty("byStatus");
    expect(decisionValue).toHaveProperty("governanceMetrics");

    // Verify platform health structure
    const healthSetCall = (cacheAdapter.set as jest.Mock).mock.calls.find(
      (c: unknown[]) => (c[0] as string).startsWith("dashboard:platform:"),
    );
    expect(healthSetCall).toBeDefined();
    const healthValue = healthSetCall[1];
    expect(healthValue).toHaveProperty("healthScore");
    expect(healthValue).toHaveProperty("aiRunsToday");
    expect(healthValue).toHaveProperty("status");

    // Verify governance items structure
    const govSetCall = (cacheAdapter.set as jest.Mock).mock.calls.find(
      (c: unknown[]) => (c[0] as string).startsWith("dashboard:governance:"),
    );
    expect(govSetCall).toBeDefined();
    const govValue = govSetCall[1];
    expect(govValue).toHaveProperty("items");
    expect(govValue).toHaveProperty("stats");
    expect(govValue.stats).toHaveProperty("totalPending");

    // All three warmers returned warmed
    expect(result.map((r) => r.status)).toEqual(["warmed", "warmed", "warmed"]);
  });
});

describe("cache TTL constants", () => {
  it("DASHBOARD_CACHE_TTL_MS is 5 minutes", () => {
    expect(DASHBOARD_CACHE_TTL_MS).toBe(5 * 60 * 1000);
  });

  it("ENTITY_CACHE_TTL_MS is 2 minutes", () => {
    expect(ENTITY_CACHE_TTL_MS).toBe(2 * 60 * 1000);
  });
});
