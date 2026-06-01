import Link from "next/link";
import {
  listPendingOpportunityReviewsAction,
  listPendingReviewDraftsAction,
} from "@/actions/sales-review-list-actions";
import { getCurrentUser } from "@/lib/auth";
import { getSalesPermissionsForRole } from "@/lib/sales/permissions";
import { OutreachReviewQueue } from "@/components/sales/deal-outreach-panel";
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

export default async function SalesReviewPage() {
  const user = await getCurrentUser();
  const { canCreate, canUpdate, canReview } = getSalesPermissionsForRole(user.role);
  const [govRes, outreachRes] = await Promise.all([
    listPendingOpportunityReviewsAction(),
    listPendingReviewDraftsAction(),
  ]);

  const governance = govRes.ok ? govRes.data : [];
  const outreach = outreachRes.ok ? outreachRes.data : [];

  return (
    <div dir="rtl">
      <SalesNavLinks active="review" canCreate={canCreate} />
      <SalesPageHeader
        title="مراجعة SalesOS"
        subtitle="حوكمة الفرص (L5) + مراجعة outreach — بشرية، مع سجل تدقيق"
      />
      <SalesPhaseBadge phase="pr9" />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/sales/approval"
          className="rounded-lg border p-4 text-sm hover:bg-muted/50"
        >
          <span className="font-medium">قائمة الاعتماد →</span>
          <p className="mt-1 text-muted-foreground">
            SalesApproval · يتطلب migrate
          </p>
        </Link>
        <Link
          href="/sales/evidence"
          className="rounded-lg border p-4 text-sm hover:bg-muted/50"
        >
          <span className="font-medium">أدلة المنظمة →</span>
          <p className="mt-1 text-muted-foreground">
            SalesEvidenceLink · مراجع Core
          </p>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">مراجعات الفرص (L5)</CardTitle>
        </CardHeader>
        <CardContent>
          {!govRes.ok ? (
            <SalesInlineNotice
              variant="error"
              title="تعذر تحميل مراجعات الحوكمة"
              description={govRes.error}
            />
          ) : governance.length === 0 ? (
            <SalesEmptyState
              title="لا مراجعات فرص معلّقة"
              description="قد تكون القرارات في metadata.reviewDecisions حتى يُطبَّق migrate. استخدم لوحة القرار على صفحة الصفقة."
            />
          ) : (
            <ul className="space-y-3 text-sm">
              {governance.map((row) => (
                <li key={row.id} className="rounded-md border p-3">
                  <Badge variant="outline" className="mb-2">
                    {row.reviewType}
                  </Badge>
                  <p>{row.reason}</p>
                  {row.deal ? (
                    <Link
                      href={`/sales/deals/${row.deal.id}`}
                      className="mt-2 inline-block text-primary hover:underline"
                    >
                      {row.deal.title}
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          {!canReview ? (
            <p className="mt-4 text-xs text-muted-foreground">
              الاعتماد/الرفض يتطلب salesos:review (OPERATOR/ADMIN).
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">مراجعة outreach</CardTitle>
        </CardHeader>
        <CardContent>
          {!outreachRes.ok ? (
            <SalesInlineNotice
              variant="error"
              title="تعذر تحميل مسودات outreach"
              description={outreachRes.error}
            />
          ) : (
            <OutreachReviewQueue items={outreach} canReview={canUpdate} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
