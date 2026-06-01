import { NextResponse } from "next/server";
import { isExpectedAccessDeniedError } from "@/lib/auth";
import {
  assertSalesDealAccess,
  requireSalesPermission,
  SalesAccessError,
} from "@/lib/sales/guards";
import {
  buildPilotHandoffExportHtml,
  loadPilotHandoffPack,
} from "@/lib/sales/pilot-handoff-pack";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await requireSalesPermission("salesos:read");
    await assertSalesDealAccess(id);

    const ctx = await requireSalesPermission("salesos:read");
    const pack = await loadPilotHandoffPack(id, {
      organizationId: ctx.organizationId,
      platformOrganizationId: ctx.platformOrganizationId,
    });

    if (!pack) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const html = buildPilotHandoffExportHtml(pack);
    const safeName = pack.dealTitle.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, "_");

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="pilot-handoff-${safeName}.html"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof SalesAccessError) {
      const status = error.code === "NOT_FOUND" ? 404 : 403;
      return NextResponse.json({ error: error.message }, { status });
    }
    if (isExpectedAccessDeniedError(error)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
