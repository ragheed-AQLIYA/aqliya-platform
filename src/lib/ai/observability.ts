import "server-only"
import { prisma } from "@/lib/prisma"
import { getAISpendSummary } from "@/lib/ai/spend-tracker"
import { getAIGovernanceMetrics } from "@/lib/ai/governance-metrics"
import { getCircuitBreakerSnapshot } from "@/lib/ai/providers/provider-circuit-breaker"
import { aiOrchestrator } from "@/lib/ai/orchestrator"
import { getAllCounters, type MetricCounter } from "@/lib/integration/metrics"
import type { AIProviderStatus } from "./types"

export interface AIObservabilityData {
  summary: {
    totalRequests: number
    totalCost: number
    reviewRate: number
    averageConfidence: number
    currency: string
    period: { from: string; to: string }
  }
  byProduct: Record<string, {
    requests: number
    cost: number
    reviewed: number
    reviewedPercent: number
    errors: number
  }>
  byProvider: Record<string, {
    requests: number
    cost: number
    latency: number
    errorRate: number
    fallbackCount: number
  }>
  latencyDistribution: {
    p50: number
    p95: number
    p99: number
  }
  spendTrend: { date: string; requests: number; cost: number }[]
  governanceTrend: { date: string; requests: number; reviewed: number; autoAccepted: number }[]
  errors: { date: string; count: number }[]
  topOrgs: { organizationId: string; requests: number; cost: number }[]
}

