// @ts-nocheck
import Link from "next/link";
import {
  listPendingOpportunityReviewsAction,
  listOrgSalesApprovalsAction,
} from "@/actions/sales-actions";
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

type PendingReviewRow = {
  id: string;
  status: string;
  reason: string | null;
  deal: { id: string; title: string } | null;
};

type ApprovalRow = {
  id: string;
  status: string;
  kind: string;
  note: string | null;
  deal: { id: string; title: string } | null;
};

export default async function SalesApprovalPage() {
  const user = await getCurrentUser();
  const { canCreate, canReview } = getSalesPermissionsForRole(user.role);
  const [pendingRes, approvalsRes] = await Promise.all([
    listPendingOpportunityReviewsAction(),
    listOrgSalesApprovalsAction(),
  ]);

  const pending = (pendingRes.ok ? pendingRes.data : []) as PendingReviewRow[];
  const approvals = (approvalsRes.ok ? approvalsRes.data : []) as ApprovalRow[];

  return (
    <div dir="rtl">
      <SalesNavLinks active="approval" canCreate={canCreate} />
      <SalesPageHeader
        title="قائمة الاعتماد"
        subtitle="SalesReview + SalesApproval — يتطلب migrate L5 على قاعدة البيانات"
      />
      <SalesPhaseBadge phase="pr9" />

      {!canReview ? (
        <SalesInlineNotice
          variant="warning"
          title="صلاحية المراجعة مطلوبة"
          description="دور VIEWER: قراءة فقط. OPERATOR/ADMIN: salesos:review"
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">مراجعات معلّقة</CardTitle>
          </CardHeader>
          <CardContent>
            {!pendingRes.ok ? (
              <SalesInlineNotice
                variant="error"
                title="تعذر التحميل"
                description={pendingRes.error}
              />
            ) : pending.length === 0 ? (
              <SalesEmptyState
                title="لا توجد مراجعات معلّقة"
                description="بعد migrate: submit من صفحة الصفقة. قبل migrate: قد تظهر القائمة فارغة مع استمرار metadata."
              />
            ) : (
              <ul className="space-y-3 text-sm">
                {pending.map((row) => (
                  <li key={row.id} className="rounded-md border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{row.status}</Badge>
                      <span className="font-medium">{row.reason}</span>
                    </div>
                    {row.deal ? (
                      <p className="mt-2 text-muted-foreground">
                        <Link
                          href={`/sales/deals/${row.deal.id}`}
                          className="text-primary hover:underline"
                        >
                          {row.deal.title}
                        </Link>
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">سجل الاعتمادات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            {!approvalsRes.ok ? (
              <SalesInlineNotice
                variant="error"
                title="تعذر التحميل"
                description={approvalsRes.error}
              />
            ) : approvals.length === 0 ? (
              <SalesEmptyState
                title="لا توجد اعتمادات بعد"
                description="شغّل seed-sales-l5.ts بعد migrate deploy."
              />
            ) : (
              <ul className="space-y-3 text-sm">
                {approvals.map((row) => (
                  <li key={row.id} className="rounded-md border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{row.status}</Badge>
                      <span>{row.kind}</span>
                    </div>
                    {row.deal ? (
                      <p className="mt-1 text-muted-foreground">
                        {row.deal.title}
                      </p>
                    ) : null}
                    {row.note ? (
                      <p className="mt-1 text-xs">{row.note}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
