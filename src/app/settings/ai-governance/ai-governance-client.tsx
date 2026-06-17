// ─── AI Governance Dashboard Client ───
// Displays AI governance statistics across all AQLIYA products.

"use client";

import type { AiGovernanceStats } from "@/actions/ai-governance-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Clock,
  FileText,
  GitBranch,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-unused-vars */

interface Props {
  stats: AiGovernanceStats | null;
  error: string | null;
}

function StatCard({
  title,
  titleAr,
  value,
  subtitle,
  icon: Icon,
  color = "text-primary",
}: {
  title: string;
  titleAr: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{titleAr}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="shrink-0 mr-3">
            <Icon className={`h-6 w-6 ${color} opacity-70`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    partial: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    recorded: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    pending: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };
  return (
    <Badge variant="outline" className={colors[status] ?? "bg-gray-100"}>
      {status}
    </Badge>
  );
}

export function AiGovernanceClient({ stats, error }: Props) {
  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("ar-SA");
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">حوكمة الذكاء الاصطناعي</h1>
          <p className="text-sm text-muted-foreground">
            AI Governance Dashboard — سجل مركزي لنشاط AI عبر جميع المنتجات
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/local-content/quality-dashboard">
            <Button variant="outline" size="sm">
              ← جودة AI
            </Button>
          </Link>
          <Link href="/settings/audit-logs">
            <Button variant="outline" size="sm">
              ← سجل التدقيق
            </Button>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4 flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">تعذر تحميل بيانات الحوكمة: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!error && !stats && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Brain className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>لا توجد بيانات حوكمة AI بعد</p>
            <p className="text-sm mt-1">
              تظهر البيانات بعد تشغيل ميزات AI في المنتجات
            </p>
          </CardContent>
        </Card>
      )}

      {stats && (
        <>
          {/* Principle Banner */}
          <div className="rounded-lg border-2 border-blue-300 bg-blue-50 dark:bg-blue-950/20 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-blue-600 shrink-0" />
              <div>
                <p className="text-sm font-bold">مبدأ الحوكمة / Governance Principle</p>
                <p className="text-xs text-muted-foreground">
                  AI assists. Humans decide. Evidence governs. —
                  الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  لا يصدر AI قرارات نهائية. جميع مخرجات AI تخضع للمراجعة البشرية.
                </p>
              </div>
            </div>
          </div>

          {/* Row 1: Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              title="Total AI Actions"
              titleAr="إجمالي إجراءات AI"
              value={stats.totalAiActions}
              subtitle="عبر جميع المنتجات"
              icon={Activity}
              color="text-blue-600"
            />
            <StatCard
              title="Success Rate"
              titleAr="معدل النجاح"
              value={
                stats.lcTotalEvents > 0
                  ? `${Math.round((stats.lcSuccessCount / stats.lcTotalEvents) * 100)}%`
                  : "—"
              }
              subtitle={`${stats.lcSuccessCount} نجاح · ${stats.lcFailedCount} فشل`}
              icon={TrendingUp}
              color={stats.lcFailedCount === 0 ? "text-green-600" : "text-amber-600"}
            />
            <StatCard
              title="Avg Confidence"
              titleAr="متوسط الثقة"
              value={stats.lcAvgConfidence !== null ? `${stats.lcAvgConfidence}%` : "—"}
              subtitle="لمخرجات LocalContentOS"
              icon={BarChart3}
              color={stats.lcAvgConfidence !== null && stats.lcAvgConfidence >= 70 ? "text-green-600" : "text-amber-600"}
            />
            <StatCard
              title="Total Warnings"
              titleAr="إجمالي التحذيرات"
              value={stats.totalWarnings}
              subtitle={`من ${stats.lcTotalEvents} حدث`}
              icon={AlertTriangle}
              color={stats.totalWarnings === 0 ? "text-green-600" : "text-amber-600"}
            />
          </div>

          {/* Row 2: Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Models & Providers */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  النماذج والمزودون / Models & Providers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">عدد النماذج الفريدة</span>
                    <span className="font-medium">{stats.totalAiModels}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المزودون</span>
                    <span className="font-medium">
                      {stats.uniqueProviders.length > 0
                        ? stats.uniqueProviders.join("، ")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">متوسط المدة</span>
                    <span className="font-medium">
                      {stats.lcAvgDurationMs !== null
                        ? `${(stats.lcAvgDurationMs / 1000).toFixed(1)}s`
                        : "—"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-blue-600" />
                  توزيع الإجراءات / Action Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.lcActionsBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد إجراءات بعد</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {stats.lcActionsBreakdown.map(({ action, count }) => (
                      <div key={action} className="flex items-center gap-2 text-sm">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded shrink-0 max-w-[180px] truncate">
                          {action}
                        </code>
                        <div className="flex-1 h-3 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            className="h-full rounded bg-blue-500 transition-all"
                            style={{
                              width: `${(count / stats.lcActionsBreakdown[0].count) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="font-medium text-xs w-8 text-left">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Recent Events */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                آخر الأحداث / Recent AI Events
              </CardTitle>
              <CardDescription className="text-xs">
                آخر 20 نشاط AI عبر المنتجات
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentEvents.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <p>لا توجد أحداث AI مسجلة بعد</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 font-medium">المصدر</th>
                        <th className="pb-2 font-medium">الإجراء</th>
                        <th className="pb-2 font-medium">الحالة</th>
                        <th className="pb-2 font-medium">الثقة</th>
                        <th className="pb-2 font-medium">المزود</th>
                        <th className="pb-2 font-medium">النموذج</th>
                        <th className="pb-2 font-medium">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentEvents.map((event) => (
                        <tr key={event.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-2">
                            <Badge
                              variant="outline"
                              className={
                                event.source === "localcontent"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }
                            >
                              {event.source === "localcontent" ? "LC" : "Platform"}
                            </Badge>
                          </td>
                          <td className="py-2 max-w-[160px] truncate">
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {event.action}
                            </code>
                          </td>
                          <td className="py-2">
                            <StatusBadge status={event.status} />
                          </td>
                          <td className="py-2">
                            {event.confidence !== null ? `${event.confidence}%` : "—"}
                          </td>
                          <td className="py-2 text-xs text-muted-foreground">
                            {event.providerId ?? "—"}
                          </td>
                          <td className="py-2 text-xs text-muted-foreground">
                            {event.modelVersion ?? "—"}
                          </td>
                          <td className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(event.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Governance Rules */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                قواعد حوكمة AI / AI Governance Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2 p-2 border rounded">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>AI يصدر اقتراحات فقط — الموافقة النهائية بيد الإنسان</span>
                </div>
                <div className="flex items-start gap-2 p-2 border rounded">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>جميع إجراءات AI مسجلة في سجل التدقيق</span>
                </div>
                <div className="flex items-start gap-2 p-2 border rounded">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>مخرجات AI تحمل درجة ثقة ومعلومات المصدر</span>
                </div>
                <div className="flex items-start gap-2 p-2 border rounded">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>لا يصدر AI قرارات نهائية أو تراخيص أو شهادات</span>
                </div>
                <div className="flex items-start gap-2 p-2 border rounded">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>جميع المخرجات مدعومة بأدلة ومراجع</span>
                </div>
                <div className="flex items-start gap-2 p-2 border rounded">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>البيانات الحساسة لا تُرسل لمزودين خارجيين بدون ضوابط</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/local-content/quality-dashboard">
              <Button variant="outline" size="sm">
                ← جودة AI المحتوى المحلي
              </Button>
            </Link>
            <Link href="/local-content/review-center">
              <Button variant="outline" size="sm">
                ← مركز مراجعة AI
              </Button>
            </Link>
            <Link href="/settings/audit-logs">
              <Button variant="outline" size="sm">
                ← سجل التدقيق
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
