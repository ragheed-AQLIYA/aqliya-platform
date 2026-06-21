import { NextRequest, NextResponse } from "next/server";
import { assertProjectAccess } from "@/lib/local-content/guards";
import { requireServerActionAccess } from "@/core/access/server-action-guard";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import { buildDownloadResponse } from "@/lib/platform/download";
import { getStorageProvider } from "@/lib/platform/storage";
import { assertEvidenceDownloadAccess } from "@/lib/core/evidence";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; evidenceId: string }> },
) {
  const { projectId, evidenceId } = await params;

  try {
    const { user, project } = await assertProjectAccess(projectId, "view");
    await requireServerActionAccess("local_content", "read", {
      organizationId: user.organizationId,
      resourceId: projectId,
    });

    const evidenceRecord = await assertEvidenceDownloadAccess({
      productSlug: "local_content",
      evidenceId,
      organizationId: user.organizationId,
      resourceId: projectId,
    });

    const file = await getStorageProvider().retrieve(evidenceRecord.storageKey!);
    if (!file) {
      return NextResponse.json(
        { error: "Stored file not found" },
        { status: 404 },
      );
    }

    const alog = auditLogger({
      productKey: Product.LOCAL_CONTENT,
      sourceSystem: "local_content_evidence_download",
      organization: {
        platformOrganizationId:
          project.platformOrganizationId ?? user.platformOrganizationId,
        clientWorkspaceId: project.clientWorkspaceId ?? undefined,
        projectId: project.projectId ?? undefined,
      },
      actor: { id: user.id, name: user.name, type: user.role },
    });
    await alog.record(
      "evidence.download",
      {
        type: "local_content_evidence",
        id: evidenceId,
        label: evidenceRecord.filename,
      },
      {
        status: "success",
        sourceModel: "LocalContentEvidence",
        sourceId: evidenceRecord.id,
        metadata: {
          projectId,
          fileType: evidenceRecord.fileType,
        },
      },
    );

    return buildDownloadResponse({
      content: file.content,
      filename: evidenceRecord.filename,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthenticated") {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 },
        );
      }
      if (error.message.startsWith("Access denied")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message === "Project not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }

    console.error("[LocalContentEvidenceDownload] Error:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 },
    );
  }
}
