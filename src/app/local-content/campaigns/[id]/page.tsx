import { getContentStudioCampaignAction } from "@/actions/local-content-workspace-actions";
import {
  DashboardLayout,
  PageHeader,
  DevPhaseBadge,
  InlineNotice,
  EmptyState,
} from "@/components/local-content/local-content-shell";
import { ContentStudioNav } from "@/components/local-content/content-studio-nav";
import { CampaignContentItemForm } from "@/components/local-content/campaign-content-item-form";
import { CampaignContentSourceForm } from "@/components/local-content/campaign-content-source-form";
import { ContentItemStudioActions } from "@/components/local-content/content-item-studio-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getContentStudioCampaignAction(id);

  if (!res.ok) {
    if (res.error?.toLowerCase().includes("not found")) notFound();
    return (
      <DashboardLayout>
        <InlineNotice variant="error" title="خطأ" description={res.error} />
      </DashboardLayout>
    );
  }

  const { campaign, items, sources } = res.data;

  return (
    <DashboardLayout>
      <PageHeader title={campaign.name} subtitle={`حملة · ${campaign.status}`} />
      <DevPhaseBadge />
      <ContentStudioNav />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              <p>
                <strong>الهدف:</strong> {campaign.objective || "—"}
              </p>
              <p>
                <strong>القنوات:</strong> {campaign.channels.join(", ") || "—"}
              </p>
              <p>
                <strong>المصادر:</strong> {sources.length}
              </p>
            </CardContent>
          </Card>

          <h3 className="font-semibold">عناصر المحتوى</h3>
          {items.length === 0 ? (
            <EmptyState
              title="لا توجد عناصر محتوى"
              description="أضف عنصراً من النموذج على اليمين، ثم استخدم مساعدة المسودة (AI) وأرسله للمراجعة."
            />
          ) : (
            items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.format} · {item.status}
                      </p>
                    </div>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                  {item.body ? (
                    <pre className="mt-2 text-xs whitespace-pre-wrap bg-muted p-2 rounded max-h-40 overflow-y-auto">
                      {item.body.slice(0, 500)}
                    </pre>
                  ) : null}
                  <div className="mt-3">
                    <ContentItemStudioActions itemId={item.id} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-4">
          <CampaignContentItemForm campaignId={campaign.id} />
          <CampaignContentSourceForm campaignId={campaign.id} />
        </div>
      </div>
    </DashboardLayout>
  );
}
