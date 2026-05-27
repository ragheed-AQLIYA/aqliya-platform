import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { retrieveSunbulDocument } from "@/lib/sunbul/storage";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import { buildDownloadResponse } from "@/lib/platform/download";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;

  try {
    const user = await getCurrentUser();

    const prisma = (await import("@/lib/prisma")).prisma;
    const docRecord = await prisma.sunbulDocument.findUnique({
      where: { id: documentId },
      select: { clientId: true, recordId: true, fileName: true },
    });
    if (!docRecord) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    // Authorize before returning any document metadata
    const { requireClientAccess } = await import("@/lib/sunbul/tenant-guard");
    await requireClientAccess(docRecord.clientId);

    const { document, file } = await retrieveSunbulDocument(
      docRecord.clientId,
      docRecord.recordId,
      documentId,
    );

    const alog = auditLogger({
      productKey: Product.SUNBUL,
      sourceSystem: "sunbul_download",
      organization: { platformOrganizationId: user.platformOrganizationId },
      actor: { id: user.id, name: user.name, type: user.role },
    });
    await alog.record(
      "document.download",
      {
        type: "sunbul_document",
        id: documentId,
        label: docRecord.fileName,
      },
      { status: "success" },
    );

    return buildDownloadResponse({
      content: file.content,
      filename: document.fileName,
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
    if (message.includes("not found") || message.includes("not stored")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message.includes("Access denied")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    console.error("[SunbulDocumentDownload] Error:", message);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 },
    );
  }
}
