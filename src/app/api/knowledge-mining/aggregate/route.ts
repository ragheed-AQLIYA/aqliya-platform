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

import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-next";
import { aggregatePatterns } from "@/lib/tb-intelligence/knowledge-mining";

const aggregateSchema = z.object({
  minSupportCount: z.number().int().min(1).optional(),
  minOrganizationCount: z.number().int().min(1).optional(),
  minConfidence: z.number().min(0).max(1).optional(),
  organizationId: z.string().optional(),
});

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

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      raw = {};
    }
    const parsed = aggregateSchema.safeParse(raw);
    const data = parsed.success ? parsed.data : {};
    const user = session.user as Record<string, unknown>;
    const organizationId = user.organizationId as string | undefined;
    if (!organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    const patterns = await aggregatePatterns({
      minSupportCount: data.minSupportCount ?? 2,
      minOrganizationCount: data.minOrganizationCount ?? 1,
      minConfidence: data.minConfidence ?? 0.6,
      organizationId,
    });
    return NextResponse.json({ patterns, count: patterns.length });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
