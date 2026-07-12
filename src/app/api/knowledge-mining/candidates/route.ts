/**
 * Phase 8 — Knowledge Mining Candidates API.
 * GET: List candidates (with filters)
 * POST: Run mining pipeline
 *
 * @deprecated Dashboard uses server actions (knowledge-mining-actions.ts).
 * Kept for external/scheduled job access. Requires auth + viewer role.
 *
 * Security (Phase 8.3):
 * - GET: VIEWER minimum (read-only)
 * - POST: OPERATOR minimum (mutation)
 * - Actor identity ALWAYS derived from session, never from caller
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-next";
import { listCandidates } from "@/lib/tb-intelligence/knowledge-mining";
import type { KnowledgeCandidateStatus } from "@/lib/tb-intelligence/knowledge-mining/types";
import { runFullMiningPipeline } from "@/lib/tb-intelligence/knowledge-mining/candidate-rule-generator";
import { sanitizeError, sanitizeErrorResponse, httpStatusFromCode } from "@/lib/platform/api-error";

const CANDIDATE_STATUSES: KnowledgeCandidateStatus[] = [
  "CANDIDATE",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "PROMOTED",
];

function parseCandidateStatus(value: string | null): KnowledgeCandidateStatus | undefined {
  if (!value) return undefined;
  return CANDIDATE_STATUSES.includes(value as KnowledgeCandidateStatus)
    ? (value as KnowledgeCandidateStatus)
    : undefined;
}

function requireRole(user: Record<string, unknown>, minRole: "ADMIN" | "OPERATOR" | "VIEWER"): void {
  const role = user.role as string | undefined;
  if (!role) throw new Error("Unauthorized");
  if (minRole === "ADMIN" && role !== "ADMIN") throw new Error("Access denied: ADMIN role required");
  if (minRole === "OPERATOR" && role !== "ADMIN" && role !== "OPERATOR") throw new Error("Access denied: OPERATOR role required");
  if (minRole === "VIEWER" && !["VIEWER", "OPERATOR", "ADMIN"].includes(role)) throw new Error("Access denied: authenticated user required");
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    requireRole(session.user as Record<string, unknown>, "VIEWER");

    const url = new URL(request.url);
    const status = parseCandidateStatus(url.searchParams.get("status"));
    const canonicalCode = url.searchParams.get("canonicalCode") ?? undefined;
    const search = url.searchParams.get("search") ?? undefined;
    const sortBy = (url.searchParams.get("sortBy") ?? "createdAt") as
      | "supportCount"
      | "confidence"
      | "createdAt";
    const sortDir = (url.searchParams.get("sortDir") ?? "desc") as "asc" | "desc";
    const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);

    const result = await listCandidates({
      status,
      canonicalCode,
      search,
      sortBy,
      sortDir,
      offset,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    const { code } = sanitizeError(error);
    return NextResponse.json(sanitizeErrorResponse(error), { status: httpStatusFromCode(code) });
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    requireRole(session.user as Record<string, unknown>, "OPERATOR");

    const user = session.user as Record<string, unknown>;
    const result = await runFullMiningPipeline({
      createdById: user.id as string,
    });
    return NextResponse.json(result);
  } catch (error) {
    const { code } = sanitizeError(error);
    return NextResponse.json(sanitizeErrorResponse(error), { status: httpStatusFromCode(code) });
  }
}
