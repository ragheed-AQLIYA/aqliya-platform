import { SunbulRecordDetail } from "@/components/sunbul/sunbul-record-detail";

export default async function WorkflowosRecordDetailPage({
  params,
}: {
  params: Promise<{ clientId: string; recordId: string }>;
}) {
  const { clientId, recordId } = await params;
  return <SunbulRecordDetail clientId={clientId} recordId={recordId} />;
}
