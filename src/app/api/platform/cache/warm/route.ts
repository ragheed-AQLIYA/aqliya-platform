import { NextResponse } from "next/server";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { warmDashboardCaches } from "@/lib/platform/cache-strategy";
import { sanitizeError, httpStatusFromCode } from "@/lib/platform/api-error";

export const dynamic = "force-dynamic";

/**
 * POST /api/platform/cache/warm
 * ADMIN only — pre-populates dashboard caches for the caller's organization.
 * Call after cache clear, on startup, or manually to reduce cold-start latency.
 */
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN")) {
      return NextResponse.json(
        { ok: false, error: "Access denied: ADMIN role required" },
        { status: 403 },
      );
    }

    const results = await warmDashboardCaches(user.organizationId);

    const warmed = results.filter((r) => r.status === "warmed").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const skipped = results.filter((r) => r.status === "skipped").length;

    return NextResponse.json({
      ok: failed === 0,
      organizationId: user.organizationId,
      summary: { warmed, failed, skipped, total: results.length },
      details: results,
    });
  } catch (error) {
    const { message, code } = sanitizeError(error);
    return NextResponse.json(
      { ok: false, error: message },
      { status: httpStatusFromCode(code) },
    );
  }
}
