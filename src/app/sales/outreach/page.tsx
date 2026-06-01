import {
  listPendingReviewDraftsAction,
} from "@/actions/sales-actions";
import { OutreachReviewQueue } from "@/components/sales/deal-outreach-panel";
import {
  SalesNavLinks,
  SalesPageHeader,
  SalesPhaseBadge,
  SalesInlineNotice,
} from "@/components/sales/sales-shell";
import { getCurrentUser } from "@/lib/auth";
import { getSalesPermissionsForRole } from "@/lib/sales/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SalesOutreachReviewPage() {
  const user = await getCurrentUser();
  const { canCreate, canUpdate } = getSalesPermissionsForRole(user.role);
  const queueRes = await listPendingReviewDraftsAction();

  return (
    <div dir="rtl">
      <SalesNavLinks active="outreach" canCreate={canCreate} />
      <SalesPageHeader
        title="مراجعة outreach"
        subtitle="قائمة pending_review — org-scoped · لا إرسال خارجي"
      />
      <SalesPhaseBadge phase="pr9" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">مسودات بانتظار المراجعة</CardTitle>
        </CardHeader>
        <CardContent>
          {!queueRes.ok ? (
            <SalesInlineNotice
              variant="error"
              title="تعذر تحميل قائمة المراجعة"
              description={queueRes.error}
            />
          ) : (
            <OutreachReviewQueue
              items={queueRes.data}
              canReview={canUpdate}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
