import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
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
