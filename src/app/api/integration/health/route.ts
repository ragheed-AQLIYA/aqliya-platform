import { NextResponse } from "next/server"
import { getHealthRuntime } from "@/lib/integration/health-runtime"
import { getCircuitSnapshot } from "@/lib/integration/failover-engine"
import { getAllCounters } from "@/lib/integration/metrics"

/**
 * GET /api/integration/health
 *
 * Returns:
 * - Aggregated integration health (from health runtime tick)
 * - Circuit breaker states (from failover engine)
 * - Metric counters (from integration metrics)
 *
 * Used by: dashboard, monitoring, load balancer readiness
 */
export async function GET() {
  try {
    // Run a health tick to get current state
    const snapshot = await getHealthRuntime().tick()

    // Get circuit breaker states
    const circuits = getCircuitSnapshot()

    // Get metric counters
    const counters = getAllCounters().map((c) => ({
      name: c.name,
      value: c.value,
      labels: c.labels,
      updatedAt: c.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      status: snapshot.unhealthy === 0 ? "ok" : "degraded",
      aggregated: {
        total: snapshot.totalIntegrations,
        healthy: snapshot.healthy,
        degraded: snapshot.degraded,
        unhealthy: snapshot.unhealthy,
        lastTickAt: snapshot.lastTickAt?.toISOString() ?? null,
      },
      circuits: circuits.map((c) => ({
        ...c,
        openedAt: c.openedAt ? new Date(c.openedAt).toISOString() : null,
      })),
      counters,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Integration health check failed",
        generatedAt: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
