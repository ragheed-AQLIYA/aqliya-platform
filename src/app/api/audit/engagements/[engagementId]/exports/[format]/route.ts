import { NextRequest, NextResponse } from "next/server";
import { exportEngagementAction } from "@/actions/audit-export-actions";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ engagementId: string; format: string }> },
) {
  const { engagementId, format } = await params;

  if (format !== "pdf" && format !== "xlsx") {
    return NextResponse.json(
      { error: `Unsupported format: ${format}. Use 'pdf' or 'xlsx'.` },
      { status: 400 },
    );
  }

  try {
    const result = await exportEngagementAction(engagementId, format);

    const buffer = Buffer.from(result.buffer as string, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Content-Length": String(result.sizeBytes),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    if (message === "Unauthenticated") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    if (message.startsWith("Access denied")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
