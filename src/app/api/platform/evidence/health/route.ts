import { NextResponse } from "next/server";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { getEvidenceHealthSnapshot } from "@/lib/core/evidence/health";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";

export const dynamic = "force-dynamic";

/** ADMIN — Core Evidence Platform operational health. */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN")) {
      throw new Error("Access denied: ADMIN role required");
    }
    const snapshot = await getEvidenceHealthSnapshot();
    const criticalCount = snapshot.alerts.filter(
      (a) => a.severity === "critical",
    ).length;
    const warningCount = snapshot.alerts.filter(
      (a) => a.severity === "warning",
    ).length;

    return NextResponse.json({
      ok: true,
      snapshot,
      summary: {
        totalCoreEvidence: snapshot.totalCoreEvidence,
        backfillCoveragePercent: snapshot.backfillCoverage.overall.percent,
        failedAdapterSyncs: snapshot.failedAdapterSyncs,
        orphanedEvidence: snapshot.orphanedEvidence,
        criticalAlerts: criticalCount,
        warningAlerts: warningCount,
      },
    });
  } catch (error) {
    const { message, code } = sanitizeError(error);
    return NextResponse.json({ ok: false, error: message }, { status: httpStatusFromCode(code) });
  }
}
