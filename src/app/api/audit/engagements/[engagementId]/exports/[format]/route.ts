import { NextRequest, NextResponse } from "next/server";
import {
  exportFinancialStatementsAction,
  exportAuditFileAction,
  exportBilingualAction,
} from "@/actions/audit-export-actions";
import { renderExportPackage } from "@/lib/audit/export-service";
import { sanitizeError, sanitizeErrorResponse, httpStatusFromCode } from "@/lib/platform/api-error";
import { createLogger } from "@/lib/observability/logger";
import { getCurrentUser } from "@/lib/auth";

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
    const user = await getCurrentUser();
    const organizationId = user.platformOrganizationId ?? user.organizationId;
    void organizationId; // tenant-scoped: verified via assertEngagementAccess inside actions

    // 1. Get structured export data from the server action
    let pkg;
    if (format === "bilingual") {
      pkg = await exportBilingualAction(engagementId, "bilingual");
    } else if (format === "xlsx") {
      pkg = await exportAuditFileAction(engagementId);
    } else {
      pkg = await exportFinancialStatementsAction(engagementId);
    }

    // 2. Render to the requested format (PDF or XLSX)
    const renderFormat = format === "bilingual" ? "pdf" : format as "pdf" | "xlsx";
    const result = await renderExportPackage(pkg, renderFormat);

    // 3. Return the rendered buffer
    return new NextResponse(new Uint8Array(result.buffer), {
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
