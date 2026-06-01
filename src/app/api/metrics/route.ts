import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

const OPS_TOKEN_HEADER = "x-aqliya-ops-token";

/**
 * Constant-time UTF-8 comparison so response timing does not reveal how many
 * leading characters of the ops token matched. Length is checked up-front
 * (standard for constant-time string compares); leaking only the length of a
 * high-entropy secret is negligible. Uses no external dependency.
 */
function constantTimeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aBytes = enc.encode(a);
  const bBytes = enc.encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}

/**
 * Internal-ops gate for /api/metrics. This endpoint exposes platform-wide
 * aggregate counts and must NOT be reachable merely because a user is an org
 * ADMIN. Access requires the shared internal ops token supplied via the
 * `x-aqliya-ops-token` header and matched against AQLIYA_INTERNAL_METRICS_TOKEN.
 * Every rejection (env unset, header missing, or mismatch) returns 404 — not
 * 401/403 — to avoid disclosing that the endpoint exists. Returns null when
 * access is granted.
 */
function rejectIfNotInternalOps(request: NextRequest): NextResponse | null {
  const expected = process.env.AQLIYA_INTERNAL_METRICS_TOKEN;
  const provided = request.headers.get(OPS_TOKEN_HEADER);

  const granted =
    typeof expected === "string" &&
    expected.length > 0 &&
    typeof provided === "string" &&
    constantTimeEqual(provided, expected);

  if (granted) return null;

  return NextResponse.json(
    {
      success: false,
      error: { code: "NOT_FOUND", message: "Not found" },
      meta: { timestamp: new Date().toISOString() },
    },
    { status: 404 },
  );
}

export async function GET(request: NextRequest) {
  const opsRejection = rejectIfNotInternalOps(request);
  if (opsRejection) return opsRejection;

  try {
    await requireUserContext("ADMIN");

    const metrics: Record<string, unknown> = {};

    const engagementCounts = await prisma.auditEngagement.groupBy({
      by: ["status"],
      _count: true,
    });
    metrics.engagements = Object.fromEntries(
      engagementCounts.map((e) => [e.status, e._count]),
    );

    const decisionCounts = await prisma.decision.groupBy({
      by: ["status"],
      _count: true,
    });
    metrics.decisions = Object.fromEntries(
      decisionCounts.map((d) => [d.status, d._count]),
    );

    metrics.totalEngagements = await prisma.auditEngagement.count();
    metrics.totalDecisions = await prisma.decision.count();
    metrics.totalClients = await prisma.auditClient.count();
    metrics.totalEvidence = await prisma.auditEvidence.count();

    return NextResponse.json({
      success: true,
      data: metrics,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthenticated") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "UNAUTHENTICATED",
              message: "Authentication required",
            },
            meta: { timestamp: new Date().toISOString() },
          },
          { status: 401 },
        );
      }

      if (error.message.startsWith("Access denied:")) {
        return NextResponse.json(
          {
            success: false,
            error: { code: "FORBIDDEN", message: "Access denied" },
            meta: { timestamp: new Date().toISOString() },
          },
          { status: 403 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: { code: "METRICS_ERROR", message: "Failed to fetch metrics" },
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 500 },
    );
  }
}
