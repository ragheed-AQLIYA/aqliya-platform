"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminDashboardMetrics,
  exportMetricsCSV,
} from "@/actions/workflowos-admin-actions";
import { checkSlaStatus } from "@/actions/workflowos-sla-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
  Activity,
  RefreshCw,
} from "lucide-react";

interface DashboardData {
  metrics: {
    totalActive: number;
    overdueCount: number;
    completedToday: number;
    completedThisWeek: number;
    completedThisMonth: number;
    avgCompletionHours: number | null;
  };
  compliance: {
    onTime: number;
    breached: number;
    complianceRate: number;
    byPriority: Record<string, { total: number; onTime: number; rate: number }>;
  };
  stepBreakdown: {
    stepType: string;
    count: number;
    avgHours: number | null;
    minHours: number | null;
    maxHours: number | null;
  }[];
  avgCompletion: {
    avgHours: number | null;
    recordCount: number;
  };
  throughput: {
    date: string;
    completed: number;
    created: number;
  }[];
}

const STEP_TYPE_LABELS: Record<string, string> = {
  review: "مراجعة",
  approval: "اعتماد",
  evidence_upload: "رفع دليل",
  notification: "إشعار",
  escalation: "تصعيد",
  unknown: "غير معروف",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "منخفض",
  medium: "متوسط",
  high: "عالي",
  urgent: "عاجل",
};

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg ${color.replace("text", "bg")}/10`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StepBar({ label, avg, max }: { label: string; avg: number | null; max: number | null }) {
  const pct = max && avg ? Math.min((avg / max) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {avg !== null ? `${avg} س` : "N/A"}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function WorkflowAdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await checkSlaStatus("");
      if (result.success && result.data) {
        // Get org-specific data
        const adminResult = await getAdminDashboardMetrics("");
        if (adminResult.success && adminResult.data) {
          setData({
            ...adminResult.data,
            overdue: result.data.overdue,
          } as DashboardData);
        }
      } else {
        setError(result.error ?? "فشل تحميل البيانات");
      }
    } catch {
      setError("حدث خطأ أثناء تحميل لوحة التحكم");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportMetricsCSV("");
      if (result.success && result.data) {
        const blob = new Blob([result.data.content], {
          type: result.data.mimeType,
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.data.filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-12 text-destructive">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={fetchData}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const stepTypeMax = Math.max(
    ...data.stepBreakdown.map((s) => s.avgHours ?? 0),
    1,
  );
  const maxThroughput = Math.max(
    ...data.throughput.map((d) => Math.max(d.completed, d.created)),
    1,
  );

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">لوحة تحكم سير العمل</h1>
          <p className="text-sm text-muted-foreground mt-1">
            مقاييس الأداء والإنتاجية وسرعة الإنجاز
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-1 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
            ) : (
              <Download className="h-4 w-4 ml-1" />
            )}
            تصدير CSV
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="السجلات النشطة"
          value={data.metrics.totalActive}
          icon={<Activity className="h-5 w-5 text-blue-600" />}
          color="text-blue-600"
        />
        <MetricCard
          title="متأخرة"
          value={data.metrics.overdueCount}
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          color="text-amber-600"
          subtitle={data.metrics.overdueCount > 0 ? "بحاجة إلى متابعة" : undefined}
        />
        <MetricCard
          title="مكتملة اليوم"
          value={data.metrics.completedToday}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          color="text-green-600"
        />
        <MetricCard
          title="متوسط الإنجاز"
          value={
            data.avgCompletion.avgHours !== null
              ? `${data.avgCompletion.avgHours.toFixed(1)} س`
              : "N/A"
          }
          subtitle={
            data.avgCompletion.recordCount > 0
              ? `من ${data.avgCompletion.recordCount} سجل`
              : undefined
          }
          icon={<Clock className="h-5 w-5 text-purple-600" />}
          color="text-purple-600"
        />
      </div>

      {/* SLA Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">الالتزام بـ SLA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {data.compliance.complianceRate}%
              </p>
              <p className="text-sm text-muted-foreground">نسبة الالتزام</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-xl font-bold text-green-600">
                  {data.compliance.onTime}
                </p>
                <p className="text-xs text-muted-foreground">في الوقت</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-600">
                  {data.compliance.breached}
                </p>
                <p className="text-xs text-muted-foreground">مخالفة</p>
              </div>
            </div>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${data.compliance.complianceRate}%` }}
            />
          </div>
          {Object.keys(data.compliance.byPriority).length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(data.compliance.byPriority).map(
                ([priority, stats]) => (
                  <div key={priority} className="p-2 rounded bg-muted/50">
                    <p className="text-xs font-medium">
                      {PRIORITY_LABELS[priority] ?? priority}
                    </p>
                    <p className="text-sm font-bold">
                      {stats.rate}%
                      <span className="text-xs text-muted-foreground mr-1">
                        ({stats.onTime}/{stats.total})
                      </span>
                    </p>
                  </div>
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Step Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">متوسط الوقت لكل خطوة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.stepBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد بيانات كافية
              </p>
            ) : (
              data.stepBreakdown.map((step) => (
                <StepBar
                  key={step.stepType}
                  label={STEP_TYPE_LABELS[step.stepType] ?? step.stepType}
                  avg={step.avgHours}
                  max={stepTypeMax}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Throughput Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">الإنتاجية اليومية</CardTitle>
          </CardHeader>
          <CardContent>
            {data.throughput.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد بيانات كافية
              </p>
            ) : (
              <div className="space-y-2">
                {data.throughput.map((day) => (
                  <div key={day.date} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {new Date(day.date).toLocaleDateString("ar-SA", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-muted-foreground">
                        {day.completed} / {day.created}
                      </span>
                    </div>
                    <div className="flex gap-1 h-4">
                      <div
                        className="bg-green-500 rounded-r"
                        style={{
                          width: `${(day.completed / maxThroughput) * 100}%`,
                          minWidth: day.completed > 0 ? "4px" : "0",
                        }}
                        title={`تم إنجاز ${day.completed}`}
                      />
                      <div
                        className="bg-blue-500 rounded-l"
                        style={{
                          width: `${(day.created / maxThroughput) * 100}%`,
                          minWidth: day.created > 0 ? "4px" : "0",
                        }}
                        title={`تم إنشاء ${day.created}`}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex gap-4 pt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-green-500" />
                    مكتمل
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-blue-500" />
                    منشأ
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
