import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { AuditPortfolioSnapshot } from "@/lib/audit/portfolio-analytics";

const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

export function PortfolioAnalyticsPanel({
  snapshot,
}: {
  snapshot: AuditPortfolioSnapshot;
}) {
  const { totals } = snapshot;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">التكليفات</div>
          <div className="text-2xl font-bold">{totals.engagements}</div>
          <div className="text-xs text-muted-foreground mt-1">
            نشطة: {totals.active}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">نتائج مفتوحة</div>
          <div className="text-2xl font-bold text-amber-600">
            {totals.openFindings}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">أدلة ناقصة</div>
          <div className="text-2xl font-bold text-red-600">
            {totals.missingEvidence}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">جاهزة للاعتماد</div>
          <div className="text-2xl font-bold text-green-600">
            {totals.readyForApproval}
          </div>
        </div>
      </div>

      {Object.keys(snapshot.byStatus).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(snapshot.byStatus).map(([status, count]) => (
            <Badge key={status} variant="outline">
              {status}: {count}
            </Badge>
          ))}
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <div className="border-b px-4 py-3 font-semibold text-sm">
          محفظة التكليفات (A1-07)
        </div>
        {snapshot.rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground text-center">
            لا توجد تكليفات في المنظمة.
          </p>
        ) : (
          <ul className="divide-y">
            {snapshot.rows.map((row) => (
              <li
                key={row.engagementId}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <Link
                    href={`/audit/engagements/${row.engagementId}`}
                    className="font-medium hover:underline"
                  >
                    {row.clientName}
                  </Link>
                  <span className="text-muted-foreground mx-2">·</span>
                  <span className="text-muted-foreground">{row.fiscalPeriod}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={riskColors[row.riskBand]}>
                    {row.riskBand === "high"
                      ? "خطر عالٍ"
                      : row.riskBand === "medium"
                        ? "متوسط"
                        : "منخفض"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    نتائج {row.openFindings} · أدلة {row.missingEvidence}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground">{snapshot.disclaimerAr}</p>
    </div>
  );
}
