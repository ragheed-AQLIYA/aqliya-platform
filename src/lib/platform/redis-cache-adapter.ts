import "server-only"
import { getRedisClient, isRedisAvailable } from "./redis-client"

export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>
  del(key: string): Promise<void>
  clear(): Promise<void>
}

const inMemoryStore = new Map<string, { value: unknown; expiresAt: number }>()
let useRedis: boolean | null = null

async function resolveBackend(): Promise<boolean> {
  if (useRedis !== null) return useRedis
  useRedis = await isRedisAvailable()
  return useRedis
}

export function resetCacheBackend(): void {
  useRedis = null
}

export const cacheAdapter: CacheAdapter = {
  async get<T>(key: string): Promise<T | null> {
    if (await resolveBackend()) {
      try {
        const client = getRedisClient()
        const raw = await client.get(key)
        if (raw === null) return null
        return JSON.parse(raw) as T
      } catch {
        useRedis = false
      }
    }

    const entry = inMemoryStore.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      inMemoryStore.delete(key)
      return null
    }
    return entry.value as T
  },

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    if (await resolveBackend()) {
      try {
        const client = getRedisClient()
        const serialized = JSON.stringify(value)
        if (ttlMs !== undefined) {
          await client.set(key, serialized, "PX", ttlMs)
        } else {
          await client.set(key, serialized)
        }
        return
      } catch {
        useRedis = false
      }
    }

    inMemoryStore.set(key, {
      value,
      expiresAt: ttlMs !== undefined ? Date.now() + ttlMs : Infinity,
    })
  },

  async del(key: string): Promise<void> {
    if (await resolveBackend()) {
      try {
        const client = getRedisClient()
        await client.del(key)
      } catch {
        useRedis = false
      }
    }
    inMemoryStore.delete(key)
  },

  async clear(): Promise<void> {
    if (await resolveBackend()) {
      try {
        const client = getRedisClient()
        await client.flushdb()
      } catch {
        useRedis = false
      }
    }
    inMemoryStore.clear()
  },
}
