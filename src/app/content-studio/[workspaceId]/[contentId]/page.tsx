import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, FileText } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getContentAction, getVersionHistoryAction } from "../../actions";
import { ContentLifecycleActions } from "./content-lifecycle-actions";
import type { ContentVersion } from "@/lib/platform/content-studio";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "مسودة",
  IN_REVIEW: "قيد المراجعة",
  APPROVED: "معتمد",
  PUBLISHED: "منشور",
  ARCHIVED: "مؤرشف",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"> = {
  DRAFT: "outline",
  IN_REVIEW: "secondary",
  APPROVED: "default",
  PUBLISHED: "default",
  ARCHIVED: "ghost",
};

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string; contentId: string }>;
}) {
  noStore();
  const { workspaceId, contentId } = await params;

  const [contentRes, versionsRes] = await Promise.all([
    getContentAction(contentId),
    getVersionHistoryAction(contentId),
  ]);

  if (!contentRes.ok) notFound();
  const content = contentRes.data;
  const versions: ContentVersion[] = versionsRes.ok ? versionsRes.data : [];

  return (
    <div dir="rtl" className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <Link
        href={`/content-studio/${workspaceId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4" />
        العودة
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{content.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant={STATUS_VARIANTS[content.status] ?? "outline"}
                    >
                      {STATUS_LABELS[content.status] ?? content.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      v{content.version} ·{" "}
                      {content.locale === "ar" ? "عربي" : "English"}
                    </span>
                    {content.contentType ? (
                      <Badge variant="outline">{content.contentType}</Badge>
                    ) : null}
                  </div>
                </div>
                <ContentLifecycleActions
                  contentId={content.id}
                  status={content.status}
                  workspaceId={workspaceId}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.summary ? (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  {content.summary}
                </div>
              ) : null}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {content.body}
              </div>
              {content.tags && content.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {content.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
              <div className="text-xs text-muted-foreground border-t pt-3">
                تم الإنشاء: {new Date(content.createdAt).toLocaleDateString("ar-SA")}
                {content.publishedAt
                  ? ` · النشر: ${new Date(content.publishedAt).toLocaleDateString("ar-SA")}`
                  : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                سجل الإصدارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {versions.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  لا توجد إصدارات سابقة
                </p>
              ) : (
                <div className="space-y-2">
                  {versions.map((v: ContentVersion) => (
                    <div
                      key={v.id}
                      className="rounded-lg border p-2 text-xs"
                    >
                      <div className="font-medium">
                        v{v.version} —{" "}
                        {new Date(v.createdAt).toLocaleDateString("ar-SA")}
                      </div>
                      {v.changeSummary ? (
                        <p className="text-muted-foreground mt-0.5">
                          {v.changeSummary}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                معلومات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المعرف</span>
                <span className="font-mono">{content.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الإصدار</span>
                <span>{content.version}</span>
              </div>
              {content.templateId ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">القالب</span>
                  <span>{"قالب " + content.templateId.slice(0, 6) + "..."}</span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
