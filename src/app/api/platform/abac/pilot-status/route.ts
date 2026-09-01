import { NextResponse } from "next/server";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import {
  isAbacEnforceEnabledForOrg,
  listAbacEnforceOrgIds,
} from "@/lib/core/policy/access/abac-gate";
import { getAbacShadowMismatchReport } from "@/lib/core/policy/access/abac-shadow-report";
import { isEnabled } from "@/lib/platform/feature-flags/registry";
import { sanitizeError, sanitizeErrorResponse, httpStatusFromCode } from "@/lib/platform/api-error";
import { isPlatformAdmin } from "@/lib/authorization/platform-admin";

export const dynamic = "force-dynamic";

/** ADMIN — ABAC pilot enforce status + shadow readiness for rollout review. */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN") && !isPlatformAdmin(user)) {
      throw new Error("Access denied: ADMIN role required");
    }
    const report = await getAbacShadowMismatchReport(user.organizationId, 30);
    const enforceOrgIds = listAbacEnforceOrgIds();
    const platform = isPlatformAdmin(user);

    return NextResponse.json({
      ok: true,
      organizationId: user.organizationId,
      flags: {
        abacShadow: isEnabled("platform.abac-shadow"),
        abacEnforce: isEnabled("platform.abac-enforce"),
      },
      pilot: {
        enforceEnabledForOrg: isAbacEnforceEnabledForOrg(user.organizationId),
        configuredEnforceOrgIds: platform
          ? enforceOrgIds
          : enforceOrgIds.filter((id) => id === user.organizationId),
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
    const { code } = sanitizeError(error);
    return NextResponse.json(sanitizeErrorResponse(error), { status: httpStatusFromCode(code) });
  }
}
