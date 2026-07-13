import { NextRequest, NextResponse } from "next/server";
import {
  exportFinancialStatementsAction,
  exportAuditFileAction,
  exportBilingualAction,
} from "@/actions/audit-export-actions";
import { sanitizeError, sanitizeErrorResponse, httpStatusFromCode } from "@/lib/platform/api-error";
import { createLogger } from "@/lib/observability/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ engagementId: string; format: string }> },
) {
  const { engagementId, format } = await params;

  if (format !== "pdf" && format !== "xlsx" && format !== "bilingual") {
    return NextResponse.json(
      { error: `Unsupported format: ${format}. Use 'pdf', 'xlsx', or 'bilingual'.` },
      { status: 400 },
    );
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    if (format === "bilingual") {
      result = await exportBilingualAction(engagementId, "bilingual");
    } else if (format === "xlsx") {
      result = await exportAuditFileAction(engagementId);
    } else {
      result = await exportFinancialStatementsAction(engagementId);
    }

    const buffer = Buffer.from(result.buffer as string, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Content-Length": String(result.sizeBytes),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const logger = createLogger({ product: "audit", action: "exportEngagement" });
    const message = error instanceof Error ? error.message : "Export failed";
    logger.error("Export route failed", error as Error, { engagementId, format });
    if (message === "Unauthenticated") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    if (message.startsWith("Access denied")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    const { code } = sanitizeError(error);
    return NextResponse.json(sanitizeErrorResponse(error), { status: httpStatusFromCode(code) });
  }
}
