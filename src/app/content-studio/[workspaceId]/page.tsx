import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Plus, FileText } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getWorkspaceAction,
  listContentAction,
  getWorkspaceStatsAction,
} from "../actions";
import type { ContentStatusValue, ContentItem } from "@/lib/platform/content-studio";

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

async function ContentList({
  workspaceId,
  filter,
}: {
  workspaceId: string;
  filter?: ContentStatusValue;
}) {
  const res = await listContentAction(workspaceId, filter);
  const items = res.ok ? res.data : [];

  if (!res.ok) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        تعذر تحميل المحتوى: {res.error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <FileText className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          لا يوجد محتوى في هذه الحالة
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item: ContentItem) => (
        <Link
          key={item.id}
          href={`/content-studio/${workspaceId}/${item.id}`}
          className="block"
        >
          <Card className="hover:border-primary transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium truncate">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.summary || item.body.slice(0, 100) || "—"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={STATUS_VARIANTS[item.status] ?? "outline"}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      v{item.version} · {item.locale === "ar" ? "عربي" : "English"}
                    </span>
                    {item.contentType ? (
                      <Badge variant="outline" className="text-[10px]">
                        {item.contentType}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  noStore();
  const { workspaceId } = await params;
  const [wsRes, statsRes] = await Promise.all([
    getWorkspaceAction(workspaceId),
    getWorkspaceStatsAction(workspaceId),
  ]);
  if (!wsRes.ok) notFound();
  const ws = wsRes.data;
  const stats = statsRes.ok ? statsRes.data : null;

  const tabs = [
    { key: undefined, label: "الكل" },
    { key: "DRAFT" as ContentStatusValue, label: "مسودة" },
    { key: "IN_REVIEW" as ContentStatusValue, label: "قيد المراجعة" },
    { key: "APPROVED" as ContentStatusValue, label: "معتمد" },
    { key: "PUBLISHED" as ContentStatusValue, label: "منشور" },
    { key: "ARCHIVED" as ContentStatusValue, label: "مؤرشف" },
  ];

  return (
    <div dir="rtl" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Link
        href="/content-studio"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى مساحات العمل
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{ws.name}</h1>
          {ws.description ? (
            <p className="text-sm text-muted-foreground">{ws.description}</p>
          ) : null}
          {ws.category ? (
            <Badge variant="outline" className="mt-2">
              {ws.category}
            </Badge>
          ) : null}
        </div>
        <Link href={`/content-studio/${workspaceId}/create`}>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            محتوى جديد
          </Button>
        </Link>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "إجمالي المحتوى", value: stats.totalContent },
            { label: "منشور", value: stats.contentByStatus["PUBLISHED"] ?? 0 },
            { label: "% النشر", value: `${stats.publishedPercentage}%` },
            { label: "إصدارات", value: stats.totalVersions },
          ].map(({ label, value }) => (
            <Card key={label} size="sm">
              <CardContent className="p-4 text-center">
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Tabs defaultValue={undefined as unknown as string}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.label} value={tab.key ?? "__all"}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.label} value={tab.key ?? "__all"}>
            <ContentList workspaceId={workspaceId} filter={tab.key} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
