export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ScrollText, X } from "lucide-react";

function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: "default" | "success" | "warning" | "destructive";
}) {
  const colors: Record<string, string> = {
    default: "",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    destructive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[variant]}`}
    >
      {label}
    </span>
  );
}

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    productKey?: string;
    showTest?: string;
    limit?: string;
  }>;
}) {
  const sp = await searchParams;
  const productKey = sp.productKey;
  const showTest = sp.showTest;
  const rawLimit = Number(sp.limit) || 25;
  const limit = Math.min(Math.max(rawLimit, 1), 100);

  // ─── Build filter ───

  const where: Record<string, unknown> = {};

  if (productKey) {
    where.productKey = productKey;
  }

  if (showTest === "true") {
    // Only rows with metadata.test = true (JSON path comparison)
    // Simpler: filter by known test actions
    where.OR = [
      { action: "verify.platform_audit_log_write" },
      { action: "platform.dual_write_test" },
    ];
  } else if (showTest === "false") {
    where.NOT = {
      OR: [
        { action: "verify.platform_audit_log_write" },
        { action: "platform.dual_write_test" },
      ],
    };
  }

  // ─── Queries ───

  const total = await prisma.platformAuditLog.count();
  const testRows = await prisma.platformAuditLog.count({
    where: {
      action: {
        in: ["verify.platform_audit_log_write", "platform.dual_write_test"],
      },
    },
  });
  const auditOsRows = await prisma.platformAuditLog.count({
    where: { productKey: "audit_os" },
  });
  const missingPlatformOrg = await prisma.platformAuditLog.count({
    where: { platformOrganizationId: null },
  });
  const missingWorkspace = await prisma.platformAuditLog.count({
    where: { clientWorkspaceId: null },
  });
  const missingProject = await prisma.platformAuditLog.count({
    where: { projectId: null },
  });
  const products = await prisma.platformAuditLog.groupBy({
    by: ["productKey"],
    _count: true,
  });

  const recentLogs = await prisma.platformAuditLog.findMany({
    where: where as never,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const filteredCount = await prisma.platformAuditLog.count({
    where: where as never,
  });

  // ─── Active filters ───

  const activeFilters: { key: string; label: string; value: string }[] = [];
  if (productKey)
    activeFilters.push({
      key: "productKey",
      label: "Product",
      value: productKey,
    });
  if (showTest === "true")
    activeFilters.push({ key: "showTest", label: "Test", value: "true" });
  if (showTest === "false")
    activeFilters.push({ key: "showTest", label: "Test", value: "false" });

  function clearFilterHref(removeKey: string): string {
    const params = new URLSearchParams();
    for (const f of activeFilters) {
      if (f.key !== removeKey) params.set(f.key, f.value);
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }

  return (
    <main className="p-8 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <ScrollText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Unified Platform Audit Log</h1>
      </div>

      <p className="text-sm text-muted-foreground mb-8">
        This page is for unified platform audit log visibility only. It shows
        PlatformAuditLog records across all products.
      </p>

      {/* Summary Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
          <CardDescription>
            Total row counts (ignores current filters)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-md border text-center">
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="p-3 rounded-md border text-center">
              <p className="text-2xl font-bold">{auditOsRows}</p>
              <p className="text-xs text-muted-foreground">AuditOS</p>
            </div>
            <div className="p-3 rounded-md border text-center">
              <p className="text-2xl font-bold">{testRows}</p>
              <p className="text-xs text-muted-foreground">Test</p>
            </div>
            <div className="p-3 rounded-md border text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {missingPlatformOrg}
              </p>
              <p className="text-xs text-muted-foreground">No Org</p>
            </div>
            <div className="p-3 rounded-md border text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {missingWorkspace}
              </p>
              <p className="text-xs text-muted-foreground">No Ws</p>
            </div>
            <div className="p-3 rounded-md border text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {missingProject}
              </p>
              <p className="text-xs text-muted-foreground">No Proj</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Products:</span>
            {products.map((p) => (
              <Link key={p.productKey} href={`?productKey=${p.productKey}`}>
                <Badge
                  variant="outline"
                  className="text-[10px] cursor-pointer hover:bg-muted"
                >
                  {p.productKey}: {p._count}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Recent Entries</CardTitle>
          <CardDescription>
            {filteredCount} matching row{filteredCount !== 1 ? "s" : ""}
            {limit < 100 ? ` (showing up to ${limit})` : ""}
          </CardDescription>
        </CardHeader>

        {/* Filter bar */}
        <div className="px-6 pb-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Filters:</span>
          {activeFilters.length === 0 ? (
            <span className="text-xs text-muted-foreground italic">
              None active
            </span>
          ) : (
            activeFilters.map((f) => (
              <Link
                key={f.key}
                href={clearFilterHref(f.key)}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] hover:bg-muted-foreground/20 transition-colors"
              >
                <span className="text-muted-foreground">{f.label}:</span>
                <span>{f.value}</span>
                <X className="h-3 w-3" />
              </Link>
            ))
          )}
          {showTest !== "false" && (
            <Link
              href="?showTest=false"
              className="text-[11px] text-muted-foreground hover:underline ml-auto"
            >
              Hide test rows
            </Link>
          )}
          {showTest === "false" && (
            <Link
              href="?"
              className="text-[11px] text-muted-foreground hover:underline ml-auto"
            >
              Show all rows
            </Link>
          )}
        </div>

        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No matching audit log entries.
            </p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-md border text-xs ${
                    !!(
                      log.metadata as unknown as Record<string, unknown> | null
                    )?.test
                      ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
                      : log.severity === "critical" || log.severity === "error"
                        ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                        : "border-muted bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(log.createdAt).toLocaleString("en-SA", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[9px] h-4 px-1.5"
                      >
                        {log.productKey}
                      </Badge>
                      <span className="font-medium">{log.action}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!!(
                        log.metadata as unknown as Record<
                          string,
                          unknown
                        > | null
                      )?.test && (
                        <Badge
                          variant="outline"
                          className="text-[9px] h-4 px-1.5 bg-yellow-100 text-yellow-800 border-yellow-200"
                        >
                          TEST
                        </Badge>
                      )}
                      <StatusBadge
                        label={log.severity}
                        variant={
                          log.severity === "info"
                            ? "default"
                            : log.severity === "warning"
                              ? "warning"
                              : "destructive"
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                    {log.actorName && (
                      <span>
                        Actor:{" "}
                        <span className="text-foreground">{log.actorName}</span>
                        {log.actorType ? ` (${log.actorType})` : ""}
                      </span>
                    )}
                    {log.targetType && (
                      <span>
                        Target:{" "}
                        <span className="text-foreground font-mono">
                          {log.targetType}
                        </span>
                        {log.targetId && `/${log.targetId.slice(0, 12)}...`}
                      </span>
                    )}
                    {log.sourceSystem && (
                      <span>
                        Source:{" "}
                        <span className="text-foreground">
                          {log.sourceSystem}
                        </span>
                        {log.sourceModel && `/${log.sourceModel}`}
                      </span>
                    )}
                    {log.platformOrganizationId && (
                      <span>
                        Org:{" "}
                        <span className="text-foreground font-mono">
                          {log.platformOrganizationId.slice(0, 12)}...
                        </span>
                      </span>
                    )}
                    {log.clientWorkspaceId && (
                      <span>
                        Ws:{" "}
                        <span className="text-foreground font-mono">
                          {log.clientWorkspaceId.slice(0, 12)}...
                        </span>
                      </span>
                    )}
                    {log.projectId && (
                      <span>
                        Proj:{" "}
                        <span className="text-foreground font-mono">
                          {log.projectId.slice(0, 12)}...
                        </span>
                      </span>
                    )}
                    {log.status && log.status !== "recorded" && (
                      <span>
                        Status:{" "}
                        <span className="text-foreground">{log.status}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
