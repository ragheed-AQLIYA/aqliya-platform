/**
 * Phase 8 — Pattern Aggregation API.
 * POST: Run pattern aggregation and return results (without persisting)
 *
 * @deprecated Dashboard uses server actions (knowledge-mining-actions.ts).
 * Kept for external/scheduled job access. Requires auth + viewer role.
 *
 * Security (Phase 8.3):
 * - OPERATOR minimum (triggered computation)
 * - Actor identity ALWAYS derived from session, never from caller
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-next";
import { aggregatePatterns } from "@/lib/tb-intelligence/knowledge-mining";

function requireRole(user: Record<string, unknown>, minRole: "ADMIN" | "OPERATOR" | "VIEWER"): void {
  const role = user.role as string | undefined;
  if (!role) throw new Error("Unauthorized");
  if (minRole === "ADMIN" && role !== "ADMIN") throw new Error("Access denied: ADMIN role required");
  if (minRole === "OPERATOR" && role !== "ADMIN" && role !== "OPERATOR") throw new Error("Access denied: OPERATOR role required");
  if (minRole === "VIEWER" && !["VIEWER", "OPERATOR", "ADMIN"].includes(role)) throw new Error("Access denied: authenticated user required");
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    requireRole(session.user as Record<string, unknown>, "OPERATOR");

    const body = await request.json().catch(() => ({}));
    const patterns = await aggregatePatterns({
      minSupportCount: body.minSupportCount ?? 2,
      minOrganizationCount: body.minOrganizationCount ?? 1,
      minConfidence: body.minConfidence ?? 0.6,
      organizationId: body.organizationId ?? undefined,
    });
    return NextResponse.json({ patterns, count: patterns.length });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
