"use client";

import type { PlatformHealth } from "@/actions/platform-overview-actions";
import type { QueueStats, DatabaseStats, AuditEventEntry, SystemPerformance } from "@/actions/operator-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  Users,
  Building2,
  ScrollText,
  Brain,
  ShieldCheck,
  Timer,
  HardDrive,
  AlertTriangle,
  Layers,
} from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────

type Props = {
  health: PlatformHealth | null;
  queue: QueueStats | null;
  db: DatabaseStats | null;
  recentEvents: AuditEventEntry[];
  performance: SystemPerformance | null;
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatArabicDate(date: Date): string {
  return date.toLocaleString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function displayValue(value: number | null | undefined, suffix = ""): string {
  if (value === null || value === undefined) return "غير متاح";
  return value.toLocaleString("ar-SA") + (suffix ? ` ${suffix}` : "");
}

// ─── Health Score Circle ───────────────────────────────────────────────────

function HealthScoreCircle({ health }: { health: PlatformHealth | null }) {
  const score = health?.healthScore ?? 0;
  const status = health?.status ?? "critical";
  const color =
    status === "healthy"
      ? "text-green-600 stroke-green-500"
      : status === "warning"
        ? "text-amber-600 stroke-amber-500"
        : "text-red-600 stroke-red-500";
  const bgColor =
    status === "healthy"
      ? "text-green-200"
      : status === "warning"
        ? "text-amber-200"
        : "text-red-200";
  const labelAr =
    status === "healthy" ? "سليم" : status === "warning" ? "تحذير" : "حرج";
  const labelBg =
    status === "healthy"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : status === "warning"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

  if (!health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            صحة المنصة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">غير متاح</p>
        </CardContent>
      </Card>
    );
  }

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          صحة المنصة
          <span className="mr-auto">
            <Badge className={labelBg}>{labelAr}</Badge>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="relative">
            <svg width="140" height="140" className="transform -rotate-90">
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className={bgColor}
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={`${color} transition-all duration-700`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-bold ${color}`}>{score}%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full text-center text-xs">
            <div>
              <p className="text-muted-foreground">تشغيلات الذكاء</p>
              <p className="font-semibold">{health.aiRunsToday}</p>
            </div>
            <div>
              <p className="text-muted-foreground">مراجعات معلقة</p>
              <p className="font-semibold">{health.pendingReviews}</p>
            </div>
            <div>
              <p className="text-muted-foreground">إجراءات فاشلة</p>
              <p className="font-semibold">{health.failedWorkflows}</p>
            </div>
            <div>
              <p className="text-muted-foreground">مستخدمين نشطين</p>
              <p className="font-semibold">{health.activeUsersToday}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  labelEn,
  value,
  icon,
  color,
}: {
  label: string;
  labelEn: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className={color}>{icon}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{labelEn}</p>
      </CardContent>
    </Card>
  );
}

// ─── Queue Status ──────────────────────────────────────────────────────────

function QueueStatusCard({ queue }: { queue: QueueStats | null }) {
  const items = queue
    ? [
        { label: "في الانتظار", value: queue.totalQueued, color: "text-blue-600" },
        { label: "مكتمل", value: queue.totalCompleted, color: "text-green-600" },
        { label: "فاشل", value: queue.totalFailed, color: "text-red-600" },
        { label: "نشط", value: queue.activeJobs, color: "text-amber-600" },
      ]
    : [
        { label: "في الانتظار", value: "غير متاح", color: "text-muted-foreground" },
        { label: "مكتمل", value: "غير متاح", color: "text-muted-foreground" },
        { label: "فاشل", value: "غير متاح", color: "text-muted-foreground" },
        { label: "نشط", value: "غير متاح", color: "text-muted-foreground" },
      ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          حالة قائمة الانتظار
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border p-3 text-center"
            >
              <p className={`text-xl font-bold ${item.color}`}>
                {typeof item.value === "number"
                  ? item.value.toLocaleString("ar-SA")
                  : item.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Performance Card ──────────────────────────────────────────────────────

function PerformanceCard({ perf }: { perf: SystemPerformance | null }) {
  const metrics = perf
    ? [
        { label: "زمن الاستجابة", value: `${perf.avgResponseTime}`, unit: "مللي", icon: Timer },
        { label: "معدل ذاكرة التخزين", value: `${perf.cacheHitRate}`, unit: "%", icon: HardDrive },
        { label: "معدل الأخطاء", value: `${perf.errorRate}`, unit: "%", icon: AlertTriangle },
      ]
    : [
        { label: "زمن الاستجابة", value: "غير متاح", unit: "", icon: Timer },
        { label: "معدل ذاكرة التخزين", value: "غير متاح", unit: "", icon: HardDrive },
        { label: "معدل الأخطاء", value: "غير متاح", unit: "", icon: AlertTriangle },
      ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          أداء النظام
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center gap-3 rounded-lg border p-3">
            <m.icon className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-semibold">{m.value}</p>
              <p className="text-xs text-muted-foreground">
                {m.label}
                {m.unit && (
                  <span className="text-[10px] text-muted-foreground/60 mr-1">
                    {m.unit}
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Recent Audit Events Table ─────────────────────────────────────────────

function RecentAuditEventsTable({ events }: { events: AuditEventEntry[] }) {
  return (
    <Card className="lg:col-span-2 xl:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="h-5 w-5" />
          آخر أحداث التدقيق
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ScrollText className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">لا توجد أحداث تدقيق بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الإجراء</TableHead>
                  <TableHead className="text-right">نوع الكيان</TableHead>
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="text-xs">
                        {event.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {event.entityType}
                    </TableCell>
                    <TableCell className="text-xs">
                      {event.userName || event.userId || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatArabicDate(event.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function OperatorDashboardClient({
  health,
  queue,
  db,
  recentEvents,
  performance,
}: Props) {
  return (
    <div className="space-y-6" dir="rtl">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          لوحة المشغل
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مؤشرات أداء المنصة وحالة الأنظمة — مشرف المنصة
        </p>
      </div>

      {/* ── 3-column grid ──────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Health Score */}
        <HealthScoreCircle health={health} />

        {/* Queue Status */}
        <QueueStatusCard queue={queue} />

        {/* Performance */}
        <PerformanceCard perf={performance} />
      </div>

      {/* ── Summary Stats ──────────────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="المستخدمين"
          labelEn="Users"
          value={displayValue(db?.userCount)}
          icon={<Users className="h-4 w-4" />}
          color="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="المؤسسات"
          labelEn="Organizations"
          value={displayValue(db?.organizationCount)}
          icon={<Building2 className="h-4 w-4" />}
          color="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          label="سجلات التدقيق"
          labelEn="Audit Logs"
          value={displayValue(db?.totalAuditLogEntries)}
          icon={<ScrollText className="h-4 w-4" />}
          color="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="القرارات"
          labelEn="Decisions"
          value={displayValue(db?.totalDecisions)}
          icon={<Brain className="h-4 w-4" />}
          color="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="المهام"
          labelEn="Engagements"
          value={displayValue(db?.totalEngagements)}
          icon={<ShieldCheck className="h-4 w-4" />}
          color="text-rose-600 dark:text-rose-400"
        />
      </div>

      {/* ── Recent Audit Events (full width) ───────────────────────────── */}
      <RecentAuditEventsTable events={recentEvents} />
    </div>
  );
}
