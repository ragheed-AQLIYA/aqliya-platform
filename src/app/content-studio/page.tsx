import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { Plus, FileText, CheckCircle2, Layers, Activity } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  listWorkspacesAction,
  getWorkspaceStatsAction,
} from "./actions";
import { WorkspaceCreateDialog } from "./workspace-create-dialog";

export const dynamic = "force-dynamic";

export default async function ContentStudioPage() {
  noStore();
  const user = await getCurrentUser();
  const wsRes = await listWorkspacesAction();
  const workspaces = wsRes.ok ? wsRes.data : [];

  const statsPromises = workspaces.map((ws) =>
    getWorkspaceStatsAction(ws.id),
  );
  const statsResults = await Promise.all(statsPromises);
  const statsMap = new Map<string, { total: number; publishedPct: number }>();
  for (let i = 0; i < workspaces.length; i++) {
    const s = statsResults[i];
    if (s.ok) {
      statsMap.set(workspaces[i].id, {
        total: s.data.totalContent,
        publishedPct: s.data.publishedPercentage,
      });
    }
  }

  const totalContent = Array.from(statsMap.values()).reduce(
    (sum, s) => sum + s.total,
    0,
  );
  const totalPublished = workspaces.reduce((sum, ws) => {
    const s = statsMap.get(ws.id);
    return sum + (s ? Math.round((s.total * s.publishedPct) / 100) : 0);
  }, 0);

  return (
    <div dir="rtl" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">استوديو المحتوى</h1>
          <p className="text-sm text-muted-foreground">
            إدارة مساحات العمل والمحتوى — إنشاء، مراجعة، موافقة، نشر
          </p>
        </div>
        <WorkspaceCreateDialog />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "مساحات العمل", value: workspaces.length, icon: Layers },
          { label: "إجمالي المحتوى", value: totalContent, icon: FileText },
          {
            label: "منشور",
            value: totalPublished,
            icon: CheckCircle2,
          },
          {
            label: "نشاط آخر 30 يومًا",
            value: workspaces.length,
            icon: Activity,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} size="sm">
            <CardContent className="p-4 text-center">
              <Icon className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!wsRes.ok ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          تعذر تحميل مساحات العمل: {wsRes.error}
        </div>
      ) : null}

      {wsRes.ok && workspaces.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-medium mb-1">لا توجد مساحات عمل</h3>
          <p className="text-sm text-muted-foreground mb-4">
            أنشئ مساحة عمل جديدة لبدء إدارة المحتوى
          </p>
          <WorkspaceCreateDialog />
        </div>
      ) : null}

      {wsRes.ok && workspaces.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => {
            const s = statsMap.get(ws.id);
            return (
              <Link key={ws.id} href={`/content-studio/${ws.id}`}>
                <Card className="hover:border-primary transition-colors h-full">
                  <CardHeader>
                    <CardTitle>{ws.name}</CardTitle>
                    {ws.description ? (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {ws.description}
                      </p>
                    ) : null}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="text-lg font-bold">
                          {s ? s.total : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          محتوى
                        </p>
                      </div>
                      {s && s.publishedPct > 0 ? (
                        <Badge variant="secondary">
                          {s.publishedPct}% منشور
                        </Badge>
                      ) : (
                        <Badge variant="outline">لا يوجد منشور</Badge>
                      )}
                    </div>
                    {ws.category ? (
                      <p className="text-xs text-muted-foreground mt-2">
                        {ws.category}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
