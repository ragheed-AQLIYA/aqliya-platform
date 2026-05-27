import { NextRequest, NextResponse } from "next/server";
import { exportWorkflowRecord } from "@/lib/workflowos/export";
import { buildDownloadResponse } from "@/lib/platform/download";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clientId: string; recordId: string }> },
) {
  try {
    const { clientId, recordId } = await params;

    const result = await exportWorkflowRecord({ clientId, recordId });

    return buildDownloadResponse({
      content: result.buffer,
      filename: result.filename,
      mimeType: result.mimeType,
      sizeBytes: result.sizeBytes,
      cacheControl: "private, max-age=3600",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    if (message === "Unauthenticated") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    if (message.includes("Access denied")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes("Cannot export")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    console.error("[WorkflowExport] Error:", message);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
