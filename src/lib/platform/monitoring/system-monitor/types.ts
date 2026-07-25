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
