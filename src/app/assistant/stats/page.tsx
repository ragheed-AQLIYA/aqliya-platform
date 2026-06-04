import { unstable_noStore as noStore } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getAssistantStats } from "@/actions/office-ai-stats";
import { getCategoryLabel } from "@/lib/office-ai/taxonomy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  finalized: "مُعتمد",
  rejected: "مرفوض",
  archived: "مؤرشف",
};

const STATUS_VARIANTS: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
  draft: "secondary",
  finalized: "default",
  rejected: "destructive",
  archived: "outline",
};

export default async function AssistantStatsPage() {
  noStore();
  const user = await getCurrentUser();
  const orgId = user.platformOrganizationId || user.organizationId;
  const stats = await getAssistantStats(orgId);

  if (stats.totalTasks === 0) {
    return (
      <div className="p-6 space-y-4" dir="rtl">
        <h1 className="text-2xl font-bold">إحصائيات المساعد</h1>
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <p>لا توجد مهام بعد. ابدأ بإنشاء مهمة في صفحة المساعد.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold">إحصائيات المساعد</h1>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي المهام</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي المخرجات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalOutputs}</p>
            <p className="text-xs text-muted-foreground mt-1">
              معدل {stats.averageOutputsPerTask.toFixed(1)} لكل مهمة
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي الملفات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalFiles}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks by type */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع المهام حسب النوع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(stats.tasksByType).map(([cat, count]) => (
              <div key={cat} className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-sm font-medium">{getCategoryLabel(cat === "summarization" ? "summarize" : cat === "content_creation" ? "draft" : "analyze")}</span>
                <span className="text-xl font-bold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>حالة المهام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(stats.tasksByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <Badge variant={STATUS_VARIANTS[status] || "outline"}>
                  {STATUS_LABELS[status] || status}
                </Badge>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent tasks */}
      <Card>
        <CardHeader>
          <CardTitle>آخر المهام</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title || "—"}</TableCell>
                  <TableCell>{getCategoryLabel(task.taskType)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[task.status] || "outline"}>
                      {STATUS_LABELS[task.status] || task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(task.createdAt).toLocaleDateString("ar-SA")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
