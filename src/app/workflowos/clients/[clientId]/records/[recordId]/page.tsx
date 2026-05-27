import { permanentRedirect } from "next/navigation";

export default async function WorkflowosRecordDetailPage({
  params,
}: {
  params: Promise<{ clientId: string; recordId: string }>;
}) {
  const { clientId, recordId } = await params;
  permanentRedirect(`/sunbul/clients/${clientId}/records/${recordId}`);
}
