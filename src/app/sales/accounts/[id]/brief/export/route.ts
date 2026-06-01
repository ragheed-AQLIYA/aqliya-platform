import { NextResponse } from "next/server";
import { isExpectedAccessDeniedError } from "@/lib/auth";
import {
  assertSalesAccountAccess,
  requireSalesPermission,
  SalesAccessError,
} from "@/lib/sales/guards";
import {
  buildAccountBriefExportHtml,
  loadAccountBriefPack,
} from "@/lib/sales/account-brief-pack";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const ctx = await requireSalesPermission("salesos:read");
    await assertSalesAccountAccess(id);

    const pack = await loadAccountBriefPack(id, {
      organizationId: ctx.organizationId,
      platformOrganizationId: ctx.platformOrganizationId,
    });

    if (!pack) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const html = buildAccountBriefExportHtml(pack);
    const safeName = pack.accountName.replace(
      /[^a-zA-Z0-9_\-\u0600-\u06FF]/g,
      "_",
    );

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="account-brief-${safeName}.html"`,
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
