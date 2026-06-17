import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getReviewQueueAction } from "@/actions/localcontent-review-actions";
import { ReviewCenter } from "./review-center-client";

export const dynamic = "force-dynamic";

export default async function ReviewCenterPage() {
  noStore();

  let user;
  try {
    user = await getCurrentUser();
  } catch {
    redirect("/login");
  }

  const organizationId = user.organizationId;
  const queue = await getReviewQueueAction(organizationId);

  // Fetch audit event data for governance visibility
  const [auditEventCount, recentAuditEvents] = await Promise.all([
    prisma.lcAiAuditEvent.count({
      where: { organizationId },
    }),
    prisma.lcAiAuditEvent.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <ReviewCenter
      initialQueue={queue}
      organizationId={organizationId}
      auditEventCount={auditEventCount}
      recentAuditEvents={recentAuditEvents.map((e) => ({
        id: e.id,
        action: e.action,
        status: e.status,
        confidence: e.confidence ?? undefined,
        durationMs: e.durationMs,
        createdAt: e.createdAt.toISOString(),
      }))}
    />
  );
}
