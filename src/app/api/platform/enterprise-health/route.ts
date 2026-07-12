import { NextResponse } from "next/server";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { getEnterpriseHealthSnapshot } from "@/lib/platform/enterprise-health";
import { getHealthCheck, getSystemMetrics } from "@/lib/platform/monitoring/system-monitor";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";

export const dynamic = "force-dynamic";

/** ADMIN — Tier 3 enterprise readiness snapshot (ops prep). */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN")) {
      throw new Error("Access denied: ADMIN role required");
    }
    const snapshot = await getEnterpriseHealthSnapshot();
    const [health, sysMetrics] = await Promise.all([
      getHealthCheck(["database", "redis", "storage", "ai", "queue", "server"]),
      getSystemMetrics(),
    ]);
    const criticalCount = snapshot.alerts.filter((a) => a.severity === "critical").length;
    const warningCount = snapshot.alerts.filter((a) => a.severity === "warning").length;
    return NextResponse.json({
      ok: true,
      snapshot,
      health: {
        status: health.status,
        checks: health.checks,
        uptimeSeconds: sysMetrics.uptimeSeconds,
        memory: sysMetrics.memory,
        cpu: sysMetrics.cpu,
      },
      summary: {
        criticalAlerts: criticalCount,
        warningAlerts: warningCount,
        outboxFailed: snapshot.outbox.failed,
        rateLimiterMode: snapshot.rateLimiter.mode,
      },
    });
  } catch (error) {
    const { message, code } = sanitizeError(error);
    return NextResponse.json({ ok: false, error: message }, { status: httpStatusFromCode(code) });
  }
}
