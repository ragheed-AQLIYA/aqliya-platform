import { NextResponse } from "next/server";
import { requireUserContext } from "@/lib/auth";
import { getEvidenceHealthSnapshot } from "@/lib/core/evidence/health";

export const dynamic = "force-dynamic";

/** ADMIN — Core Evidence Platform operational health. */
export async function GET() {
  try {
    await requireUserContext("ADMIN");
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
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load evidence health";
    return NextResponse.json({ ok: false, error: message }, { status: 403 });
  }
}
