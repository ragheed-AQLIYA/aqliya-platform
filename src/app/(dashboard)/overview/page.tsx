import "server-only";
import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  Globe,
  KanbanSquare,
  TrendingUp,
  ArrowLeft,
  Building2,
  ScrollText,
  HeartPulse,
  Bell,
} from "lucide-react";
import { getPlatformHealthAction } from "@/actions/platform-overview-actions";
import {
  getPlatformProductCounts,
  getRecentProductActivity,
} from "@/actions/dashboard-read-actions";
import { OverviewClient } from "./overview-client";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";

// ─── Types ────────────────────────────────────────────────────────────────

type MetricCardProps = {
  label: string;
  labelAr: string;
  value: number | string;
  icon: React.ReactNode;
  href: string;
  color: string;
};

// ─── Metric card ──────────────────────────────────────────────────────────

function MetricCard({ label, labelAr, value, icon, href, color }: MetricCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-1.5 rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={color}>{icon}</span>
        <span className="truncate">{labelAr}</span>
        <span dir="ltr" className="text-[10px] text-muted-foreground/50 mr-auto">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {typeof value === "number" ? value.toLocaleString("ar-SA") : value}
        </span>
        <ArrowLeft className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors mr-auto" />
      </div>
    </Link>
  );
}

// ─── Health card ──────────────────────────────────────────────────────────

function HealthCard({
  healthScore,
  status,
  aiRunsToday,
  pendingReviews,
  failedWorkflows,
  activeUsersToday,
  auditEventsToday,
}: {
  healthScore: number;
  status: string;
  aiRunsToday: number;
  pendingReviews: number;
  failedWorkflows: number;
  activeUsersToday: number;
  auditEventsToday: number;
}) {
  const statusIcon =
    status === "healthy" ? "🟢" : status === "warning" ? "🟡" : "🔴";
  const statusAr =
    status === "healthy"
      ? "سليم"
      : status === "warning"
        ? "تحذير"
        : "حرج";
  const borderColor =
    status === "healthy"
      ? "border-green-500/30"
      : status === "warning"
        ? "border-amber-500/30"
        : "border-red-500/30";
  const bgColor =
    status === "healthy"
      ? "bg-green-50 dark:bg-green-950/20"
      : status === "warning"
        ? "bg-amber-50 dark:bg-amber-950/20"
        : "bg-red-50 dark:bg-red-950/20";

  return (
    <div
      className={`rounded-xl border-2 ${borderColor} ${bgColor} p-5 shadow-sm transition-all`}
    >
      <div className="flex items-center gap-3 mb-4">
        <HeartPulse className="h-6 w-6 text-foreground" />
        <div>
          <h2 className="text-base font-semibold">صحة المنصة</h2>
          <p className="text-[11px] text-muted-foreground">Platform Health</p>
        </div>
        <div className="mr-auto flex items-center gap-2">
          <span className="text-2xl font-bold">{statusIcon}</span>
          <span className="text-lg font-bold">{healthScore}%</span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              status === "healthy"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : status === "warning"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {statusAr}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <HealthStat label="تشغيلات الذكاء" value={aiRunsToday} />
        <HealthStat label="مراجعات معلقة" value={pendingReviews} />
        <HealthStat label="إجراءات فاشلة" value={failedWorkflows} />
        <HealthStat label="المستخدمين النشطين" value={activeUsersToday} />
        <HealthStat label="أحداث التدقيق" value={auditEventsToday} />
      </div>
    </div>
  );
}

function HealthStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-background/60 dark:bg-background/10 p-2.5 text-center">
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export default async function PlatformOverview() {
  // Auth
  try {
    await getCurrentUser();
  } catch {
    redirect("/login");
  }

  // ── Platform health ─────────────────────────────────────────────────────
  const health = await getPlatformHealthAction();

  // ── Product counts ──────────────────────────────────────────────────────
  const [
    { decisionCount, salesDealCount, workflowRecordCount, localContactCount, localContentProjectCount, totalAuditEvents },
    { recentDecisions, recentSalesDeals },
  ] = await Promise.all([
    getPlatformProductCounts(),
    getRecentProductActivity(),
  ]);

  const metrics: MetricCardProps[] = [
    {
      label: "Decisions",
      labelAr: "القرارات",
      value: decisionCount,
      icon: <Brain className="h-5 w-5" />,
      href: "/decisions",
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Sales Deals",
      labelAr: "صفقات المبيعات",
      value: salesDealCount,
      icon: <TrendingUp className="h-5 w-5" />,
      href: "/sales",
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Workflows",
      labelAr: "سجلات سير العمل",
      value: workflowRecordCount,
      icon: <KanbanSquare className="h-5 w-5" />,
      href: "/workflowos",
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      label: "Local Contacts",
      labelAr: "جهات الاتصال المؤسسية",
      value: localContactCount,
      icon: <Building2 className="h-5 w-5" />,
      href: "/contacts",
      color: "text-sky-600 dark:text-sky-400",
    },
    {
      label: "Local Content",
      labelAr: "مشاريع المحتوى المحلي",
      value: localContentProjectCount,
      icon: <Globe className="h-5 w-5" />,
      href: "/local-content",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Audit Events",
      labelAr: "أحداث التدقيق",
      value: totalAuditEvents,
      icon: <ScrollText className="h-5 w-5" />,
      href: "/settings/audit-logs",
      color: "text-red-600 dark:text-red-400",
    },
    {
      label: "Notifications",
      labelAr: "التنبيهات",
      value: "→",
      icon: <Bell className="h-5 w-5" />,
      href: "/notifications",
      color: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <OverviewClient>
      <div className="space-y-8" dir="rtl">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              لوحة المنصة الموحدة
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              نظرة شاملة على جميع منتجات AQLIYA — القرارات، المبيعات، سير العمل، المحتوى المحلي، وجهات الاتصال
            </p>
          </div>
          <Link
            href="/notifications"
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <Bell className="h-3.5 w-3.5" />
            مركز التنبيهات
          </Link>
        </div>

        {/* ── Health Card ────────────────────────────────────────────────── */}
        <HealthCard
          healthScore={health.healthScore}
          status={health.status}
          aiRunsToday={health.aiRunsToday}
          pendingReviews={health.pendingReviews}
          failedWorkflows={health.failedWorkflows}
          activeUsersToday={health.activeUsersToday}
          auditEventsToday={health.auditEventsToday}
        />

        {/* ── Metrics Grid ────────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* ── Summary Cards ────────────────────────────────────────────────── */}
        <Suspense fallback={<div className="animate-pulse rounded-xl bg-muted p-8" />}>
          <SummaryCards />
        </Suspense>

        {/* ── Activity Feed + Quick Actions ──────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="animate-pulse rounded-xl bg-muted p-8" />}>
              <ActivityFeed />
            </Suspense>
          </div>
          <div className="space-y-4">
            <QuickActions />

            {/* Recent Decisions */}
            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-purple-600" />
                <h2 className="text-sm font-semibold">آخر القرارات</h2>
                <Link
                  href="/decisions"
                  className="mr-auto text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  عرض الكل
                </Link>
              </div>
              {recentDecisions.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">لا توجد قرارات بعد</p>
              ) : (
                <div className="space-y-1">
                  {recentDecisions.map((d) => (
                    <Link
                      key={d.id}
                      href={`/decisions/${d.id}`}
                      className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-muted/50 transition-colors"
                    >
                      <Brain className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{d.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(d.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Sales Deals */}
            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-semibold">آخر صفقات المبيعات</h2>
                <Link
                  href="/sales"
                  className="mr-auto text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  عرض الكل
                </Link>
              </div>
              {recentSalesDeals.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">لا توجد صفقات بعد</p>
              ) : (
                <div className="space-y-1">
                  {recentSalesDeals.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm"
                    >
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{d.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </OverviewClient>
  );
}
