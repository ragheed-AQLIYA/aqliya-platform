import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import {
  getWorkbookAction,
  detectMissingDataAction,
  getDataRequestsAction,
  getWorkbookProjectOrgId,
} from "@/actions/localcontent-workbook-actions";
import { WorkbookDetailClient } from "./workbook-detail-client";

export const dynamic = "force-dynamic";

export default async function WorkbookDetailPage({
  params,
}: {
  params: Promise<{ workbookId: string }>;
}) {
  noStore();
  const { workbookId } = await params;

  const [wbRes, missingRes, requestsRes, organizationId] = await Promise.all([
    getWorkbookAction(workbookId),
    detectMissingDataAction(workbookId),
    getDataRequestsAction(workbookId),
    getWorkbookProjectOrgId(workbookId),
  ]);

  if (!wbRes.ok) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-medium">{wbRes.error}</p>
      </div>
    );
  }

  if (!wbRes.data) {
    notFound();
  }

  const workbook = wbRes.data;

  const missingData = missingRes.ok ? missingRes.data : null;
  const dataRequests = requestsRes.ok ? requestsRes.data : [];

  return (
    <WorkbookDetailClient
      workbook={workbook}
      missingData={missingData}
      dataRequests={dataRequests}
      organizationId={organizationId}
    />
  );
}
