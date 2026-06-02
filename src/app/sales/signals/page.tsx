import Link from "next/link";
import { listOrgSalesSignalsAction } from "@/actions/sales-actions";
import {
  SalesNavLinks,
  SalesPageHeader,
  SalesPhaseBadge,
  SalesInlineNotice,
  SalesEmptyState,
} from "@/components/sales/sales-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getSalesPermissionsForRole } from "@/lib/sales/permissions";
import {
  signalSeverityLabelAr,
  signalTypeLabelAr,
} from "@/lib/sales/signals";
import { Activity, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

const SEVERITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
};

export default async function SalesSignalsPage() {
  const user = await getCurrentUser();
  const { canCreate } = getSalesPermissionsForRole(user.role);
  const res = await listOrgSalesSignalsAction();

  if (!res.ok) {
    return (
      <div dir="rtl">
        <SalesNavLinks active="signals" canCreate={canCreate} />
        <SalesInlineNotice
          variant="error"
          title="تعذر تحميل الإشارات"
          description={res.error}
        />
      </div>
    );
  }

  const signals = res.data;

  return (
    <div dir="rtl">
      <SalesNavLinks active="signals" canCreate={canCreate} />
      <SalesPageHeader
        title="إشارات المبيعات"
        subtitle="قائمة org-scoped — metadata على الحسابات (حد 50 إشارة/حساب)"
      />
      <SalesPhaseBadge />

      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
        SalesOS v0.3 PR-8 — stub للإشارات. لا CRM كامل ولا جمع تلقائي خارجي.
      </div>

      {signals.length === 0 ? (
        <SalesEmptyState
          title="لا إشارات بعد"
          description="سجّل إشارات من صفحة الحساب أو شغّل seed-sales-demo."
        />
      ) : (
        <div className="space-y-3">
          {signals.map((signal) => (
            <Card key={`${signal.accountId}-${signal.id}`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium flex items-center gap-1">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      {signal.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-1">
                      <span>{signalTypeLabelAr(signal.type)}</span>
                      <span>·</span>
                      <Link
                        href={`/sales/accounts/${signal.accountId}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <Building2 className="h-3 w-3" />
                        {signal.accountName}
                      </Link>
                      {signal.source ? (
                        <>
                          <span>·</span>
                          <span>{signal.source}</span>
                        </>
                      ) : null}
                      <span>·</span>
                      <span>
                        {new Date(signal.detectedAt).toLocaleString("ar-SA")}
                      </span>
                    </p>
                  </div>
                  {signal.severity ? (
                    <Badge
                      variant="outline"
                      className={SEVERITY_COLORS[signal.severity] ?? ""}
                    >
                      {signalSeverityLabelAr(signal.severity)}
                    </Badge>
                  ) : null}
                </div>
                {signal.summary ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    {signal.summary}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
