import { permanentRedirect } from "next/navigation";

export default async function SunbulRecordDetailPage({
  params,
}: {
  params: Promise<{ clientId: string; recordId: string }>;
}) {
  const { clientId, recordId } = await params;
  permanentRedirect(`/workflowos/clients/${clientId}/records/${recordId}`);
}
