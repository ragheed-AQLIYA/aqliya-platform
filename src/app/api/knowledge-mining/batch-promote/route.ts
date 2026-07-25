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

import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-next";
import { batchPromoteCandidates } from "@/lib/tb-intelligence/knowledge-mining/promotion-service";
import { sanitizeError, sanitizeErrorResponse, httpStatusFromCode } from "@/lib/platform/api-error";

const batchPromoteSchema = z.object({
  artifactType: z.enum(["candidate-synonyms", "candidate-rule-pack"]),
  notes: z.string().max(5000).optional(),
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

    const user = session.user as Record<string, unknown>;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = batchPromoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(" ") },
        { status: 400 },
      );
    }

    const { artifactType, notes } = parsed.data;

    const result = await batchPromoteCandidates({
      promotedBy: user.id as string, // session-derived, not caller-supplied
      artifactType,
      notes,
    });

    return NextResponse.json(result);
  } catch (error) {
    const { code } = sanitizeError(error);
    return NextResponse.json(sanitizeErrorResponse(error), { status: httpStatusFromCode(code) });
  }
}
