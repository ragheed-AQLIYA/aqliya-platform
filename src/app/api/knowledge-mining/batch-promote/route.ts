/**
 * Phase 8 — Batch Knowledge Promotion API.
 * POST: Promote all approved candidates to a combined artifact
 *
 * @deprecated Dashboard uses server actions (knowledge-mining-actions.ts).
 * Kept for external/scheduled job access. Requires auth + viewer role.
 *
 * Security (Phase 8.3):
 * - OPERATOR minimum
 * - Actor identity ALWAYS derived from session, NEVER from caller
 * - body.promotedBy is IGNORED — session.user.id is used instead
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-next";
import { batchPromoteCandidates } from "@/lib/tb-intelligence/knowledge-mining/promotion-service";

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

    const user = session.user as Record<string, unknown>;
    const body = await request.json();

    if (!body.artifactType) {
      return NextResponse.json(
        { error: "artifactType is required" },
        { status: 400 },
      );
    }

    if (!["candidate-synonyms", "candidate-rule-pack"].includes(body.artifactType)) {
      return NextResponse.json(
        { error: "artifactType must be 'candidate-synonyms' or 'candidate-rule-pack'" },
        { status: 400 },
      );
    }

    const result = await batchPromoteCandidates({
      promotedBy: user.id as string, // session-derived, not caller-supplied
      artifactType: body.artifactType,
      notes: body.notes,
    });

    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof Error && error.message.startsWith("Access denied") ? 403 : 500;
    return NextResponse.json({ error: String(error) }, { status });
  }
}
