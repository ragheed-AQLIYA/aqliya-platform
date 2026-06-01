import Link from "next/link";
import { listOrgSalesActivitiesAction } from "@/actions/sales-actions";
import { getCurrentUser } from "@/lib/auth";
import { getSalesPermissionsForRole } from "@/lib/sales/permissions";
import {
  SalesNavLinks,
  SalesPageHeader,
  SalesPhaseBadge,
  SalesEmptyState,
  SalesInlineNotice,
} from "@/components/sales/sales-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  call: "مكالمة",
  email: "بريد",
  meeting: "اجتماع",
  note: "ملاحظة",
  other: "أخرى",
};

export default async function SalesActivitiesPage() {
  const user = await getCurrentUser();
  const { canCreate } = getSalesPermissionsForRole(user.role);
  const res = await listOrgSalesActivitiesAction({ limit: 100 });
  const items = res.ok ? res.data : [];

  return (
    <div dir="rtl">
      <SalesNavLinks active="activities" canCreate={canCreate} />
      <SalesPageHeader
        title="الأنشطة"
        subtitle="SalesInteraction — org-scoped · لا مزامنة بريد/تقويم"
      />
      <SalesPhaseBadge phase="pr9" />

      {!res.ok ? (
        <SalesInlineNotice
          variant="error"
          title="تعذر تحميل الأنشطة"
          description={res.error}
        />
      ) : items.length === 0 ? (
        <SalesEmptyState
          title="لا توجد أنشطة مسجّلة"
          description="سجّل نشاطاً من صفحة الصفقة أو الحساب، أو شغّل seed-sales-l5.ts بعد migrate."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">آخر الأنشطة ({items.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-md border p-3 text-sm"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      {TYPE_LABELS[item.type] ?? item.type}
                    </Badge>
                    <span className="font-medium">
                      {item.subject ?? "—"}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {item.account.name}
                    {item.deal ? ` · ${item.deal.title}` : ""}
                  </p>
                  {item.summary ? (
                    <p className="mt-1 text-xs">{item.summary}</p>
                  ) : null}
                </div>
                <div className="text-left text-xs text-muted-foreground">
                  <time dateTime={item.occurredAt.toISOString()}>
                    {item.occurredAt.toLocaleString("ar-SA")}
                  </time>
                  {item.deal ? (
                    <p className="mt-1">
                      <Link
                        href={`/sales/deals/${item.deal.id}`}
                        className="text-primary hover:underline"
                      >
                        فتح الصفقة
                      </Link>
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
