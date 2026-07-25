import "server-only"
import { prisma } from "@/lib/prisma"
import { getRedisClient, ensureRedisConnected } from "@/lib/platform/redis-client"
import { getQueue } from "@/lib/platform/operations/queue-runtime"
import { isEnabled } from "@/lib/platform/feature-flags/registry"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { START_TIME } from "./common"
import type { HealthComponent, HealthCheckResult } from "./types"

/**
 * SAFE: Uses Prisma tagged template literal ($queryRaw) — parameterized, no concatenation.
 * No SQL injection risk with this pattern.
 */
export async function checkDatabaseHealth(): Promise<{ status: "ok" | "error"; message?: string; latencyMs?: number }> {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: "ok", latencyMs: Date.now() - start }
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Database unreachable", latencyMs: Date.now() - start }
  }
}

export async function checkRedisHealth(): Promise<{ status: "ok" | "warn" | "error"; message?: string; latencyMs?: number }> {
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) return { status: "warn", message: "REDIS_URL not configured" }

  const start = Date.now()
  try {
    const ok = await ensureRedisConnected()
    if (!ok) return { status: "error", message: "Redis connection failed", latencyMs: Date.now() - start }
    const client = getRedisClient()
    await client.ping()
    return { status: "ok", latencyMs: Date.now() - start }
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Redis ping failed", latencyMs: Date.now() - start }
  }
}

export async function checkQueueHealth(): Promise<{ status: "ok" | "warn" | "error"; message?: string; latencyMs?: number }> {
  if (!isEnabled("queue.enabled")) return { status: "warn", message: "Queue disabled (FF_QUEUE_ENABLED)" }

  const start = Date.now()
  try {
    const queue = getQueue()
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount().catch(() => -1),
      queue.getActiveCount().catch(() => -1),
      queue.getCompletedCount().catch(() => -1),
      queue.getFailedCount().catch(() => -1),
      queue.getDelayedCount().catch(() => -1),
    ])
    if (waiting === -1) return { status: "error", message: "Queue unreachable", latencyMs: Date.now() - start }
    return { status: "ok", latencyMs: Date.now() - start }
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Queue check failed", latencyMs: Date.now() - start }
  }
}

export async function checkEnvironmentHealth(): Promise<{ status: "ok" | "warn"; message?: string }> {
  const required = ["DATABASE_URL", "AUTH_SECRET"]
  const missing = required.filter(v => !process.env[v])
  if (missing.length > 0) return { status: "warn", message: `Missing: ${missing.join(", ")}` }
  return { status: "ok" }
}

export async function getHealthCheck(components?: HealthComponent[]): Promise<HealthCheckResult> {
  const all: HealthComponent[] = components ?? ["server", "env", "storage", "ai", "database", "redis", "queue"]
  const checks: HealthCheckResult["checks"] = {}

  for (const component of all) {
    switch (component) {
      case "server":
        checks.server = { status: "ok", message: `uptime ${Math.floor((Date.now() - START_TIME) / 1000)}s` }
        break
      case "env":
        checks.env = await checkEnvironmentHealth()
        break
      case "database":
        checks.database = await checkDatabaseHealth()
        break
      case "redis":
        checks.redis = await checkRedisHealth()
        break
      case "queue":
        checks.queue = await checkQueueHealth()
        break
      case "storage":
        checks.storage = { status: "ok", message: process.env.STORAGE_PROVIDER || "local" }
        break
      case "ai": {
        const aiProvider = process.env.AI_PROVIDER || "deterministic"
        if (aiProvider === "openai" && !process.env.OPENAI_API_KEY) {
          checks.ai = { status: "warn", message: "AI_PROVIDER=openai but OPENAI_API_KEY not set" }
        } else if (aiProvider === "anthropic" && !process.env.ANTHROPIC_API_KEY) {
          checks.ai = { status: "warn", message: "AI_PROVIDER=anthropic but ANTHROPIC_API_KEY not set" }
        } else {
          checks.ai = { status: "ok", message: aiProvider }
        }
        break
      }
      case "filesystem":
        checks.filesystem = { status: "ok" }
        break
    }
  }

  const statuses = Object.values(checks).map(c => c.status)
  const overall: HealthCheckResult["status"] = statuses.some(s => s === "error")
    ? "unhealthy"
    : statuses.some(s => s === "warn") ? "degraded" : "healthy"

  if (overall === "unhealthy") {
    const errors = Object.entries(checks).filter(([, c]) => c.status === "error")
    await writePlatformAuditLog({
      productKey: "platform",
      action: "health_check_failure",
      severity: "error",
      status: "failure",
      metadata: { errors: errors.map(([k, v]) => ({ component: k, message: v.message })) },
    }).catch(() => {})
  }

  return {
    status: overall,
    checks,
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
  }
}