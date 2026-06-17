import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getWorkbookAction,
  detectMissingDataAction,
  getDataRequestsAction,
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

  const [wbRes, missingRes, requestsRes] = await Promise.all([
    getWorkbookAction(workbookId),
    detectMissingDataAction(workbookId),
    getDataRequestsAction(workbookId),
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

  // Fetch organizationId from project (needed for AI features)
  const project = await prisma.localContentProject.findUnique({
    where: { id: workbook.projectId },
    select: { organizationId: true },
  });
  const organizationId = project?.organizationId ?? "";

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
