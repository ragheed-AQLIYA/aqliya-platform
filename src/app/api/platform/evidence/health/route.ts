import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getEvidenceHealthSnapshot } from "@/lib/core/evidence/health";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";
import { assertPlatformAdmin } from "@/lib/authorization/platform-admin";

export const dynamic = "force-dynamic";

/** Platform admin — Core Evidence Platform operational health. */
export async function GET() {
  try {
    const user = await getCurrentUser();
    assertPlatformAdmin(user);
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
