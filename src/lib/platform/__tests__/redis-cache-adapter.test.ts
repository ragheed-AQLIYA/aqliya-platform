let mockRedisAvailable = true

const mockRedisClient = {
  status: "ready" as const,
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  flushdb: jest.fn(),
  connect: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  quit: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn(),
}

jest.mock("../redis-client", () => ({
  getRedisClient: jest.fn().mockReturnValue(mockRedisClient),
  isRedisAvailable: jest.fn().mockImplementation(async () => mockRedisAvailable),
}))

beforeEach(() => {
  mockRedisAvailable = true
  jest.clearAllMocks()
  const { resetCacheBackend } = require("../redis-cache-adapter")
  resetCacheBackend()
})

afterAll(() => {
  jest.restoreAllMocks()
})

describe("CacheAdapter (Redis mode)", () => {
  it("get returns null for missing key", async () => {
    mockRedisClient.get.mockResolvedValue(null)
    const { cacheAdapter } = await import("../redis-cache-adapter")
    const result = await cacheAdapter.get("missing")
    expect(result).toBeNull()
  })

  it("set and get roundtrip", async () => {
    mockRedisClient.get.mockResolvedValue(JSON.stringify({ name: "test", value: 42 }))
    const { cacheAdapter } = await import("../redis-cache-adapter")
    await cacheAdapter.set("obj", { name: "test", value: 42 })
    const result = await cacheAdapter.get<{ name: string; value: number }>("obj")
    expect(result).toEqual({ name: "test", value: 42 })
  })

  it("set with TTL passes PX to Redis", async () => {
    const { cacheAdapter } = await import("../redis-cache-adapter")
    await cacheAdapter.set("ttl-key", "value", 5000)
    expect(mockRedisClient.set).toHaveBeenCalledWith("ttl-key", expect.any(String), "PX", 5000)
  })

  it("del removes key", async () => {
    mockRedisClient.del.mockResolvedValue(1)
    const { cacheAdapter } = await import("../redis-cache-adapter")
    await cacheAdapter.del("some-key")
    expect(mockRedisClient.del).toHaveBeenCalledWith("some-key")
  })

  it("clear flushes Redis db", async () => {
    mockRedisClient.flushdb.mockResolvedValue("OK")
    const { cacheAdapter } = await import("../redis-cache-adapter")
    await cacheAdapter.clear()
    expect(mockRedisClient.flushdb).toHaveBeenCalled()
  })
})

describe("CacheAdapter (in-memory fallback)", () => {
  it("stores and retrieves values in memory when Redis unavailable", async () => {
    mockRedisAvailable = false
    const { cacheAdapter, resetCacheBackend } = await import("../redis-cache-adapter")
    resetCacheBackend()

    await cacheAdapter.set("mem-key", { hello: "world" })
    const result = await cacheAdapter.get<{ hello: string }>("mem-key")
    expect(result).toEqual({ hello: "world" })
  })

  it("returns null for expired entries", async () => {
    mockRedisAvailable = false
    const { cacheAdapter, resetCacheBackend } = await import("../redis-cache-adapter")
    resetCacheBackend()

    await cacheAdapter.set("exp-key", "val", -1)
    const result = await cacheAdapter.get("exp-key")
    expect(result).toBeNull()
  })

  it("del works on memory store", async () => {
    mockRedisAvailable = false
    const { cacheAdapter, resetCacheBackend } = await import("../redis-cache-adapter")
    resetCacheBackend()

    await cacheAdapter.set("del-me", "present")
    await cacheAdapter.del("del-me")
    const result = await cacheAdapter.get("del-me")
    expect(result).toBeNull()
  })

  it("clear empties memory store", async () => {
    mockRedisAvailable = false
    const { cacheAdapter, resetCacheBackend } = await import("../redis-cache-adapter")
    resetCacheBackend()

    await cacheAdapter.set("a", 1)
    await cacheAdapter.set("b", 2)
    await cacheAdapter.clear()
    expect(await cacheAdapter.get("a")).toBeNull()
    expect(await cacheAdapter.get("b")).toBeNull()
  })
})
