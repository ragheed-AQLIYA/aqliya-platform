import { NextResponse } from "next/server";
import { requireUserContext } from "@/lib/auth";
import { getAbacShadowMismatchReport } from "@/core/access/abac-shadow-report";

export const dynamic = "force-dynamic";

/** ADMIN — ABAC shadow mismatch summary for pilot rollout review. */
export async function GET() {
  try {
    const user = await requireUserContext("ADMIN");
    const report = await getAbacShadowMismatchReport(user.organizationId);
    return NextResponse.json({ ok: true, report });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load ABAC shadow report";
    return NextResponse.json({ ok: false, error: message }, { status: 403 });
  }
}
