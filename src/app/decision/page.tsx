export const dynamic = "force-dynamic";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, FileText, ListChecks, Lightbulb, Target } from "lucide-react";
import { getDashboardMetrics, getDecisions } from "@/actions/decisions";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function getStatusBadge(status: string) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "secondary",
    IN_PROGRESS: "default",
    IN_REVIEW: "outline",
    APPROVED: "default",
    REJECTED: "destructive",
    WITHDRAWN: "outline",
  };
  return map[status] ?? "secondary";
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "مسودة",
    IN_PROGRESS: "قيد التنفيذ",
    IN_REVIEW: "قيد المراجعة",
    APPROVED: "معتمد",
    REJECTED: "مرفوض",
    WITHDRAWN: "مسحوب",
  };
  return map[status] ?? status;
}

function getPriorityColor(priority: string | null) {
  switch (priority) {
    case "CRITICAL": return "text-red-500";
    case "HIGH": return "text-orange-500";
    case "MEDIUM": return "text-yellow-500";
    case "LOW": return "text-green-500";
    default: return "text-muted-foreground";
  }
}

function getPriorityLabel(priority: string | null): string {
  const map: Record<string, string> = {
    CRITICAL: "حرج",
    HIGH: "عالية",
    MEDIUM: "متوسطة",
    LOW: "منخفضة",
  };
  return map[priority ?? ""] ?? priority ?? "—";
}

export default async function DecisionDashboardPage() {
  const [metricsResult, decisionsResult] = await Promise.all([
    getDashboardMetrics().catch(e => ({ success: false as const, error: (e as Error).message })),
    getDecisions().catch(e => ({ success: false as const, error: (e as Error).message })),
  ]);

  const errors: string[] = [];
  if (!metricsResult.success) errors.push(`المقاييس: ${metricsResult.error}`);
  if (!decisionsResult.success) errors.push(`القرارات: ${decisionsResult.error}`);

  const metrics = metricsResult.success ? metricsResult.data : null;
  const decisions = decisionsResult.success ? (decisionsResult.data ?? []) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">لوحة قرارات DecisionOS</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة القرارات المؤسسية، الأدلة، والموافقات
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/decisions">
            <Button variant="outline">عرض جميع القرارات</Button>
          </Link>
          <Link href="/decisions/new">
            <Button>قرار جديد</Button>
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="p-4 text-sm text-red-800 dark:text-red-200 space-y-1">
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* KPI cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي القرارات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalDecisions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.draftCount} مسودة · {metrics.inProgressCount} قيد التنفيذ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">قيد الاعتماد</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.pendingApproval}</div>
              <p className="text-xs text-muted-foreground mt-1">بانتظار الموافقة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">معتمدة</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.approvedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">قرار معتمد</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">الإنجاز</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgCompletion}%</div>
              <p className="text-xs text-muted-foreground mt-1">متوسط إنجاز القرارات</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Governance alerts */}
      {metrics && metrics.governanceMetrics.missingEvidenceCount > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium">تنبيهات الحوكمة</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {metrics.governanceMetrics.missingEvidenceCount > 0 && (
                  <li>{metrics.governanceMetrics.missingEvidenceCount} قرار بدون أدلة دعم</li>
                )}
                {metrics.governanceMetrics.inReviewWithoutEvidence > 0 && (
                  <li>{metrics.governanceMetrics.inReviewWithoutEvidence} قرار قيد المراجعة بدون أدلة</li>
                )}
                {metrics.governanceMetrics.highPriorityPendingApprovalCount > 0 && (
                  <li>{metrics.governanceMetrics.highPriorityPendingApprovalCount} قرار عالي الأولوية بانتظار الاعتماد</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decisions table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-4 w-4" />
            جميع القرارات
          </CardTitle>
          <CardDescription>
            {decisions.length} قرار — أحدث القرارات أولاً
          </CardDescription>
        </CardHeader>
        <CardContent>
          {decisions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="mx-auto h-8 w-8 mb-2 opacity-40" />
              <p>لا توجد قرارات بعد</p>
              <Link href="/decisions/new">
                <Button variant="outline" className="mt-3" size="sm">
                  إنشاء أول قرار
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>
                    <span className="sr-only">إجراءات</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decisions.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium max-w-[250px] truncate">
                      {d.title || "بدون عنوان"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{d.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={getPriorityColor(d.priority)}>
                        {getPriorityLabel(d.priority)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(d.status)}>
                        {getStatusLabel(d.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(d.createdAt)}</TableCell>
                    <TableCell>
                      <Link href={`/decisions/${d.id}`}>
                        <Button variant="ghost" size="sm">فتح</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary by status */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">توزيع القرارات حسب الحالة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(metrics.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2 text-sm border rounded-md px-3 py-1.5">
                  <Badge variant={getStatusBadge(status)}>
                    {getStatusLabel(status)}
                  </Badge>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
              {Object.keys(metrics.byStatus).length === 0 && (
                <p className="text-sm text-muted-foreground">لا توجد قرارات بعد</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
