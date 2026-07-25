/**
 * Cache utility for AQLIYA data layer.
 *
 * Usage:
 *   const data = await cachedFetch("engagements:list", async () => {
 *     return prisma.engagement.findMany({ ... })
 *   }, { ttl: 60_000 })
 *
 * Uses Redis-backed cache adapter when Redis is available.
 * Falls back to in-memory Map for local development or when Redis is down.
 * The Redis adapter handles namespace isolation and SCAN-based cleanup.
 */

import { cacheAdapter } from "./platform/redis-cache-adapter"

interface CacheOptions {
  ttl?: number // Time to live in milliseconds (default: 30s)
}

const DEFAULT_TTL = 30_000

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions,
): Promise<T> {
  const ttl = options?.ttl ?? DEFAULT_TTL

  const cached = await cacheAdapter.get<T>(key)
  if (cached !== null) {
    return cached
  }

  const value = await fetcher()
  await cacheAdapter.set(key, value, ttl)

  return value
}

export async function invalidateCache(key: string): Promise<void> {
  await cacheAdapter.del(key)
}

export async function clearCache(): Promise<void> {
  await cacheAdapter.clear()
}
