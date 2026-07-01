/**
 * Phase 8 — Knowledge Candidate detail API.
 * GET: Get candidate with evidence and promotion history
 * DELETE: Remove a candidate
 *
 * @deprecated Dashboard uses server actions (knowledge-mining-actions.ts).
 * Kept for external/scheduled job access. Requires auth + viewer role.
 *
 * Security (Phase 8.3):
 * - GET: VIEWER minimum (read-only)
 * - DELETE: ADMIN only (destructive)
 * - Actor identity ALWAYS derived from session, never from caller
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-next";
import { getCandidate, deleteCandidate } from "@/lib/tb-intelligence/knowledge-mining";

function requireRole(user: Record<string, unknown>, minRole: "ADMIN" | "OPERATOR" | "VIEWER"): void {
  const role = user.role as string | undefined;
  if (!role) throw new Error("Unauthorized");
  if (minRole === "ADMIN" && role !== "ADMIN") throw new Error("Access denied: ADMIN role required");
  if (minRole === "OPERATOR" && role !== "ADMIN" && role !== "OPERATOR") throw new Error("Access denied: OPERATOR role required");
  if (minRole === "VIEWER" && !["VIEWER", "OPERATOR", "ADMIN"].includes(role)) throw new Error("Access denied: authenticated user required");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    requireRole(session.user as Record<string, unknown>, "VIEWER");

    const { id } = await params;
    const result = await getCandidate(id);
    if (!result.candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof Error && error.message.startsWith("Access denied") ? 403 : 500;
    return NextResponse.json({ error: String(error) }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    requireRole(session.user as Record<string, unknown>, "ADMIN");

    const { id } = await params;
    const success = await deleteCandidate(id);
    if (!success) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof Error && error.message.startsWith("Access denied") ? 403 : 500;
    return NextResponse.json({ error: String(error) }, { status });
  }
}
