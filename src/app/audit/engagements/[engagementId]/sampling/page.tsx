import { AuditSamplingPage } from "@/components/audit/sampling/audit-sampling-page";

export default async function Page({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  return <AuditSamplingPage engagementId={engagementId} />;
}
