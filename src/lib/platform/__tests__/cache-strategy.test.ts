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

import {
  getCacheKey,
  getCachedOrFetch,
  invalidateDashboardCaches,
  invalidateProductCache,
  DASHBOARD_CACHE_TTL_MS,
  ENTITY_CACHE_TTL_MS,
} from "@/lib/platform/cache-strategy";
import { cacheAdapter } from "@/lib/platform/redis-cache-adapter";

beforeEach(() => {
  jest.clearAllMocks();
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

describe("cache TTL constants", () => {
  it("DASHBOARD_CACHE_TTL_MS is 5 minutes", () => {
    expect(DASHBOARD_CACHE_TTL_MS).toBe(5 * 60 * 1000);
  });

  it("ENTITY_CACHE_TTL_MS is 2 minutes", () => {
    expect(ENTITY_CACHE_TTL_MS).toBe(2 * 60 * 1000);
  });
});
