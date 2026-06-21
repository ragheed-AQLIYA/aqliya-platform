import { NextResponse } from "next/server";
import { requireUserContext } from "@/lib/auth";
import {
  isAbacEnforceEnabledForOrg,
  listAbacEnforceOrgIds,
} from "@/core/access/abac-gate";
import { getAbacShadowMismatchReport } from "@/core/access/abac-shadow-report";
import { isEnabled } from "@/lib/platform/feature-flags/registry";

export const dynamic = "force-dynamic";

/** ADMIN — ABAC pilot enforce status + shadow readiness for rollout review. */
export async function GET() {
  try {
    const user = await requireUserContext("ADMIN");
    const report = await getAbacShadowMismatchReport(user.organizationId, 30);
    const enforceOrgIds = listAbacEnforceOrgIds();

    return NextResponse.json({
      ok: true,
      organizationId: user.organizationId,
      flags: {
        abacShadow: isEnabled("platform.abac-shadow"),
        abacEnforce: isEnabled("platform.abac-enforce"),
      },
      pilot: {
        enforceEnabledForOrg: isAbacEnforceEnabledForOrg(user.organizationId),
        configuredEnforceOrgIds: enforceOrgIds,
        readyForEnforce: report.enforce.readyForPilot,
        recommendation: report.enforce.recommendation,
      },
      shadow: {
        windowDays: report.windowDays,
        totalEvaluations: report.totalEvaluations,
        totalMismatches: report.totalMismatches,
        mismatchRate: report.mismatchRate,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load ABAC pilot status";
    return NextResponse.json({ ok: false, error: message }, { status: 403 });
  }
}
