import "server-only"
import os from "os"
import { prisma } from "@/lib/prisma"
import { getRedisClient, ensureRedisConnected } from "@/lib/platform/redis-client"
import { getQueue } from "@/lib/platform/operations/queue-runtime"
import { isEnabled } from "@/lib/platform/feature-flags/registry"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"

export type HealthComponent = "server" | "env" | "storage" | "ai" | "database" | "redis" | "queue" | "filesystem"

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy"
  checks: Record<string, { status: "ok" | "warn" | "error"; message?: string; latencyMs?: number }>
  timestamp: string
  version: string
}

export interface SystemMetrics {
  uptimeSeconds: number
  memory: { rssMb: number; heapTotalMb: number; heapUsedMb: number; externalMb: number }
  cpu: { loadAvg: number[] }
  activeHandles?: number
  activeRequests?: number
}

export interface QueueMetrics {
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
  jobsPerSecond?: number
}

export interface Alert {
  id: string
  component: HealthComponent
  severity: "info" | "warning" | "error" | "critical"
  message: string
  timestamp: string
  acknowledged: boolean
}

const START_TIME = Date.now()

export function getSystemMetrics(): SystemMetrics {
  const mem = process.memoryUsage()
  return {
    uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
    memory: {
      rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
      heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      externalMb: Math.round((mem.external / 1024 / 1024) * 100) / 100,
    },
    cpu: { loadAvg: os.loadavg() },
  }
}

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

export async function getQueueMetrics(): Promise<QueueMetrics> {
  const empty: QueueMetrics = { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }
  if (!isEnabled("queue.enabled")) return empty
  try {
    const queue = getQueue()
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ])
    return { waiting, active, completed, failed, delayed }
  } catch {
    return empty
  }
}

export async function getFailedJobs(limit = 20): Promise<{ id: string; type: string; failedReason: string; timestamp: string }[]> {
  if (!isEnabled("queue.enabled")) return []
  try {
    const queue = getQueue()
    const failed = await queue.getFailed(0, limit)
    return failed.map(j => ({
      id: String(j.id),
      type: String(j.data?.type ?? "unknown"),
      failedReason: String(j.failedReason ?? "unknown"),
      timestamp: j.finishedOn ? new Date(j.finishedOn).toISOString() : new Date().toISOString(),
    }))
  } catch {
    return []
  }
}

const alertHistory: Alert[] = []

export function getAlertHistory(limit = 50): Alert[] {
  return alertHistory.slice(-limit)
}

export function acknowledgeAlert(alertId: string): boolean {
  const alert = alertHistory.find(a => a.id === alertId)
  if (!alert) return false
  alert.acknowledged = true
  return true
}

export function createAlert(component: HealthComponent, severity: Alert["severity"], message: string): void {
  const alert: Alert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    component,
    severity,
    message,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  }
  alertHistory.push(alert)
  writePlatformAuditLog({
    productKey: "platform",
    action: `alert_${severity}`,
    severity,
    status: "pending",
    metadata: { alert },
  }).catch(() => {})

  if (alertHistory.length > 1000) {
    alertHistory.splice(0, alertHistory.length - 1000)
  }
}
