import {
  listContentStudioCampaignsAction,
  listContentStudioProjectsAction,
} from "@/actions/local-content-workspace-actions";
import {
  DashboardLayout,
  PageHeader,
  DevPhaseBadge,
  InlineNotice,
  EmptyState,
} from "@/components/local-content/local-content-shell";
import { ContentStudioNav } from "@/components/local-content/content-studio-nav";
import { CreateContentProjectForm } from "@/components/local-content/create-content-project-form";
import { CreateCampaignForm } from "@/components/local-content/create-campaign-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ContentCampaignsPage() {
  const [campaignsRes, projectsRes] = await Promise.all([
    listContentStudioCampaignsAction(),
    listContentStudioProjectsAction(),
  ]);

  const campaigns = campaignsRes.ok ? campaignsRes.data : [];
  const projects = projectsRes.ok ? projectsRes.data : [];
  const firstProjectId = projects[0]?.id;

  return (
    <DashboardLayout>
      <PageHeader
        title="الحملات"
        subtitle="Content Studio — إدارة حملات المحتوى المحلي"
      />
      <DevPhaseBadge />
      <ContentStudioNav />

      {!campaignsRes.ok ? (
        <InlineNotice
          variant="error"
          title="تعذر تحميل الحملات"
          description={campaignsRes.error}
        />
      ) : null}

      {!projectsRes.ok ? (
        <InlineNotice
          variant="error"
          title="تعذر تحميل مشاريع المحتوى"
          description={projectsRes.error}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {campaigns.length === 0 ? (
            <EmptyState
              title="لا توجد حملات بعد"
              description="أنشئ مشروع محتوى من النموذج على اليمين، ثم أضف حملة لبدء Content Studio."
              actionHref="/local-content"
              actionLabel="العودة إلى مركز القيادة"
            />
          ) : (
            campaigns.map((c) => (
              <Link key={c.id} href={`/local-content/campaigns/${c.id}`}>
                <Card className="hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-semibold">{c.name}</h2>
                      <Badge variant="outline">{c.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {c.channels.join(", ") || "—"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        <div className="space-y-4">
          <CreateContentProjectForm />
          {firstProjectId ? (
            <CreateCampaignForm contentProjectId={firstProjectId} />
          ) : (
            <p className="text-xs text-muted-foreground">
              أنشئ مشروع محتوى أولاً لتتمكن من إنشاء حملة.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