export async function getAIObservability(days = 30): Promise<AIObservabilityData> {
  const from = new Date(Date.now() - days * 86400000)
  const to = new Date()

  const logs = await prisma.platformAuditLog.findMany({
    where: {
      action: "ai_generation",
      createdAt: { gte: from, lte: to },
    },
    orderBy: { createdAt: "desc" },
    take: 10000,
  })

  const totalRequests = logs.length

  const byProduct: Record<string, { requests: number; cost: number; reviewed: number; reviewedPercent: number; errors: number }> = {}
  const productCostMap = new Map<string, number>()

  for (const l of logs) {
    const pk = l.productKey ?? "unknown"
    if (!byProduct[pk]) byProduct[pk] = { requests: 0, cost: 0, reviewed: 0, reviewedPercent: 0, errors: 0 }
    byProduct[pk].requests++
    if (l.aiOutputReviewStatus === "pending" || l.status === "pending_review") byProduct[pk].reviewed++
    if (l.status === "error" || l.status === "failed") byProduct[pk].errors++
    const m = l.metadata as Record<string, unknown> | null
    if (m?.totalCost && typeof m.totalCost === "number") {
      byProduct[pk].cost += m.totalCost
    }
  }
  for (const pk of Object.keys(byProduct)) {
    byProduct[pk].reviewedPercent = byProduct[pk].requests > 0
      ? Math.round((byProduct[pk].reviewed / byProduct[pk].requests) * 100)
      : 0
    byProduct[pk].cost = Math.round(byProduct[pk].cost * 10000) / 10000
  }

  const providerMap = new Map<string, { requests: number; cost: number; latencies: number[]; errors: number; fallbacks: number }>()
  for (const l of logs) {
    const p = l.aiProvider ?? "unknown"
    if (!providerMap.has(p)) providerMap.set(p, { requests: 0, cost: 0, latencies: [], errors: 0, fallbacks: 0 })
    const entry = providerMap.get(p)!
    entry.requests++
    const m = l.metadata as Record<string, unknown> | null
    if (m?.latencyMs && typeof m.latencyMs === "number") entry.latencies.push(m.latencyMs)
    if (m?.totalCost && typeof m.totalCost === "number") entry.cost += m.totalCost
    if (l.status === "error" || l.status === "failed") entry.errors++
    if (m?.fallbackUsed === true) entry.fallbacks++
  }

  const byProvider: Record<string, { requests: number; cost: number; latency: number; errorRate: number; fallbackCount: number }> = {}
  for (const [provider, data] of providerMap) {
    const latencies = data.latencies.sort((a, b) => a - b)
    byProvider[provider] = {
      requests: data.requests,
      cost: Math.round(data.cost * 10000) / 10000,
      latency: latencies.length > 0 ? Math.round(latencies.reduce((s, v) => s + v, 0) / latencies.length) : 0,
      errorRate: data.requests > 0 ? Math.round((data.errors / data.requests) * 10000) / 100 : 0,
      fallbackCount: data.fallbacks,
    }
  }

  const allLatencies: number[] = []
  for (const [, data] of providerMap) {
    allLatencies.push(...data.latencies)
  }
  allLatencies.sort((a, b) => a - b)
  const latencyDistribution = {
    p50: allLatencies.length > 0 ? allLatencies[Math.floor(allLatencies.length * 0.5)] : 0,
    p95: allLatencies.length > 0 ? allLatencies[Math.floor(allLatencies.length * 0.95)] : 0,
    p99: allLatencies.length > 0 ? allLatencies[Math.floor(allLatencies.length * 0.99)] : 0,
  }

  const dayMap = new Map<string, { requests: number; cost: number }>()
  const govDayMap = new Map<string, { requests: number; reviewed: number; autoAccepted: number }>()
  const errorDayMap = new Map<string, { count: number }>()

  for (const l of logs) {
    const day = l.createdAt.toISOString().slice(0, 10)

    const d = dayMap.get(day) ?? { requests: 0, cost: 0 }
    d.requests++
    const m = l.metadata as Record<string, unknown> | null
    if (m?.totalCost && typeof m.totalCost === "number") d.cost += m.totalCost
    dayMap.set(day, d)

    const gd = govDayMap.get(day) ?? { requests: 0, reviewed: 0, autoAccepted: 0 }
    gd.requests++
    if (l.aiOutputReviewStatus === "pending" || l.status === "pending_review") gd.reviewed++
    if (l.aiOutputReviewStatus === "auto_accepted" || l.status === "recorded") gd.autoAccepted++
    govDayMap.set(day, gd)

    if (l.status === "error" || l.status === "failed") {
      const ed = errorDayMap.get(day) ?? { count: 0 }
      ed.count++
      errorDayMap.set(day, ed)
    }
  }

  const spendTrend = Array.from(dayMap.entries())
    .map(([date, d]) => ({ date, requests: d.requests, cost: Math.round(d.cost * 10000) / 10000 }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const governanceTrend = Array.from(govDayMap.entries())
    .map(([date, d]) => ({ date, ...d }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const errors = Array.from(errorDayMap.entries())
    .map(([date, d]) => ({ date, count: d.count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const totalCost = Math.round(logs.reduce((s, l) => {
    const m = l.metadata as Record<string, unknown> | null
    return s + (m?.totalCost && typeof m.totalCost === "number" ? m.totalCost : 0)
  }, 0) * 10000) / 10000

  const reviewedCount = logs.filter(l => l.aiOutputReviewStatus === "pending" || l.status === "pending_review").length
  const confidences = logs.map(l => {
    const m = l.metadata as Record<string, unknown> | null
    return Number(m?.confidence ?? 0.85)
  }).filter(c => c > 0)
  const averageConfidence = confidences.length > 0
    ? Math.round((confidences.reduce((s, c) => s + c, 0) / confidences.length) * 100) / 100
    : 0

  const orgMap = new Map<string, { requests: number; cost: number }>()
  for (const l of logs) {
    const oid = l.platformOrganizationId ?? "__unknown__"
    const o = orgMap.get(oid) ?? { requests: 0, cost: 0 }
    o.requests++
    const m = l.metadata as Record<string, unknown> | null
    if (m?.totalCost && typeof m.totalCost === "number") o.cost += m.totalCost
    orgMap.set(oid, o)
  }
  const topOrgs = Array.from(orgMap.entries())
    .map(([organizationId, d]) => ({ organizationId, requests: d.requests, cost: Math.round(d.cost * 10000) / 10000 }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10)

  return {
    summary: {
      totalRequests,
      totalCost,
      reviewRate: totalRequests > 0 ? Math.round((reviewedCount / totalRequests) * 10000) / 100 : 0,
      averageConfidence,
      currency: logs.length > 0 ? "USD" : "USD",
      period: { from: from.toISOString(), to: to.toISOString() },
    },
    byProduct,
    byProvider,
    latencyDistribution,
    spendTrend,
    governanceTrend,
    errors,
    topOrgs,
  }
}

// ─── Realtime Observability (synchronous, data-source-agnostic) ───

export interface AIRealtimeObservability {
  circuitBreakers: Array<{
    providerId: string
    state: string
    consecutiveFailures: number
  }>
  providerStatus: Record<string, AIProviderStatus>
  metricCounters: MetricCounter[]
  defaultProvider: string
  overallHealth: {
    providersConfigured: number
    providersAvailable: number
    circuitsClosed: number
    circuitsOpen: number
    circuitsHalfOpen: number
  }
}

/**
 * Returns a realtime snapshot of AI system observability.
 * Synchronous — does not access the database. Uses in-memory circuit breaker,
 * orchestrator status, and metrics counters.
 */
export function getAIRealtimeObservability(): AIRealtimeObservability {
  const circuitBreakers = getCircuitBreakerSnapshot()
  const providerStatus = aiOrchestrator.getAllStatus()
  const metricCounters = getAllCounters()
  const defaultProvider = aiOrchestrator.getDefaultProviderId()

  const statusValues = Object.values(providerStatus)
  const providersConfigured = statusValues.filter((s) => s.configured).length
  const providersAvailable = statusValues.filter((s) => s.available).length
  const circuitsClosed = circuitBreakers.filter((c) => c.state === "closed").length
  const circuitsOpen = circuitBreakers.filter((c) => c.state === "open").length
  const circuitsHalfOpen = circuitBreakers.filter((c) => c.state === "half-open").length

  return {
    circuitBreakers,
    providerStatus,
    metricCounters,
    defaultProvider,
    overallHealth: {
      providersConfigured,
      providersAvailable,
      circuitsClosed,
      circuitsOpen,
      circuitsHalfOpen,
    },
  }
}
