import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "ADMIN")) {
      throw new Error("Access denied: ADMIN role required");
    }

    const metrics: Record<string, unknown> = {};

    const orgId = user.organizationId;
    const engagementCounts = await prisma.auditEngagement.groupBy({
      by: ["status"],
      where: { organizationId: orgId },
      _count: true,
    });
    metrics.engagements = Object.fromEntries(
      engagementCounts.map((e) => [e.status, e._count]),
    );

    const decisionCounts = await prisma.decision.groupBy({
      by: ["status"],
      where: { organizationId: orgId },
      _count: true,
    });
    metrics.decisions = Object.fromEntries(
      decisionCounts.map((d) => [d.status, d._count]),
    );

    metrics.totalEngagements = await prisma.auditEngagement.count({ where: { organizationId: orgId } });
    metrics.totalDecisions = await prisma.decision.count({ where: { organizationId: orgId } });
    metrics.totalClients = await prisma.auditClient.count({ where: { organizationId: orgId } });
    metrics.totalEvidence = await prisma.auditEvidence.count({ where: { engagement: { organizationId: orgId } } });

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
