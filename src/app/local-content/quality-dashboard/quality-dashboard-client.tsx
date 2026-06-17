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

      {/* Quality Score Banner */}
      {(() => {
        const scores: number[] = [];
        if (metrics.suggestionAcceptanceRate !== null) scores.push(metrics.suggestionAcceptanceRate);
        if (metrics.avgSuggestionConfidence !== null) scores.push(metrics.avgSuggestionConfidence);
        if (metrics.avgExplanationConfidence !== null) scores.push(metrics.avgExplanationConfidence);
        const pipelineSuccessRate =
          metrics.totalReviewRuns > 0
            ? Math.round((metrics.completedRuns / metrics.totalReviewRuns) * 100)
            : null;
        if (pipelineSuccessRate !== null) scores.push(pipelineSuccessRate);
        const compositeScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
        const scoreColor =
          compositeScore === null
            ? "border-gray-200"
            : compositeScore >= 80
              ? "border-green-400 bg-green-50 dark:bg-green-950/20"
              : compositeScore >= 50
                ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                : "border-red-400 bg-red-50 dark:bg-red-950/20";
        const scoreLabel =
          compositeScore === null
            ? "لا توجد بيانات كافية"
            : compositeScore >= 80
              ? "جودة عالية / High Quality"
              : compositeScore >= 50
                ? "جودة متوسطة / Moderate Quality"
                : "جودة منخفضة / Low Quality";
        return (
          <div className={`rounded-lg border-2 p-4 ${scoreColor}`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className={`h-8 w-8 ${compositeScore !== null && compositeScore >= 80 ? "text-green-600" : "text-amber-600"}`} />
                <div>
                  <p className="text-sm font-bold">مؤشر جودة AI / AI Quality Score</p>
                  <p className="text-xs text-muted-foreground">{scoreLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black">{compositeScore !== null ? `${compositeScore}%` : "—"}</p>
                  <p className="text-[10px] text-muted-foreground">Composite</p>
                </div>
                {scores.length > 0 && (
                  <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                    <span>↗ ACC {metrics.suggestionAcceptanceRate ?? "—"}%</span>
                    <span>↗ CONF {metrics.avgSuggestionConfidence ?? "—"}%</span>
                    <span>✓ PIPELINE {pipelineSuccessRate ?? "—"}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

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

      {/* Row 2: Confidence Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            توزيع الثقة / Confidence Distribution
          </CardTitle>
          <CardDescription className="text-xs">
            عدد العناصر في كل نطاق ثقة (الاقتراحات والتفسيرات)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Suggestions */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                الاقتراحات / Suggestions
              </p>
              <div className="space-y-1.5">
                {[
                  { label: "0–25%", color: "bg-red-400", idx: 0 },
                  { label: "25–50%", color: "bg-amber-400", idx: 1 },
                  { label: "50–75%", color: "bg-blue-400", idx: 2 },
                  { label: "75–100%", color: "bg-green-400", idx: 3 },
                ].map(({ label, color, idx }) => {
                  const count = metrics.suggestionConfidenceBuckets[idx];
                  const total = Math.max(1, metrics.suggestionConfidenceBuckets.reduce((a, b) => a + b, 0));
                  const pct = (count / total) * 100;
                  return (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="w-12 shrink-0 text-muted-foreground">{label}</span>
                      <div className="flex-1 h-4 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className={`h-full rounded ${color} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-left font-medium">{count} ({Math.round(pct)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Explanations */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                التفسيرات / Explanations
              </p>
              <div className="space-y-1.5">
                {[
                  { label: "0–25%", color: "bg-red-400", idx: 0 },
                  { label: "25–50%", color: "bg-amber-400", idx: 1 },
                  { label: "50–75%", color: "bg-blue-400", idx: 2 },
                  { label: "75–100%", color: "bg-green-400", idx: 3 },
                ].map(({ label, color, idx }) => {
                  const count = metrics.explanationConfidenceBuckets[idx];
                  const total = Math.max(1, metrics.explanationConfidenceBuckets.reduce((a, b) => a + b, 0));
                  const pct = (count / total) * 100;
                  return (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="w-12 shrink-0 text-muted-foreground">{label}</span>
                      <div className="flex-1 h-4 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className={`h-full rounded ${color} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-left font-medium">{count} ({Math.round(pct)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 3: Time-Series Acceptance Rate */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            اتجاه معدل القبول / Acceptance Rate Trend
          </CardTitle>
          <CardDescription className="text-xs">
            أسبوعي — عدد المقترحات المعتمدة مقابل الإجمالي
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.acceptanceOverTime.every((p) => p.total === 0) ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              لا توجد بيانات كافية لرسم الاتجاه
            </div>
          ) : (
            <div className="flex items-end justify-around gap-3 pt-2">
              {metrics.acceptanceOverTime.map((p, i) => {
                const barH = p.total > 0 ? Math.max(4, (p.total / Math.max(...metrics.acceptanceOverTime.map((x) => x.total))) * 100) : 4;
                const filledH = p.total > 0 ? (p.approved / p.total) * barH : 0;
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <p className="text-[10px] font-medium">{p.rate !== null ? `${p.rate}%` : "—"}</p>
                    <div className="w-full flex justify-center">
                      <div className="w-6 sm:w-8 rounded-t relative" style={{ height: `${Math.max(4, barH)}px` }}>
                        <div
                          className="absolute bottom-0 w-full rounded-t bg-blue-500 transition-all duration-500"
                          style={{ height: `${Math.max(0, filledH)}px` }}
                        />
                        <div
                          className="absolute bottom-0 w-full rounded-t bg-gray-200"
                          style={{ height: `${Math.max(0, barH)}px`, zIndex: -1 }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span>{p.approved}/{p.total}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground">{p.label}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row 4: Explanations + Health */}
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

      {/* Row 5: Pipeline Runs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            تشغيلات pipeline / Pipeline Runs
          </CardTitle>
          <CardDescription className="text-xs">
            آخر 10 تشغيلات للمراجعة الذكية — حجم الشريط يتناسب مع إجمالي المخرجات
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
                    <th className="pb-2 font-medium">الإجمالي</th>
                    <th className="pb-2 font-medium">تاريخ التشغيل</th>
                    <th className="pb-2 font-medium">المدة</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentRuns.map((run, i) => {
                    const total = run.explanationsGenerated + run.patternSuggestions + run.falsePositives;
                    const maxTotal = Math.max(
                      1,
                      ...metrics.recentRuns.map(
                        (r) => r.explanationsGenerated + r.patternSuggestions + r.falsePositives,
                      ),
                    );
                    const barWidth = (total / maxTotal) * 100;
                    return (
                      <tr key={run.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2">
                          <StatusBadge status={run.status} />
                        </td>
                        <td className="py-2">{run.explanationsGenerated}</td>
                        <td className="py-2">{run.patternSuggestions}</td>
                        <td className="py-2">{run.falsePositives}</td>
                        <td className="py-2 min-w-[80px]">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              <div
                                className={`h-full rounded transition-all duration-500 ${
                                  i === 0 ? "bg-primary" : "bg-gray-400"
                                }`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{total}</span>
                          </div>
                        </td>
                        <td className="py-2 text-xs text-muted-foreground">
                          {formatDate(run.startedAt)}
                        </td>
                        <td className="py-2 text-xs text-muted-foreground">
                          {run.durationMs > 0 ? `${(run.durationMs / 1000).toFixed(1)}s` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row 6: Summary + Actions */}
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
