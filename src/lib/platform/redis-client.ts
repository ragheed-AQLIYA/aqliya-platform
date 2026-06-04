import "server-only"

import { Redis } from "ioredis"

const globalForRedis = globalThis as unknown as { redisClient?: Redis }

function getRedisUrl(): string {
  return process.env.REDIS_URL || "redis://localhost:6379"
}

export function getRedisClient(): Redis {
  if (globalForRedis.redisClient) return globalForRedis.redisClient

  const url = getRedisUrl()
  const client = new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy(times) {
      if (times > 10) return null
      return Math.min(times * 100, 3000)
    },
    lazyConnect: true,
  })

  client.on("error", (err) => {
    console.error("[redis] connection error:", err.message)
  })

  globalForRedis.redisClient = client
  return client
}

export async function ensureRedisConnected(): Promise<boolean> {
  const client = getRedisClient()
  try {
    if (client.status === "ready") return true
    if (client.status === "connecting" || client.status === "connect") {
      await new Promise<void>((resolve) => client.once("ready", () => resolve()))
      return true
    }
    await client.connect()
    return true
  } catch {
    return false
  }
}
