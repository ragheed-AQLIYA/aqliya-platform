import { NextRequest, NextResponse } from "next/server";
import { requireDecisionAccess } from "@/lib/auth";
import { enforce } from "@/lib/authorization";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import { buildDownloadResponse } from "@/lib/platform/download";
import { getStorageProvider } from "@/lib/platform/storage";
import { assertEvidenceDownloadAccess } from "@/lib/core/evidence";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ decisionId: string; evidenceId: string }> },
) {
  const { decisionId, evidenceId } = await params;

  try {
    const { user, organizationId } = await requireDecisionAccess(
      decisionId,
      "VIEWER",
    );
    await enforce(user, { type: "decision", id: decisionId, tenantId: organizationId }, "read");

    const evidenceRecord = await assertEvidenceDownloadAccess({
      productSlug: "decision",
      evidenceId,
      organizationId,
      resourceId: decisionId,
    });

    const file = await getStorageProvider().retrieve(evidenceRecord.storageKey!);
    if (!file) {
      return NextResponse.json(
        { error: "Stored file not found" },
        { status: 404 },
      );
    }

    const alog = auditLogger({
      productKey: Product.DECISION_OS,
      sourceSystem: "decision_evidence_download",
      organization: { platformOrganizationId: user.platformOrganizationId },
      actor: { id: user.id, name: user.name, type: user.role },
    });
    await alog.record(
      "evidence.download",
      {
        type: "decision_evidence",
        id: evidenceId,
        label: evidenceRecord.filename,
      },
      {
        status: "success",
        sourceModel: "DecisionEvidence",
        sourceId: evidenceRecord.id,
        metadata: {
          decisionId,
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
    const message =
      error instanceof Error ? error.message : "Failed to serve file";
    if (message === "Unauthenticated") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    if (message.includes("Decision not found")) {
      return NextResponse.json(
        { error: "Decision not found" },
        { status: 404 },
      );
    }
    if (message.includes("Access denied")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (
      message.includes("Evidence not found") ||
      message.includes("no file stored")
    ) {
      return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
    }
    console.error("[DecisionEvidenceDownload] Error:", message);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 },
    );
  }
}
