let mockCacheAdapter: { get: jest.Mock; set: jest.Mock; del: jest.Mock; clear: jest.Mock }

jest.mock("../redis-cache-adapter", () => {
  mockCacheAdapter = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    clear: jest.fn(),
  }
  return { cacheAdapter: mockCacheAdapter }
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe("getCacheKey", () => {
  it("formats key as product:entity:id", () => {
    const { getCacheKey } = require("../cache-strategy")
    expect(getCacheKey("audit", "engagement", "123")).toBe("audit:engagement:123")
  })

  it("handles special characters", () => {
    const { getCacheKey } = require("../cache-strategy")
    expect(getCacheKey("ai", "model", "gpt-4")).toBe("ai:model:gpt-4")
  })
})

describe("getCachedOrFetch", () => {
  it("returns cached value when available", async () => {
    mockCacheAdapter.get.mockResolvedValue("cached-value")
    const fetchFn = jest.fn()
    const { getCachedOrFetch } = require("../cache-strategy")

    const result = await getCachedOrFetch("key", fetchFn, 5000)

    expect(result).toBe("cached-value")
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it("calls fetchFn and caches result when cache misses", async () => {
    mockCacheAdapter.get.mockResolvedValue(null)
    const fetchFn = jest.fn().mockResolvedValue("fresh-value")
    const { getCachedOrFetch } = require("../cache-strategy")

    const result = await getCachedOrFetch("key", fetchFn, 5000)

    expect(result).toBe("fresh-value")
    expect(fetchFn).toHaveBeenCalled()
    expect(mockCacheAdapter.set).toHaveBeenCalledWith("key", "fresh-value", 5000)
  })
})

describe("invalidateProductCache", () => {
  it("deletes the correct cache key", async () => {
    const { invalidateProductCache } = require("../cache-strategy")
    await invalidateProductCache("sales", "account", "456")
    expect(mockCacheAdapter.del).toHaveBeenCalledWith("sales:account:456")
  })
})
