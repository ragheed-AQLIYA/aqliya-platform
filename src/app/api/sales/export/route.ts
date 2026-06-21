import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSalesPermission } from "@/lib/sales/guards";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import { buildDownloadResponse } from "@/lib/platform/download";
import { checkRateLimit } from "@/lib/rate-limit";

// ─── Per-user rate limits (shared via Redis when RATE_LIMITER=redis) ───
const EXPORT_WINDOW_MS = 60_000;
const EXPORT_MAX = 10;

export async function GET(request: NextRequest) {
  try {
    // requireSalesPermission calls getCurrentUser internally (throws "Unauthenticated" if no session)
    // and asserts salesos:read permission.
    const ctx = await requireSalesPermission("salesos:read");
    const organizationId = ctx.organizationId;
    const user = ctx.user;

    const { allowed } = await checkRateLimit(user.id, {
      maxRequests: EXPORT_MAX,
      windowMs: EXPORT_WINDOW_MS,
    });
    if (!allowed) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    const [accounts, deals, openDeals, stageGroups, latestDeals] =
      await Promise.all([
        prisma.salesAccount.count({ where: { organizationId } }),
        prisma.salesDeal.count({ where: { organizationId } }),
        prisma.salesDeal.count({
          where: { organizationId, status: "open" },
        }),
        prisma.salesPipelineStage.findMany({
          where: { organizationId },
          orderBy: { sortOrder: "asc" },
          select: {
            name: true,
            _count: { select: { deals: true } },
          },
        }),
        prisma.salesDeal.findMany({
          where: { organizationId },
          select: {
            title: true,
            status: true,
            amount: true,
            currency: true,
            updatedAt: true,
            account: { select: { name: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 20,
        }),
      ]);

    // ─── Build CSV ───
    const rows: string[] = [
      ["title", "account", "status", "amount", "currency", "updatedAt"].join(
        ",",
      ),
    ];

    for (const d of latestDeals) {
      const safeTitle = `"${d.title.replace(/"/g, '""')}"`;
      const safeAccount = `"${d.account.name.replace(/"/g, '""')}"`;
      const amount = d.amount != null ? String(d.amount) : "";
      rows.push(
        [safeTitle, safeAccount, d.status, amount, d.currency ?? "SAR", d.updatedAt.toISOString()].join(","),
      );
    }

    const csvContent = rows.join("\n");

    // ─── Summary metadata ───
    const summaryLines = [
      `# SalesOS Export — ${new Date().toISOString()}`,
      `# Total accounts: ${accounts}`,
      `# Total deals: ${deals}`,
      `# Open deals: ${openDeals}`,
      ...stageGroups.map(
        (s) => `# Stage "${s.name}": ${s._count.deals} deals`,
      ),
      "",
    ];
    const fullContent = summaryLines.join("\n") + csvContent;

    // ─── Audit log ───
    const alog = auditLogger({
      productKey: Product.SALES_OS,
      sourceSystem: "sales_export",
      organization: { platformOrganizationId: ctx.platformOrganizationId ?? "" },
      actor: { id: user.id, name: user.name, type: user.role },
    });
    await alog.record(
      "export.dashboard",
      {
        type: "sales_dashboard_export",
        id: `sales-export-${Date.now()}`,
        label: "SalesOS dashboard export",
      },
      { metadata: { format: "csv", dealCount: latestDeals.length } },
    );

    return buildDownloadResponse({
      content: fullContent,
      filename: `salesos-export-${Date.now()}.csv`,
      mimeType: "text/csv; charset=utf-8",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthenticated") {
      return new NextResponse("Authentication required", { status: 401 });
    }
    if (error instanceof Error && error.message.includes("Access denied")) {
      return new NextResponse("Access denied", { status: 403 });
    }

    console.error("[SalesExport] Failed:", error);
    return new NextResponse("Failed to generate export", { status: 500 });
  }
}
