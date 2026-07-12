import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getReviewQueueAction, getLcAuditEvents } from "@/actions/localcontent-review-actions";
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
  const { auditEventCount, recentAuditEvents } = await getLcAuditEvents(organizationId);

  return (
    <ReviewCenter
      initialQueue={queue}
      organizationId={organizationId}
      auditEventCount={auditEventCount}
      recentAuditEvents={recentAuditEvents}
    />
  );
}
