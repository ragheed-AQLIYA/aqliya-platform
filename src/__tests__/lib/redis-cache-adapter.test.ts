// ─── Redis Cache Adapter Tests ───
// Tests for redis-cache-adapter.ts (CACHE_PREFIX, SCAN+DEL flush, TLS detection, CRUD)
import { describe, expect, it, jest, beforeEach, afterEach } from "@jest/globals";

// ─── Mock ioredis ───

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockRedisInstance: Record<string, any> = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  scan: jest.fn(),
  on: jest.fn(),
  connect: jest.fn(),
  quit: jest.fn(),
  disconnect: jest.fn(),
  status: "ready",
};

jest.mock("ioredis", () => ({
  Redis: jest.fn(() => mockRedisInstance),
}));

// ─── Mock redis-client ───

jest.mock("@/lib/platform/redis-client", () => ({
  getRedisClient: jest.fn(() => mockRedisInstance),
  isRedisAvailable: jest.fn(),
}));

import { getRedisClient, isRedisAvailable } from "@/lib/platform/redis-client";
import { cacheAdapter, resetCacheBackend } from "@/lib/platform/redis-cache-adapter";

describe("Redis Cache Adapter", () => {
  const OLD_CACHE_PREFIX = process.env.CACHE_PREFIX;
  const OLD_REDIS_URL = process.env.REDIS_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    resetCacheBackend();
    process.env.CACHE_PREFIX = "aqliya:cache:";
    process.env.REDIS_URL = "redis://localhost:6379";
    jest.mocked(isRedisAvailable).mockResolvedValue(true);
    jest.mocked(mockRedisInstance.get).mockReset();
    jest.mocked(mockRedisInstance.set).mockReset();
    jest.mocked(mockRedisInstance.del).mockReset();
    jest.mocked(mockRedisInstance.scan).mockReset();
  });

  afterEach(() => {
    process.env.CACHE_PREFIX = OLD_CACHE_PREFIX;
    process.env.REDIS_URL = OLD_REDIS_URL;
    resetCacheBackend();
  });

  describe("CACHE_PREFIX Namespacing", () => {
    it("get() prepends CACHE_PREFIX to keys", async () => {
      jest.mocked(mockRedisInstance.get).mockResolvedValue('"value"');
      await cacheAdapter.get("my-key");
      expect(mockRedisInstance.get).toHaveBeenCalledWith("aqliya:cache:my-key");
    });
    it("set() stores keys with CACHE_PREFIX", async () => {
      await cacheAdapter.set("my-key", { data: 123 });
      expect(mockRedisInstance.set).toHaveBeenCalledWith("aqliya:cache:my-key", JSON.stringify({ data: 123 }));
    });
    it("del() removes keys with CACHE_PREFIX", async () => {
      await cacheAdapter.del("my-key");
      expect(mockRedisInstance.del).toHaveBeenCalledWith("aqliya:cache:my-key");
    });
  });

  describe("SCAN+DEL Flush Pattern", () => {
    it("clear() does NOT call flushdb", async () => {
      jest.mocked(mockRedisInstance.scan).mockResolvedValue(["0", []]);
      await cacheAdapter.clear();
      expect(mockRedisInstance.scan).toHaveBeenCalled();
    });
    it("clear() uses SCAN with prefix pattern", async () => {
      jest.mocked(mockRedisInstance.scan).mockResolvedValue(["0", ["key1", "key2"]]);
      await cacheAdapter.clear();
      expect(mockRedisInstance.scan).toHaveBeenCalledWith("0", "MATCH", "aqliya:cache:*", "COUNT", 100);
    });
    it("clear() deletes only prefix-matching keys", async () => {
      jest.mocked(mockRedisInstance.scan).mockResolvedValue(["0", ["aqliya:cache:k1", "aqliya:cache:k2"]]);
      await cacheAdapter.clear();
      expect(mockRedisInstance.del).toHaveBeenCalledWith("aqliya:cache:k1", "aqliya:cache:k2");
    });
    it("SCAN across multiple cursor iterations", async () => {
      jest.mocked(mockRedisInstance.scan)
        .mockResolvedValueOnce(["5", ["aqliya:cache:k1"]])
        .mockResolvedValueOnce(["0", ["aqliya:cache:k2"]]);
      await cacheAdapter.clear();
      expect(mockRedisInstance.scan).toHaveBeenCalledTimes(2);
      expect(mockRedisInstance.del).toHaveBeenCalledWith("aqliya:cache:k1");
      expect(mockRedisInstance.del).toHaveBeenCalledWith("aqliya:cache:k2");
    });
  });

  describe("TLS Auto-Detect", () => {
    it("redis:// URL does NOT enable TLS", () => {
      process.env.REDIS_URL = "redis://localhost:6379";
      const { Redis } = require("ioredis");
      jest.mocked(Redis).mockClear();
      const client = getRedisClient();
      const redisCalls = jest.mocked(Redis).mock.calls;
      if (redisCalls.length > 0) {
        const lastCall = redisCalls[redisCalls.length - 1];
        expect(lastCall[1]).toBeDefined();
        expect(lastCall[1].tls).toBeUndefined();
      }
    });
    it("rediss:// URL enables TLS", () => {
      process.env.REDIS_URL = "rediss://localhost:6380";
      const { Redis } = require("ioredis");
      jest.mocked(Redis).mockClear();
      const client = getRedisClient();
      const redisCalls = jest.mocked(Redis).mock.calls;
      if (redisCalls.length > 0) {
        const lastCall = redisCalls[redisCalls.length - 1];
        expect(lastCall[1]).toBeDefined();
        expect(lastCall[1].tls).toBeDefined();
        expect(typeof lastCall[1].tls).toBe("object");
      }
    });
  });

  describe("Password Auth", () => {
    it("ioredis parses auth from redis:// URL", () => {
      process.env.REDIS_URL = "redis://:secret@host:6379";
      const { Redis } = require("ioredis");
      jest.mocked(Redis).mockClear();
      const client = getRedisClient();
      const redisCalls = jest.mocked(Redis).mock.calls;
      if (redisCalls.length > 0) {
        expect(redisCalls[0][0]).toBe("redis://:secret@host:6379");
        expect(redisCalls[0][1]).toMatchObject({ lazyConnect: true });
      }
    });
  });

  describe("Basic CRUD Operations", () => {
    it("set + get roundtrip", async () => {
      jest.mocked(mockRedisInstance.get).mockResolvedValue('"stored-value"');
      await cacheAdapter.set("k", "stored-value");
      const result = await cacheAdapter.get("k");
      expect(result).toBe("stored-value");
    });
    it("get returns null for missing keys", async () => {
      jest.mocked(mockRedisInstance.get).mockResolvedValue(null);
      const result = await cacheAdapter.get("nonexistent");
      expect(result).toBeNull();
    });
    it("del removes specific key", async () => {
      await cacheAdapter.del("remove-key");
      expect(mockRedisInstance.del).toHaveBeenCalledWith("aqliya:cache:remove-key");
    });
    it("TTL is passed correctly", async () => {
      await cacheAdapter.set("ttl-key", "data", 5000);
      expect(mockRedisInstance.set).toHaveBeenCalledWith(
        "aqliya:cache:ttl-key",
        JSON.stringify("data"),
        "PX",
        5000,
      );
    });
    it("set without TTL omits PX argument", async () => {
      await cacheAdapter.set("no-ttl", "data");
      expect(mockRedisInstance.set).toHaveBeenCalledWith("aqliya:cache:no-ttl", JSON.stringify("data"));
    });
  });
});
