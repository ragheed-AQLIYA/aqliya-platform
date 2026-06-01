import Link from "next/link";
import { notFound } from "next/navigation";
import {
  activateCampaignFormAction,
  createContentStudioItemFormAction,
  createContentStudioSourceFormAction,
  getContentStudioCampaignAction,
} from "@/actions/local-content-workspace-actions";
import { ContentStudioNav } from "@/components/local-content/content-studio-nav";
import {
  DashboardLayout,
  DevPhaseBadge,
  InlineNotice,
  PageHeader,
} from "@/components/local-content/local-content-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getContentStudioCampaignAction(id);
  if (!res.ok) {
    if (res.error?.includes("not found")) notFound();
    return (
      <DashboardLayout>
        <InlineNotice variant="error" title="خطأ" description={res.error} />
      </DashboardLayout>
    );
  }

  const { campaign, items, sources, project } = res.data;

  return (
    <DashboardLayout>
      <PageHeader title={campaign.name} subtitle={project?.title ?? campaign.objective} />
      <ContentStudioNav />
      <DevPhaseBadge />

      <div className="mb-4 flex items-center gap-2">
        <Badge variant="outline">{campaign.status}</Badge>
        {campaign.status === "draft" ? (
          <form action={activateCampaignFormAction.bind(null, campaign.id)}>
            <Button size="sm" type="submit">
              تفعيل الحملة
            </Button>
          </form>
        ) : null}
        <Link href="/local-content/campaigns" className="text-sm text-muted-foreground">
          ← العودة للحملات
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-semibold mb-3">مصادر / Evidence</h2>
          <form
            action={createContentStudioSourceFormAction}
            className="mb-4 rounded-lg border p-3 space-y-2"
          >
            <input type="hidden" name="campaignId" value={campaign.id} />
            <div>
              <Label htmlFor="title">عنوان المصدر</Label>
              <Input id="title" name="title" required />
            </div>
            <div>
              <Label htmlFor="type">النوع</Label>
              <select
                id="type"
                name="type"
                className="flex h-9 w-full rounded-md border px-3 text-sm"
                defaultValue="url"
              >
                <option value="url">URL</option>
                <option value="note">Note</option>
                <option value="file">File ref</option>
              </select>
            </div>
            <Input name="url" placeholder="URL (optional)" />
            <Input name="note" placeholder="Note (optional)" />
            <Button size="sm" type="submit">
              إضافة مصدر
            </Button>
          </form>
          <div className="space-y-2">
            {sources.map((s) => (
              <Card key={s.id} className="p-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="font-medium">{s.title}</span>
                  <Badge variant="outline">{s.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {s.url ?? s.note ?? s.type}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-3">عناصر المحتوى</h2>
          <form
            action={createContentStudioItemFormAction}
            className="mb-4 rounded-lg border p-3 space-y-2"
          >
            <input type="hidden" name="campaignId" value={campaign.id} />
            <div>
              <Label htmlFor="itemTitle">العنوان / الفكرة</Label>
              <Input id="itemTitle" name="title" required />
            </div>
            <div>
              <Label htmlFor="format">الصيغة</Label>
              <select
                id="format"
                name="format"
                className="flex h-9 w-full rounded-md border px-3 text-sm"
                defaultValue="article"
              >
                <option value="article">Article</option>
                <option value="social_post">Social post</option>
                <option value="newsletter">Newsletter</option>
                <option value="script">Script</option>
              </select>
            </div>
            <Button size="sm" type="submit">
              إنشاء عنصر محتوى
            </Button>
          </form>
          <div className="space-y-2">
            {items.map((item) => (
              <Card key={item.id} className="p-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="font-medium">{item.title}</span>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.format}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
