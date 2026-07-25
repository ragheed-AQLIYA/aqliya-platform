import "server-only"
import { createLogger } from "@/lib/observability/logger";

import { Redis } from "ioredis"


const logger = createLogger({ product: "platform", action: "lib-platform-redis-client" });

const globalForRedis = globalThis as unknown as { redisClient?: Redis }

function getRedisUrl(): string {
  return process.env.REDIS_URL || "redis://localhost:6379"
}

export function getRedisClient(): Redis {
  if (globalForRedis.redisClient) return globalForRedis.redisClient

  const url = getRedisUrl()
  const useTls = url.startsWith("rediss://")
  const client = new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    tls: useTls ? {} : undefined,
    retryStrategy(times) {
      if (times > 10) return null
      return Math.min(times * 100, 3000)
    },
    lazyConnect: true,
  })

  client.on("error", (err) => {
    logger.error("[redis] connection error:", err instanceof Error ? err : new Error(String(err)))
  })
  // Periodic reconnection probe for production resilience
  const RECONNECT_INTERVAL = 60000; // 60 seconds
  if (typeof setInterval !== "undefined") {
    // Only in Node.js runtime
    setInterval(() => {
      if (client.status === "end") {
        client.connect().catch(() => { /* logged by error handler */ })
      }
    }, RECONNECT_INTERVAL).unref() // Don't keep process alive
  }

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

export async function isRedisAvailable(): Promise<boolean> {
  try {
    return await ensureRedisConnected()
  } catch {
    return false
  }
}

export async function closeRedis(): Promise<void> {
  const client = globalForRedis.redisClient
  if (!client) return
  try {
    await client.quit()
  } catch {
    client.disconnect()
  }
  globalForRedis.redisClient = undefined
}
