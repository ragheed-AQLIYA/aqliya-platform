import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { retrieveSunbulDocument } from "@/lib/sunbul/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;

  try {
    await getCurrentUser();

    const docRecord = await import("@/lib/prisma").then((m) =>
      m.prisma.sunbulDocument.findUnique({
        where: { id: documentId },
        select: { clientId: true, recordId: true, fileName: true },
      }),
    );
    if (!docRecord) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    const { document, file } = await retrieveSunbulDocument(
      docRecord.clientId,
      docRecord.recordId,
      documentId,
    );

    const body = new Uint8Array(file.content);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${document.fileName.replace(/["\r\n]/g, "_")}"`,
        "Content-Length": String(file.sizeBytes),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=3600",
      },
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
