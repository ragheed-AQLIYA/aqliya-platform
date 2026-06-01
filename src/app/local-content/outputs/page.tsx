import { unstable_noStore as noStore } from "next/cache";
import {
  listContentStudioOutputsAction,
  listContentStudioCampaignsAction,
  exportContentStudioOutputFormAction,
} from "@/actions/local-content-workspace-actions";
import {
  DashboardLayout,
  PageHeader,
  DevPhaseBadge,
  InlineNotice,
  EmptyState,
} from "@/components/local-content/local-content-shell";
import { ContentStudioNav } from "@/components/local-content/content-studio-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateContentOutputForm } from "@/components/local-content/create-content-output-form";

export const dynamic = "force-dynamic";

export default async function ContentOutputsPage({
  searchParams,
}: {
  searchParams: Promise<{ refresh?: string }>;
}) {
  const { refresh } = await searchParams;
  if (refresh === "1") {
    noStore();
  }

  const [outputsRes, campaignsRes] = await Promise.all([
    listContentStudioOutputsAction(),
    listContentStudioCampaignsAction(),
  ]);

  const outputs = outputsRes.ok ? outputsRes.data : [];
  const campaigns = campaignsRes.ok ? campaignsRes.data : [];
  const firstCampaignId = campaigns[0]?.id;

  return (
    <DashboardLayout>
      <PageHeader
        title="حزم المخرجات"
        subtitle="حزمة الحملة، التقويم، المحتوى المعتمد، مذكرة الامتثال"
      />
      <DevPhaseBadge />
      <ContentStudioNav />

      {!outputsRes.ok ? (
        <InlineNotice variant="error" title="خطأ" description={outputsRes.error} />
      ) : null}

      {!campaignsRes.ok ? (
        <InlineNotice
          variant="warning"
          title="تعذر تحميل الحملات"
          description={campaignsRes.error}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {outputs.length === 0 ? (
            <EmptyState
              title="لا توجد حزم مخرجات"
              description={
                firstCampaignId
                  ? "أنشئ حزمة من الحملة بعد اعتماد عناصر المحتوى. استخدم النموذج على اليمين أو انتقل إلى الحملة لإكمال مسار المراجعة."
                  : "أنشئ مشروع محتوى وحملة أولاً، ثم أرسل عناصر للمراجعة والاعتماد قبل تجميع حزمة المخرجات."
              }
              actionHref={
                firstCampaignId
                  ? undefined
                  : "/local-content/campaigns"
              }
              actionLabel={
                firstCampaignId ? undefined : "الانتقال إلى الحملات"
              }
            />
          ) : (
            outputs.map((pkg) => (
              <Card key={pkg.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium">{pkg.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pkg.createdAt).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                    <Badge variant="outline">{pkg.status}</Badge>
                  </div>
                  <ul className="text-xs mt-2 space-y-0.5 text-muted-foreground">
                    {pkg.includes.campaignSummary && <li>✓ ملخص الحملة</li>}
                    {pkg.includes.contentCalendar && <li>✓ تقويم المحتوى</li>}
                    {pkg.includes.approvedContent && <li>✓ المحتوى المعتمد</li>}
                    {pkg.includes.complianceMemo && <li>✓ مذكرة الامتثال</li>}
                  </ul>
                  {pkg.status !== "exported" ? (
                    <form action={exportContentStudioOutputFormAction} className="mt-3">
                      <input type="hidden" name="packageId" value={pkg.id} />
                      <Button type="submit" size="sm" variant="secondary">
                        تصدير (ADMIN)
                      </Button>
                    </form>
                  ) : (
                    <p className="text-xs text-green-600 mt-2">مُصدّر</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {firstCampaignId ? (
          <CreateContentOutputForm campaignId={firstCampaignId} />
        ) : (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">إنشاء حزمة</p>
              <p>
                أنشئ حملة من{" "}
                <a href="/local-content/campaigns" className="underline">
                  صفحة الحملات
                </a>{" "}
                لتتمكن من تجميع حزمة المخرجات.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
