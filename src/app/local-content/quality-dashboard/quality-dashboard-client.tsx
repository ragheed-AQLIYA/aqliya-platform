// ─── LocalContentOS — AI Quality Dashboard Client ───
// Displays AI quality metrics: acceptance rates, confidence, health, risk.

"use client";

import Link from "next/link";
import type { AiQualityMetrics } from "@/actions/localcontent-quality-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Brain,
  BarChart3,
  Activity,
  Clock,
  TrendingUp,
  ShieldCheck,
  FileText,
  GitBranch,
} from "lucide-react";

interface Props {
  metrics: AiQualityMetrics;
}

function ScoreBar({ score, size = "md" }: { score: number | null; size?: "sm" | "md" | "lg" }) {
  if (score === null) return <span className="text-muted-foreground text-sm">—</span>;
  const color =
    score >= 80 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  const h = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  return (
    <div className="flex items-center gap-2">
      <div className={`w-full ${h} rounded-full bg-gray-200`}>
        <div
          className={`${h} rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className={`font-bold shrink-0 ${size === "sm" ? "text-xs" : "text-sm"}`}>
        {score}%
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    partial: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  };
  const labels: Record<string, string> = {
    completed: "مكتمل",
    partial: "جزئي",
    failed: "فشل",
    in_progress: "قيد التشغيل",
  };
  return (
    <Badge variant="outline" className={colors[status] ?? "bg-gray-100"}>
      {labels[status] ?? status}
    </Badge>
  );
}

function MetricCard({
  title,
  titleAr,
  value,
  subtitle,
  icon: Icon,
  color = "text-primary",
  trend,
}: {
  title: string;
  titleAr: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  trend?: "up" | "down" | "neutral";
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

export function QualityDashboardClient({ metrics }: Props) {
  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("ar-SA");
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">جودة الذكاء الاصطناعي</h1>
          <p className="text-sm text-muted-foreground">
            AI Quality Dashboard — مقاييس دقة وجودة مخرجات AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/local-content/review-center">
            <Button variant="outline" size="sm">
              ← مركز المراجعة
            </Button>
          </Link>
          <Link href="/local-content/ai-advisor">
            <Button variant="outline" size="sm">
              ← المستشار الذكي
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 1: Overview metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          title="Suggestions"
          titleAr="الاقتراحات"
          value={metrics.totalSuggestions}
          subtitle={`${metrics.approvedSuggestions} معتمد · ${metrics.rejectedSuggestions} مرفوض · ${metrics.pendingSuggestions} معلق`}
          icon={Brain}
          color="text-purple-600"
        />
        <MetricCard
          title="Acceptance Rate"
          titleAr="معدل القبول"
          value={metrics.suggestionAcceptanceRate !== null ? `${metrics.suggestionAcceptanceRate}%` : "—"}
          subtitle={`من ${metrics.approvedSuggestions + metrics.rejectedSuggestions} مقترح`}
          icon={TrendingUp}
          color={metrics.suggestionAcceptanceRate !== null && metrics.suggestionAcceptanceRate >= 70 ? "text-green-600" : "text-amber-600"}
        />
        <MetricCard
          title="Avg Confidence"
          titleAr="متوسط الثقة"
          value={metrics.avgSuggestionConfidence !== null ? `${metrics.avgSuggestionConfidence}%` : "—"}
          subtitle="للاقتراحات"
          icon={BarChart3}
          color={metrics.avgSuggestionConfidence !== null && metrics.avgSuggestionConfidence >= 70 ? "text-green-600" : "text-amber-600"}
        />
        <MetricCard
          title="Pipeline Runs"
          titleAr="تشغيلات pipeline"
          value={metrics.totalReviewRuns}
          subtitle={`${metrics.completedRuns} مكتمل · ${metrics.failedRuns} فشل`}
          icon={Activity}
          color={metrics.failedRuns === 0 ? "text-green-600" : "text-amber-600"}
        />
      </div>

      {/* Row 2: Explanations + Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Explanations Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              تفسيرات الحسابات / Account Explanations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 border rounded">
                <p className="text-lg font-bold text-blue-600">{metrics.totalExplanations}</p>
                <p className="text-xs text-muted-foreground">إجمالي</p>
              </div>
              <div className="text-center p-2 border rounded">
                <p className="text-lg font-bold text-green-600">{metrics.confirmedExplanations}</p>
                <p className="text-xs text-muted-foreground">مؤكد</p>
              </div>
              <div className="text-center p-2 border rounded">
                <p className="text-lg font-bold text-red-600">{metrics.falsePositives}</p>
                <p className="text-xs text-muted-foreground">FP</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">معدل FP</span>
                <span className="font-bold">{metrics.falsePositiveRate !== null ? `${metrics.falsePositiveRate}%` : "—"}</span>
              </div>
              <ScoreBar score={metrics.falsePositiveRate !== null ? 100 - metrics.falsePositiveRate : null} size="sm" />
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">متوسط الثقة</span>
                <span className="font-bold">{metrics.avgExplanationConfidence !== null ? `${metrics.avgExplanationConfidence}%` : "—"}</span>
              </div>
              <ScoreBar score={metrics.avgExplanationConfidence} size="sm" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">توزيع المخاطر</p>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  عالي: {metrics.highRiskCount}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  متوسط: {metrics.mediumRiskCount}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  منخفض: {metrics.lowRiskCount}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pattern Health Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              صحة الأنماط / Pattern Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 border rounded">
                <p className="text-lg font-bold text-green-600">{metrics.highPerformingRecords}</p>
                <p className="text-xs text-muted-foreground">عالية الأداء</p>
              </div>
              <div className="text-center p-2 border rounded">
                <p className="text-lg font-bold text-blue-600">{metrics.activeRecords}</p>
                <p className="text-xs text-muted-foreground">نشطة</p>
              </div>
              <div className="text-center p-2 border rounded">
                <p className="text-lg font-bold text-amber-600">{metrics.decayingRecords}</p>
                <p className="text-xs text-muted-foreground">متدهورة</p>
              </div>
              <div className="text-center p-2 border rounded">
                <p className="text-lg font-bold text-red-600">{metrics.obsoleteRecords}</p>
                <p className="text-xs text-muted-foreground">مهملة</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">متوسط درجة الصحة</span>
                <span className="font-bold">{metrics.avgHealthScore !== null ? `${metrics.avgHealthScore}%` : "—"}</span>
              </div>
              <ScoreBar score={metrics.avgHealthScore} size="sm" />
            </div>

            <div className="pt-2 border-t">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">ذاكرة التنظيم</p>
                  <p className="font-bold">{metrics.totalOrgMemoryRecords}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">تجاوزات يدوية</p>
                  <p className="font-bold">{metrics.manualOverrides}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">أنماط قطاعية</p>
                  <p className="font-bold">{metrics.totalIndustryPatterns}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">متوسط الفعالية</p>
                  <p className="font-bold">{metrics.avgEffectiveness !== null ? `${metrics.avgEffectiveness}%` : "—"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Pipeline Runs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            تشغيلات pipeline / Pipeline Runs
          </CardTitle>
          <CardDescription className="text-xs">
            آخر 10 تشغيلات للمراجعة الذكية
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.recentRuns.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <p>لا توجد تشغيلات بعد. شغّل pipeline المراجعة الذكية من صفحة الدفتر.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">الحالة</th>
                    <th className="pb-2 font-medium">التفسيرات</th>
                    <th className="pb-2 font-medium">الاقتراحات</th>
                    <th className="pb-2 font-medium">FP</th>
                    <th className="pb-2 font-medium">تاريخ التشغيل</th>
                    <th className="pb-2 font-medium">المدة</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentRuns.map((run) => (
                    <tr key={run.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2">
                        <StatusBadge status={run.status} />
                      </td>
                      <td className="py-2">{run.explanationsGenerated}</td>
                      <td className="py-2">{run.patternSuggestions}</td>
                      <td className="py-2">{run.falsePositives}</td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {formatDate(run.startedAt)}
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {run.durationMs > 0 ? `${(run.durationMs / 1000).toFixed(1)}s` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row 4: Summary + Actions */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>
              <strong>{metrics.totalExplanationsGenerated}</strong> تفسير تم توليده
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-500" />
            <span>
              <strong>{metrics.totalPatternSuggestions}</strong> اقتراح نمط
            </span>
          </div>
          {metrics.lastRunAt && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                آخر تشغيل: {formatDate(metrics.lastRunAt)}
                {metrics.lastRunDuration ? ` (${(metrics.lastRunDuration / 1000).toFixed(1)}s)` : ""}
              </span>
            </div>
          )}
        </div>
        <Badge
          variant="outline"
          className={
            metrics.lastRunStatus === "completed"
              ? "bg-green-100 text-green-800"
              : metrics.lastRunStatus === "failed"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100"
          }
        >
          {metrics.lastRunStatus === "completed"
            ? "آخر تشغيل ناجح ✅"
            : metrics.lastRunStatus === "failed"
              ? "آخر تشغيل فاشل ❌"
              : "لا توجد تشغيلات سابقة"}
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/local-content/review-center">
          <Button variant="default" size="sm">
            <CheckCircle2 className="ml-1 h-4 w-4" />
            مراجعة الاقتراحات المعلقة ({metrics.pendingSuggestions})
          </Button>
        </Link>
        <Link href="/local-content/ai-advisor">
          <Button variant="outline" size="sm">
            <Brain className="ml-1 h-4 w-4" />
            المستشار الذكي
          </Button>
        </Link>
        <Link href="/local-content/pilot-readiness">
          <Button variant="outline" size="sm">
            <ShieldCheck className="ml-1 h-4 w-4" />
            الجاهزية التشغيلية
          </Button>
        </Link>
        <Link href="/local-content/workbook">
          <Button variant="outline" size="sm">
            <FileText className="ml-1 h-4 w-4" />
            محرك الدفتر
          </Button>
        </Link>
      </div>
    </div>
  );
}
