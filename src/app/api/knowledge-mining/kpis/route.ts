/**
 * Phase 8 — Knowledge Mining KPIs API.
 * GET: Return operational metrics for the knowledge mining pipeline
 *
 * @deprecated Dashboard uses server actions (knowledge-mining-actions.ts).
 * Kept for external/scheduled job access. Requires auth + viewer role.
 *
 * Security (Phase 8.3):
 * - VIEWER minimum (read-only)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-next";
import { getKnowledgeMiningKPIs } from "@/lib/tb-intelligence/knowledge-mining/kpis";
import { sanitizeError, sanitizeErrorResponse, httpStatusFromCode } from "@/lib/platform/api-error";

function requireRole(user: Record<string, unknown>, minRole: "ADMIN" | "OPERATOR" | "VIEWER"): void {
  const role = user.role as string | undefined;
  if (!role) throw new Error("Unauthorized");
  if (minRole === "ADMIN" && role !== "ADMIN") throw new Error("Access denied: ADMIN role required");
  if (minRole === "OPERATOR" && role !== "ADMIN" && role !== "OPERATOR") throw new Error("Access denied: OPERATOR role required");
  if (minRole === "VIEWER" && !["VIEWER", "OPERATOR", "ADMIN"].includes(role)) throw new Error("Access denied: authenticated user required");
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    requireRole(session.user as Record<string, unknown>, "VIEWER");
    const user = session.user as Record<string, unknown>;
    const organizationId = user.organizationId as string | undefined;
    if (!organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const kpis = await getKnowledgeMiningKPIs(organizationId);
    return NextResponse.json(kpis);
  } catch (error) {
    const { code } = sanitizeError(error);
    return NextResponse.json(sanitizeErrorResponse(error), { status: httpStatusFromCode(code) });
  }
}
