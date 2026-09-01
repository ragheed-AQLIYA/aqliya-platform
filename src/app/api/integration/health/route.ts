import { NextResponse } from "next/server"
import { getHealthRuntime } from "@/lib/integration/health-runtime"
import { getCircuitSnapshot } from "@/lib/integration/failover-engine"
import { getAllCounters } from "@/lib/integration/metrics"
import { getCurrentUser, hasRequiredRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error"
import { isPlatformAdmin } from "@/lib/authorization/platform-admin"

/**
 * GET /api/integration/health
 *
 * Returns:
 * - Aggregated integration health (from health runtime tick)
 * - Circuit breaker states (from failover engine)
 * - Metric counters (from integration metrics)
 * - lcos — LCOS subsystem health (DB, ERP connector, scoring engine)
 *
 * Used by: dashboard, monitoring, load balancer readiness
 */
export async function GET() {
  try {
      const user = await getCurrentUser();
      if (!hasRequiredRole(user, "ADMIN") && !isPlatformAdmin(user)) {
        throw new Error("Access denied: ADMIN role required");
      }
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

    const lcos = await runLcosHealthCheck(
      isPlatformAdmin(user) ? undefined : user.organizationId,
    )

    const overallStatus =
      lcos.status === "unhealthy"
        ? "degraded"
        : snapshot.unhealthy === 0
          ? "ok"
          : "degraded"

    return NextResponse.json({
      status: overallStatus,
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
      checks: { lcos },
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    const { message, code } = sanitizeError(error);
    return NextResponse.json(
      {
        status: "error",
        error: message,
        generatedAt: new Date().toISOString(),
      },
      { status: httpStatusFromCode(code) },
    )
  }
}

async function runLcosHealthCheck(organizationId?: string) {
  const db: { status: string; projectCount: number } = { status: "unknown", projectCount: 0 }
  let erpConnector: { status: string; message: string } = {
    status: "not_configured",
    message: "ERP_PROVIDER env var not set",
  }
  const scoringEngine: { status: string } = { status: "unknown" }
  let overall: "healthy" | "degraded" | "unhealthy" = "healthy"
  const orgFilter = organizationId ? { organizationId } : undefined

  try {
    const projectCount = await prisma.localContentProject.count({
      where: orgFilter,
    })
    db.status = "ok"
    db.projectCount = projectCount
  } catch {
    db.status = "error"
    overall = "unhealthy"
  }

  try {
    if (process.env.ERP_PROVIDER) {
      const erpCount = await prisma.erpConnection.count({
        where: orgFilter,
      })
      erpConnector = {
        status: erpCount > 0 ? "ok" : "degraded",
        message:
          erpCount > 0
            ? `${erpCount} connection(s) found`
            : "ERP_PROVIDER set but no connection records in DB",
      }
      if (erpCount === 0 && overall === "healthy") overall = "degraded"
    }
  } catch {
    erpConnector = { status: "error", message: "ERP check query failed" }
    if (overall === "healthy") overall = "degraded"
  }

  try {
    const { calculateSupplierScore } = await import("@/lib/local-content/scoring")
    calculateSupplierScore({
      supplierKey: "health-check",
      localityClassification: "local",
      localContentPercentage: 100,
      ownershipType: "Saudi",
      workforceLocalPct: 100,
    })
    scoringEngine.status = "ok"
  } catch {
    scoringEngine.status = "error"
    if (overall === "healthy") overall = "degraded"
  }

  return { status: overall, db, erpConnector, scoringEngine }
}
