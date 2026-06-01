import AuditTrailPage from "@/components/audit/audit-trail/audit-trail-page";
import { getAuditActor } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";

export default async function Page({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const actor = await getAuditActor();
  await assertEngagementAccess(engagementId, actor);

  return <AuditTrailPage />;
}
