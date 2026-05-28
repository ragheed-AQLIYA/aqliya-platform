import { NextRequest, NextResponse } from "next/server";
import { requireDecisionAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import { buildDownloadResponse } from "@/lib/platform/download";
import { getStorageProvider } from "@/lib/platform/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ decisionId: string; evidenceId: string }> },
) {
  const { decisionId, evidenceId } = await params;

  try {
    const { user } = await requireDecisionAccess(decisionId, "VIEWER");

    const evidence = await prisma.decisionEvidence.findUnique({
      where: { id: evidenceId },
      select: {
        id: true,
        decisionId: true,
        filename: true,
        fileType: true,
        fileSize: true,
        storageKey: true,
      },
    });

    if (
      !evidence ||
      evidence.decisionId !== decisionId ||
      !evidence.storageKey
    ) {
      return NextResponse.json(
        { error: "Evidence not found" },
        { status: 404 },
      );
    }

    const file = await getStorageProvider().retrieve(evidence.storageKey);
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
        label: evidence.filename,
      },
      {
        status: "success",
        sourceModel: "DecisionEvidence",
        sourceId: evidence.id,
        metadata: {
          decisionId,
          fileType: evidence.fileType,
          fileSize: evidence.fileSize,
        },
      },
    );

    return buildDownloadResponse({
      content: file.content,
      filename: evidence.filename,
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
    console.error("[DecisionEvidenceDownload] Error:", message);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 },
    );
  }
}
