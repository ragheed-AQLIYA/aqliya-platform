import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/observability/logger";
import { getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import { buildDownloadResponse } from "@/lib/platform/download";
import { getStorageProvider } from "@/lib/platform/storage";
import { assertEvidenceDownloadAccess } from "@/lib/core/evidence";
import { prisma } from "@/lib/prisma";
import { sanitizeErrorResponse } from "@/lib/platform/api-error";


const logger = createLogger({ product: "platform", action: "unknown" });

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ decisionId: string; evidenceId: string }> },
) {
  const { decisionId, evidenceId } = await params;

  try {
    const user = await getCurrentUser();
    await enforce(user, { type: "evidence", id: evidenceId, tenantId: user.organizationId }, "export");

    // Verify decision exists and belongs to user's org
    const decision = await prisma.decision.findUnique({
      where: { id: decisionId },
      select: { organizationId: true },
    });
    if (!decision) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 });
    }
    if (decision.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 });
    }

    const evidenceRecord = await assertEvidenceDownloadAccess({
      productSlug: "decision",
      evidenceId,
      organizationId: user.organizationId,
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
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    if (
      message.includes("Evidence not found") ||
      message.includes("no file stored")
    ) {
      return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
    }
    logger.error("[DecisionEvidenceDownload] Error", error instanceof Error ? error : new Error(message));
    return NextResponse.json(sanitizeErrorResponse(error), { status: 500 });
  }
}
