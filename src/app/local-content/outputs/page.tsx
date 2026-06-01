import {
  createContentStudioOutputFormAction,
  exportOutputFormAction,
  listContentStudioCampaignsAction,
  listContentStudioOutputsAction,
} from "@/actions/local-content-workspace-actions";
import { ContentStudioNav } from "@/components/local-content/content-studio-nav";
import {
  DashboardLayout,
  DevPhaseBadge,
  EmptyState,
  InlineNotice,
  PageHeader,
} from "@/components/local-content/local-content-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function ContentOutputsPage() {
  const [outputsRes, campaignsRes] = await Promise.all([
    listContentStudioOutputsAction(),
    listContentStudioCampaignsAction(),
  ]);
  const outputs = outputsRes.ok ? outputsRes.data : [];
  const campaigns = campaignsRes.ok ? campaignsRes.data : [];

  return (
    <DashboardLayout>
      <PageHeader
        title="حزم المخرجات"
        subtitle="Campaign package, calendar, approved content, compliance memo"
      />
      <ContentStudioNav />
      <DevPhaseBadge />

      {!outputsRes.ok ? (
        <InlineNotice variant="error" title="تعذر التحميل" description={outputsRes.error} />
      ) : null}

      <form
        action={createContentStudioOutputFormAction}
        className="mb-6 rounded-lg border p-4 space-y-3"
      >
        <h3 className="font-semibold text-sm">إنشاء حزمة مخرجات</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="campaignId">الحملة</Label>
            <select
              id="campaignId"
              name="campaignId"
              required
              className="flex h-9 w-full rounded-md border px-3 text-sm"
            >
              <option value="">اختر الحملة</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="title">عنوان الحزمة</Label>
            <Input id="title" name="title" defaultValue="Output Package" />
          </div>
        </div>
        <Button type="submit" disabled={campaigns.length === 0}>
          إنشاء حزمة
        </Button>
      </form>

      {outputs.length === 0 ? (
        <EmptyState title="لا توجد حزم" description="أنشئ حزمة مخرجات من حملة معتمدة." />
      ) : (
        <div className="space-y-3">
          {outputs.map((o) => (
            <Card key={o.id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">{o.title}</h3>
                <p className="text-xs text-muted-foreground">Campaign: {o.campaignId}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{o.status}</Badge>
                {o.status !== "exported" ? (
                  <form action={exportOutputFormAction.bind(null, o.id)}>
                    <Button size="sm" type="submit">
                      تصدير (ADMIN)
                    </Button>
                  </form>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
