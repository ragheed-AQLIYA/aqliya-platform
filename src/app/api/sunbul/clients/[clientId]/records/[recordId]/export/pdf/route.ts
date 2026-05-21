import { NextRequest, NextResponse } from "next/server";
import { exportSunbulRecord } from "@/lib/sunbul/export";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clientId: string; recordId: string }> },
) {
  try {
    const { clientId, recordId } = await params;

    const result = await exportSunbulRecord({ clientId, recordId });

    const body = new Uint8Array(result.buffer);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Content-Length": String(result.sizeBytes),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    if (message.includes("Access denied")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message.includes("Cannot export")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    console.error("[SunbulExport] Error:", message);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
