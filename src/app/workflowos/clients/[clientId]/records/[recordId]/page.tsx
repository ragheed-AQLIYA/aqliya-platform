import { WorkflowRecordDetail } from "@/components/workflowos/workflow-record-detail";

export default async function WorkflowosRecordDetailPage({
  params,
}: {
  params: Promise<{ clientId: string; recordId: string }>;
}) {
  const { clientId, recordId } = await params;
  return <WorkflowRecordDetail clientId={clientId} recordId={recordId} />;
}
