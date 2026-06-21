import { NextResponse } from "next/server";
import { requireUserContext } from "@/lib/auth";
import { getEnterpriseHealthSnapshot } from "@/lib/platform/enterprise-health";

export const dynamic = "force-dynamic";

/** ADMIN — Tier 3 enterprise readiness snapshot (ops prep). */
export async function GET() {
  try {
    await requireUserContext("ADMIN");
    const snapshot = await getEnterpriseHealthSnapshot();
    const criticalCount = snapshot.alerts.filter((a) => a.severity === "critical").length;
    const warningCount = snapshot.alerts.filter((a) => a.severity === "warning").length;
    return NextResponse.json({
      ok: true,
      snapshot,
      summary: {
        criticalAlerts: criticalCount,
        warningAlerts: warningCount,
        outboxFailed: snapshot.outbox.failed,
        rateLimiterMode: snapshot.rateLimiter.mode,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load enterprise health";
    return NextResponse.json({ ok: false, error: message }, { status: 403 });
  }
}
